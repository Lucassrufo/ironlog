# IronLog Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the current local-first IronLog app reliable enough for day-to-day workout logging.

**Architecture:** Add tested utility modules for workout metrics, date periods, storage parsing, profile validation, and plan selection. Update context and screens to consume those utilities while preserving the current React Native and Expo structure.

**Tech Stack:** Expo 54, React Native 0.81, TypeScript strict mode, AsyncStorage, React Navigation, Vitest for focused unit tests.

**Spec:** `docs/superpowers/specs/2026-09-17-ironlog-stability-design.md`

## Global Constraints

- Keep all data local; do not add backend, account, or remote sync.
- Do not remove the user's existing untracked app files or README edits.
- Prefer focused utility functions over large screen-only logic.
- Use TDD for behavior changes that can be tested outside React Native UI.
- Run `npm run test` and `npm run typecheck` before final status.

---

### Task 1: Test Harness And Core Utilities

**Files:**
- Modify: `package.json`
- Create: `src/utils/workoutMetrics.ts`
- Create: `src/utils/datePeriods.ts`
- Create: `src/utils/storageValidation.ts`
- Create: `src/utils/profileValidation.ts`
- Create: `src/utils/planPreferences.ts`
- Test: `src/utils/__tests__/workoutMetrics.test.ts`
- Test: `src/utils/__tests__/datePeriods.test.ts`
- Test: `src/utils/__tests__/storageValidation.test.ts`
- Test: `src/utils/__tests__/profileValidation.test.ts`
- Test: `src/utils/__tests__/planPreferences.test.ts`

**Interfaces:**
- Produces `calculateWorkoutTotals`, `inferExerciseMeasureType`, `createSessionRecords`, `getLocalDateKey`, `getPeriodRange`, `filterRecordsByRange`, `safeParseStoredValue`, `validateProfileInput`, and `limitPlansForUser`.

- [ ] Write failing utility tests.
- [ ] Install Vitest and add `npm run test`.
- [ ] Implement the utility modules.
- [ ] Run the focused tests and keep them green.

### Task 2: User Context Reliability

**Files:**
- Modify: `src/types/models.ts`
- Modify: `src/context/UserContext.tsx`
- Test: utility tests from Task 1 cover data contracts.

**Interfaces:**
- Consumes Task 1 utilities.
- Produces active workout draft APIs: `activeWorkoutDraft`, `saveActiveWorkoutDraft`, `clearActiveWorkoutDraft`, and duplicate-safe `completeWorkout`.

- [ ] Add active workout draft types.
- [ ] Hydrate user, records, posts, and active draft with validation fallback.
- [ ] Save completion using a session id and clear the active draft only after successful persistence.
- [ ] Keep UI state consistent when persistence fails.

### Task 3: Active Workout Recovery And Metrics

**Files:**
- Modify: `src/screens/ActiveWorkoutScreen.tsx`
- Modify: `src/screens/DashboardScreen.tsx`

**Interfaces:**
- Consumes Task 2 active draft APIs and Task 1 metric helpers.

- [ ] Restore matching active workout draft on screen load.
- [ ] Autosave sets, notes, photo, current exercise, and start time.
- [ ] Confirm leaving when the current workout has saved changes.
- [ ] Allow finishing partial workouts with completed sets only.
- [ ] Disable finish while saving and show recovery-friendly errors.
- [ ] Surface calories as an estimate.

### Task 4: Progress, Summary, Schedule, And Profile Fixes

**Files:**
- Modify: `src/screens/ProgressScreen.tsx`
- Modify: `src/screens/WorkoutSummaryScreen.tsx`
- Modify: `src/screens/WorkoutScheduleScreen.tsx`
- Modify: `src/screens/ProfileScreen.tsx`

**Interfaces:**
- Consumes Task 1 date, metrics, and profile validation helpers.

- [ ] Make progress tabs and arrows change the active period.
- [ ] Apply the selected period to totals and chart data.
- [ ] Use local date keys and real month labels.
- [ ] Show distinct summary metrics for exercises, sets, max load, reps, duration, and volume.
- [ ] Make profile history cards open the workout summary.
- [ ] Validate profile fields before saving.

### Task 5: Training Hub And Plan Preferences

**Files:**
- Modify: `src/types/navigation.ts`
- Modify: `src/screens/DashboardScreen.tsx`
- Modify: `src/screens/TrainingHubScreen.tsx`
- Modify: `src/screens/WorkoutScheduleScreen.tsx`
- Modify: `src/data/workouts.ts`

**Interfaces:**
- Consumes `limitPlansForUser`.

- [ ] Let Dashboard accept an optional initial workout index.
- [ ] Make Training Hub cards open the selected plan.
- [ ] Add an agenda entry point.
- [ ] Limit visible/scheduled plans by the user's chosen days per week.
- [ ] Clearly mark quick workout and favorites as coming soon until a full builder exists.

### Task 6: Documentation And Verification

**Files:**
- Modify: `README.md`
- Modify: `RELATORIO_SISTEMA.md`

- [ ] Update run instructions and the corrected behavior list.
- [ ] Run `npm run test`.
- [ ] Run `npm run typecheck`.
- [ ] Review `git diff` and summarize changed files.
