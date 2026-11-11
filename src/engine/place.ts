/**
 * Placement engine for Habit minimums (L1), Urgent tasks (L2), and Normal tasks (L3).
 * Pure TypeScript logic.
 * Source: brain/03_SCHEDULING_RULES.md (Sections 2, 3, 4)
 */

import type { Block, HabitId, Importance, Layer, Settings } from '../types';
import type { TimeWindow } from './freeWindows';
import { DEFAULT_TRANSITION_BUFFER_MIN, DEFAULT_MIN_BLOCK_MIN } from './constants';

export interface PlaceableItem {
  id: string;
  kind: 'habit' | 'task';
  title: string;
  habitId?: HabitId;
  taskId?: string;
  durationMin: number;
  layer: Layer; // L1 (habit min), L2 (urgent task), L3 (normal task)
  importance?: Importance;
  deadline?: string;
  fixedStart?: number; // specific fixed start time if requested
  preferredStart?: number;
  latestStart?: number; // e.g. gym 20:30 (1230)
  isMinimum?: boolean;
  protected?: boolean;
  reason?: string;
}

export interface PlacementResult {
  placedBlocks: Block[];
  remainingFreeWindows: TimeWindow[];
  unplacedItems: PlaceableItem[];
}

/**
 * Places items into available free windows adhering to priority,
 * preferred windows, latest start constraints, and transition buffers.
 */
export function placeItems(
  freeWindows: TimeWindow[],
  items: PlaceableItem[],
  settings: Settings,
  _now: number
): PlacementResult {
  const transitionBuffer = settings.transitionBufferMin ?? DEFAULT_TRANSITION_BUFFER_MIN;
  const minBlock = settings.minBlockMin ?? DEFAULT_MIN_BLOCK_MIN;

  let currentWindows: TimeWindow[] = freeWindows.map((w) => ({ ...w }));
  const placedBlocks: Block[] = [];
  const unplacedItems: PlaceableItem[] = [];

  // Separate fixed-start items from flexible items
  const fixedStartItems = items.filter((item) => item.fixedStart !== undefined);
  const flexibleItems = items.filter((item) => item.fixedStart === undefined);

  // 1. Place fixedStart items first
  for (const item of fixedStartItems) {
    const start = item.fixedStart!;
    const end = start + item.durationMin;

    // Check if [start, end] fits within one of the free windows
    const winIdx = currentWindows.findIndex((w) => w.start <= start && w.end >= end);
    if (winIdx !== -1) {
      const win = currentWindows[winIdx];
      placedBlocks.push({
        id: item.id,
        kind: item.kind,
        title: item.title,
        habitId: item.habitId,
        taskId: item.taskId,
        start,
        end,
        layer: item.layer,
        status: 'planned',
        pinned: true,
        isMinimum: item.isMinimum,
        protected: item.protected,
        reason: item.reason,
      });

      // Split window around placed item
      const newWindows: TimeWindow[] = [];
      if (start - win.start >= minBlock) {
        newWindows.push({ start: win.start, end: start });
      }
      if (win.end - end >= minBlock) {
        newWindows.push({ start: end, end: win.end });
      }

      currentWindows.splice(winIdx, 1, ...newWindows);
    } else {
      unplacedItems.push(item);
    }
  }

  // 2. Sort flexible items by scheduling priority:
  // - Urgent tasks with deadline today (L2) and Habit minimums (L1)
  // - For tasks: earlier deadline, higher importance, shorter duration
  // - For habits: Gym (prio 1) > DSA (prio 2) > AIML (prio 3)
  const sortedItems = [...flexibleItems].sort((a, b) => {
    // Layer priority: L1 and L2 over L3
    const layerScore = (layer: Layer) => {
      if (layer === 'L1') return 1;
      if (layer === 'L2') return 1;
      return 2;
    };

    const diff = layerScore(a.layer) - layerScore(b.layer);
    if (diff !== 0) return diff;

    // Between habits: priority order
    if (a.kind === 'habit' && b.kind === 'habit') {
      const habitPrio = (id?: HabitId) => {
        if (id === 'gym') return 1;
        if (id === 'dsa') return 2;
        if (id === 'aiml') return 3;
        return 4;
      };
      return habitPrio(a.habitId) - habitPrio(b.habitId);
    }

    // Between tasks: importance and duration
    if (a.kind === 'task' && b.kind === 'task') {
      const impScore = (imp?: Importance) => {
        if (imp === 'urgent') return 1;
        if (imp === 'high') return 2;
        if (imp === 'normal') return 3;
        return 4;
      };
      const impDiff = impScore(a.importance) - impScore(b.importance);
      if (impDiff !== 0) return impDiff;
      return a.durationMin - b.durationMin;
    }

    // Urgent task vs Habit: Urgent tasks with deadline today get placed in free window
    if (a.layer === 'L2' && b.layer === 'L1') return -1;
    if (a.layer === 'L1' && b.layer === 'L2') return 1;

    return 0;
  });

  // 3. Place flexible items into windows
  for (const item of sortedItems) {
    const placed = placeSingleItem(item, currentWindows, transitionBuffer, minBlock);
    if (placed) {
      placedBlocks.push(placed.block);
      currentWindows = placed.remainingWindows;
    } else {
      unplacedItems.push(item);
    }
  }

  // Sort placed blocks chronologically
  placedBlocks.sort((a, b) => a.start - b.start);

  return {
    placedBlocks,
    remainingFreeWindows: currentWindows,
    unplacedItems,
  };
}

interface SinglePlacementResult {
  block: Block;
  remainingWindows: TimeWindow[];
}

function placeSingleItem(
  item: PlaceableItem,
  windows: TimeWindow[],
  transitionBuffer: number,
  minBlock: number
): SinglePlacementResult | null {
  if (windows.length === 0) return null;

  // Find candidate windows that can fit item.durationMin
  const candidateIndices: number[] = [];
  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    const capacity = w.end - w.start;
    if (capacity >= item.durationMin) {
      // Check latestStart constraint if present (e.g. Gym avoid starting after 20:30)
      if (item.latestStart !== undefined && w.start > item.latestStart) {
        continue;
      }
      candidateIndices.push(i);
    }
  }

  if (candidateIndices.length === 0) {
    return null;
  }

  // Choose best window:
  // If preferredStart is given, find window closest to it;
  // otherwise choose the earliest suitable window.
  let bestIdx = candidateIndices[0];

  if (item.preferredStart !== undefined) {
    let bestDist = Infinity;
    for (const idx of candidateIndices) {
      const w = windows[idx];
      // Distance from window start to preferredStart
      const dist = Math.abs(w.start - item.preferredStart);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    }
  }

  const targetWindow = windows[bestIdx];

  // Determine placement start within targetWindow:
  // If preferredStart falls inside window and still has room for full duration, align with it;
  // otherwise start at targetWindow.start
  let start = targetWindow.start;
  if (
    item.preferredStart !== undefined &&
    item.preferredStart >= targetWindow.start &&
    item.preferredStart + item.durationMin <= targetWindow.end
  ) {
    start = item.preferredStart;
  }

  // Respect latestStart constraint (e.g. gym must not start after 20:30)
  if (item.latestStart !== undefined && start > item.latestStart) {
    return null;
  }

  const end = start + item.durationMin;

  const block: Block = {
    id: item.id,
    kind: item.kind,
    title: item.title,
    habitId: item.habitId,
    taskId: item.taskId,
    start,
    end,
    layer: item.layer,
    status: 'planned',
    pinned: false,
    isMinimum: item.isMinimum,
    protected: item.protected,
    reason: item.reason,
  };

  // Compute remaining windows around placed block
  // If block duration >= 90 min, add transition buffer if space allows
  const effectiveEnd =
    item.durationMin >= 90 ? Math.min(targetWindow.end, end + transitionBuffer) : end;

  const newWindows: TimeWindow[] = [];
  // Gap before block
  if (start - targetWindow.start >= minBlock) {
    newWindows.push({ start: targetWindow.start, end: start });
  }
  // Gap after block
  if (targetWindow.end - effectiveEnd >= minBlock) {
    newWindows.push({ start: effectiveEnd, end: targetWindow.end });
  }

  const remainingWindows = [...windows];
  remainingWindows.splice(bestIdx, 1, ...newWindows);
  remainingWindows.sort((a, b) => a.start - b.start);

  return { block, remainingWindows };
}
