/**
 * Replan Orchestrator
 * Pure TypeScript logic.
 * Source: brain/03_SCHEDULING_RULES.md
 *
 * replan(input: ReplanInput): ReplanResult
 * Deterministic: zero imports from React, DOM, storage, or Date. "now" is injected.
 */

import type {
  Block,
  HabitId,
  ReplanInput,
  ReplanResult,
  TemplateBlock,
} from '../types';
import { applyDayMode } from './modes';
import { findFreeWindows } from './freeWindows';
import { placeItems, type PlaceableItem } from './place';
import { extendHabits } from './extend';
import { detectConflicts } from './conflicts';
import { explainPlanDiff } from './explain';
import { DEFAULT_SETTINGS } from './constants';

export function replan(input: ReplanInput): ReplanResult {
  const {
    date,
    now,
    dayConfig,
    template,
    loggedBlocks = [],
    tasks = [],
    habitLog = [],
    settings = DEFAULT_SETTINGS,
  } = input;

  const wake = settings.wake;
  const sleep = settings.sleep;

  // 1. Determine which habits are protected by "never miss twice"
  // If a habit was missed on the last applicable day before today, it is protected today.
  const protectedHabitIds: HabitId[] = [];
  const habitsToCheck: HabitId[] = ['gym', 'dsa', 'aiml'];

  for (const hid of habitsToCheck) {
    const pastEntries = habitLog
      .filter((e) => e.habitId === hid && e.date < date)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (pastEntries.length > 0) {
      const lastEntry = pastEntries[0];
      if (!lastEntry.metMinimum && lastEntry.status === 'skipped') {
        protectedHabitIds.push(hid);
      }
    }
  }

  // 2. Build base blocks from template and apply day mode transformations
  const transformedTemplateBlocks: TemplateBlock[] = applyDayMode({
    baseBlocks: template.blocks,
    mode: dayConfig.mode,
    partial: dayConfig.partial,
    habits: settings.habits,
    collegeTravelMin: settings.collegeTravelMin,
  });

  // Convert template blocks to concrete Blocks with unique IDs
  const baseBlocks: Block[] = transformedTemplateBlocks.map((tb, idx) => ({
    id: `base-${tb.kind}-${tb.habitId ?? tb.title.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
    ...tb,
    status: 'planned',
    protected: tb.habitId ? protectedHabitIds.includes(tb.habitId) : false,
  }));

  // 3. Partition past/in-progress blocks vs future blocks
  // Past is locked: anything ending <= now is frozen.
  const pastBlocks: Block[] = [];
  const inProgressBlocks: Block[] = [];
  const futureBaseBlocks: Block[] = [];

  for (const block of baseBlocks) {
    const logged = loggedBlocks.find(
      (lb) => lb.id === block.id || (lb.habitId && lb.habitId === block.habitId)
    );

    const activeBlock: Block = logged
      ? { ...block, status: logged.status, start: logged.start, end: logged.end }
      : { ...block };

    if (activeBlock.end <= now) {
      if (activeBlock.status === 'planned') {
        activeBlock.status = 'done';
      }
      pastBlocks.push(activeBlock);
    } else if (activeBlock.start < now && activeBlock.end > now) {
      if (activeBlock.status === 'planned') {
        activeBlock.status = 'in_progress';
      }
      inProgressBlocks.push(activeBlock);
    } else {
      futureBaseBlocks.push(activeBlock);
    }
  }

  // Include user logged blocks from the past that were not in base template
  for (const lb of loggedBlocks) {
    const exists = [...pastBlocks, ...inProgressBlocks].some((b) => b.id === lb.id);
    if (!exists && lb.end <= now) {
      pastBlocks.push({ ...lb });
    }
  }

  // 4. Check if we need active re-planning
  const openTasksForToday = tasks.filter(
    (t) => t.status === 'open' && t.remainingMin > 0
  );

  const isBaseIntact =
    dayConfig.mode === 'normal' &&
    openTasksForToday.length === 0 &&
    inProgressBlocks.length === 0 &&
    protectedHabitIds.length === 0;

  if (isBaseIntact) {
    const allBlocks = [...pastBlocks, ...futureBaseBlocks].sort(
      (a, b) => a.start - b.start
    );

    const plannedHabitMin = allBlocks
      .filter((b) => b.kind === 'habit')
      .reduce((sum, b) => sum + (b.end - b.start), 0);

    return {
      blocks: allBlocks,
      summary: [],
      conflicts: [],
      stats: {
        freeMin: 0,
        plannedHabitMin,
        plannedTaskMin: 0,
      },
    };
  }

  // 5. Active Re-planning
  // Truly immovable future blocks are College, rides to/from college, meals (L0), and user-pinned tasks
  const isImmovable = (b: Block) => {
    if (b.pinned) return true;
    const title = b.title.toLowerCase();
    if (title === 'college' || title === 'ride to college') {
      return true;
    }
    if (title === 'ride home' && b.kind === 'fixed') {
      return true;
    }
    if (title === 'dinner' || title.includes('lunch') || title.includes('breakfast')) {
      return true;
    }
    return false;
  };

  const lockedL0Blocks: Block[] = [
    ...pastBlocks,
    ...inProgressBlocks,
    ...futureBaseBlocks.filter(isImmovable),
  ];

  // Compute available free windows between immovable blocks
  const freeWindows = findFreeWindows({
    wake,
    sleep,
    now,
    fixedBlocks: lockedL0Blocks,
    minDuration: settings.minBlockMin,
  });

  // Collect items to place:
  const itemsToPlace: PlaceableItem[] = [];

  // A. Tasks for today
  for (const task of openTasksForToday) {
    const isUrgent =
      task.importance === 'urgent' ||
      (task.deadline && task.deadline.startsWith(date));

    itemsToPlace.push({
      id: `task-${task.id}`,
      kind: 'task',
      title: task.title,
      taskId: task.id,
      durationMin: task.remainingMin,
      layer: isUrgent ? 'L2' : 'L3',
      importance: task.importance,
      deadline: task.deadline,
      fixedStart:
        task.fixedStart && task.fixedStart.date === date
          ? task.fixedStart.start
          : undefined,
    });
  }

  // B. Habits that are not done in past and not currently in progress
  const doneHabitIds = new Set(
    pastBlocks.filter((b) => b.kind === 'habit' && b.status === 'done').map((b) => b.habitId)
  );
  const inProgressHabitIds = new Set(
    inProgressBlocks.filter((b) => b.kind === 'habit').map((b) => b.habitId)
  );

  for (const fb of futureBaseBlocks) {
    if (
      fb.kind === 'habit' &&
      fb.habitId &&
      !doneHabitIds.has(fb.habitId) &&
      !inProgressHabitIds.has(fb.habitId)
    ) {
      const habitConfig = settings.habits.find((h) => h.id === fb.habitId);
      const minDuration = habitConfig ? habitConfig.minMin : 30;
      const isProtected = protectedHabitIds.includes(fb.habitId);

      itemsToPlace.push({
        id: fb.id,
        kind: 'habit',
        title: fb.title,
        habitId: fb.habitId,
        durationMin: minDuration,
        layer: 'L1',
        preferredStart: fb.start,
        latestStart: habitConfig?.latestStart,
        isMinimum: true,
        protected: isProtected,
      });
    }
  }

  // Place items into free windows
  const placement = placeItems(freeWindows, itemsToPlace, settings, now);

  // Extend habits using remaining free time (L4)
  const extension = extendHabits({
    blocks: placement.placedBlocks,
    freeWindows: placement.remainingFreeWindows,
    habitsConfig: settings.habits,
    sleep,
    mode: dayConfig.mode,
    windDownMin: settings.windDownMin,
  });

  // Calculate remaining free minutes
  const totalRemainingFree = extension.remainingFreeWindows.reduce(
    (sum, w) => sum + (w.end - w.start),
    0
  );

  // Detect conflicts if any L1/L2 items could not be placed
  const scheduledHabits = extension.blocks
    .filter((b) => b.kind === 'habit' && b.habitId)
    .map((b) => b.habitId as HabitId);

  const conflicts = detectConflicts({
    unplacedItems: placement.unplacedItems,
    availableFreeMin: totalRemainingFree,
    maxExtensionMin: settings.maxExtensionMin,
    scheduledHabits,
    protectedHabitIds,
  });

  // Assemble final block list
  const finalBlocks: Block[] = [
    ...pastBlocks,
    ...inProgressBlocks,
    ...lockedL0Blocks.filter((b) => b.start >= now),
    ...extension.blocks,
  ];

  // Fill leftover gaps with visible Free blocks
  for (const win of extension.remainingFreeWindows) {
    if (win.end - win.start >= settings.minBlockMin) {
      finalBlocks.push({
        id: `free-${win.start}-${win.end}`,
        kind: 'free',
        title: 'Free / rest',
        start: win.start,
        end: win.end,
        layer: 'L5',
        status: 'planned',
        pinned: false,
      });
    }
  }

  // Deduplicate and sort chronologically
  const uniqueBlocksMap = new Map<string, Block>();
  for (const b of finalBlocks) {
    uniqueBlocksMap.set(b.id, b);
  }
  const sortedBlocks = Array.from(uniqueBlocksMap.values()).sort(
    (a, b) => a.start - b.start
  );

  // Generate explainability summary lines
  const summary = explainPlanDiff({
    oldBlocks: baseBlocks,
    newBlocks: sortedBlocks,
    mode: dayConfig.mode,
    protectedHabitIds,
  });

  const plannedHabitMin = sortedBlocks
    .filter((b) => b.kind === 'habit')
    .reduce((sum, b) => sum + (b.end - b.start), 0);

  const plannedTaskMin = sortedBlocks
    .filter((b) => b.kind === 'task')
    .reduce((sum, b) => sum + (b.end - b.start), 0);

  return {
    blocks: sortedBlocks,
    summary,
    conflicts,
    stats: {
      freeMin: totalRemainingFree,
      plannedHabitMin,
      plannedTaskMin,
    },
  };
}
