# 00. Project Overview

## Problem
I have a good routine (college 6 days/week, gym 2 hrs, two recorded-lecture courses), but real life interrupts it: sudden assignments, surprise holidays, cancelled classes. Re-planning by hand wastes energy and usually ends with me skipping the gym or the courses entirely, which kills consistency.

## Solution
An adaptive planner. I tell it what changed (in a few taps), and it instantly rebuilds the **remaining** part of today so that:
1. Fixed commitments stay put.
2. Urgent work gets done.
3. My priorities (gym, Java DSA, AIML Python) are protected, at minimum size if time is tight.
4. I get a clear explanation of what changed and why.

## Goals
- G1: Re-plan today in under 1 second after any change.
- G2: Add a task in under 10 seconds (title, duration, deadline).
- G3: Declare a holiday or "college cancelled" in 2 taps.
- G4: Track streaks for Gym, DSA, AIML so consistency is visible.
- G5: Work well on my phone (mobile-first, installable PWA, works offline).

## Non-goals (v1)
- No accounts, login, or cloud sync.
- No calendar integration (Google Calendar etc.).
- No team or sharing features.
- No AI dependency for scheduling. AI is only an optional, last-phase helper for quick add (see `11_AI_QUICK_ADD.md`).

## Success criteria
- On a normal day the app shows my exact routine.
- Adding a 3-hour assignment at 2 pm produces a valid plan with gym and both courses still present (at least minimum size) or a clear, honest conflict message.
- Declaring a holiday produces a full-day plan that uses the freed college hours well.
- I can use it daily for 21 days without it getting in the way.

## Users
Single user: me (college student, Bhubaneswar, travels by bike). Optimise for one person, not generality.
