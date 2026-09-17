# IronLog Trainer And Student Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first zero-cost vertical slice for trainer/student login, web portal, assigned routines, synced workout sessions, and chat.

**Architecture:** Use Supabase Free as the backend contract and keep all credentials in `EXPO_PUBLIC_*` environment variables. Add a shared service layer so React Native screens and Expo Web screens use the same auth, profile, routine, session, dashboard, and chat logic.

**Tech Stack:** Expo 54, React Native 0.81, React 19, TypeScript strict mode, Supabase JS, AsyncStorage, Expo Web, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-17-ironlog-trainer-student-platform-design.md`

## Global Constraints

- No paid plans, billing account, paid hosting, paid SMS, paid email provider, paid server, or paid database.
- Use Supabase Free only through public anon client credentials.
- Never commit real Supabase keys.
- Keep legacy local workout functionality usable when Supabase env vars are missing.
- Trainer full experience is web-first; student full workout experience is app-first.
- Use tests for mapping, metrics, and service payload code that can run without a real Supabase project.

---

### Task 1: Supabase Contract And Shared Platform Models

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `supabase/migrations/20260917120000_trainer_student_platform.sql`
- Create: `src/types/platform.ts`
- Create: `src/services/supabase/client.ts`
- Create: `src/services/platform/platformMappers.ts`
- Test: `src/services/platform/__tests__/platformMappers.test.ts`

**Interfaces:**
- Produces `PlatformRole`, `PlatformProfile`, `PlatformRoutine`, `PlatformRoutineDay`, `PlatformRoutineExercise`, `AssignedRoutine`, `WorkoutSessionPayload`, `mapAssignedRoutineToWorkoutPlans`, `mapWorkoutRecordsToSessionPayload`, `getSupabaseConfigState`, and `supabase`.

- [ ] Write failing mapper tests for assigned routine conversion and session payload creation.
- [ ] Install no-cost dependencies: `@supabase/supabase-js`, `react-native-url-polyfill`, `react-dom`, and `react-native-web`.
- [ ] Add `.env.example` and ignore `.env`.
- [ ] Add SQL migration with tables, indexes, and RLS policies from the spec.
- [ ] Add shared platform types and mapper utilities.
- [ ] Add Supabase client with missing-config guard.
- [ ] Run focused tests.

### Task 2: Auth And Role State

**Files:**
- Create: `src/services/auth/authService.ts`
- Create: `src/context/AuthContext.tsx`
- Modify: `App.tsx`
- Modify: `src/types/navigation.ts`
- Modify: `src/navigation/AppNavigator.tsx`
- Create: `src/screens/auth/AuthLandingScreen.tsx`
- Create: `src/screens/auth/LoginScreen.tsx`
- Create: `src/screens/auth/RegisterScreen.tsx`
- Create: `src/screens/auth/SupabaseSetupScreen.tsx`
- Test: `src/services/auth/__tests__/authRouting.test.ts`

**Interfaces:**
- Produces `AuthProvider`, `useAuth`, `registerWithProfile`, `loginWithEmail`, `logout`, and `getInitialRouteForAuthState`.

- [ ] Write failing role routing tests.
- [ ] Implement auth service wrappers around Supabase Auth.
- [ ] Add auth context session hydration.
- [ ] Add auth/setup/login/register screens.
- [ ] Route missing Supabase config to setup instructions.
- [ ] Route authenticated trainers to web trainer portal and students to app dashboard.
- [ ] Run tests and typecheck.

### Task 3: Platform Services

**Files:**
- Create: `src/services/platform/profileService.ts`
- Create: `src/services/platform/routineService.ts`
- Create: `src/services/platform/studentService.ts`
- Create: `src/services/platform/sessionSyncService.ts`
- Create: `src/services/platform/chatService.ts`
- Create: `src/services/platform/dashboardService.ts`
- Test: `src/services/platform/__tests__/dashboardService.test.ts`
- Test: `src/services/platform/__tests__/sessionSyncService.test.ts`

**Interfaces:**
- Produces service functions used by portal and app screens. Raw Supabase calls stay inside these services.

- [ ] Write failing tests for dashboard metric calculation and queued session payload status.
- [ ] Implement profile fetch/update.
- [ ] Implement trainer student linking by email.
- [ ] Implement routines CRUD and assignment.
- [ ] Implement active assigned routine fetch for student.
- [ ] Implement session sync payload insert helpers.
- [ ] Implement chat thread/message helpers.
- [ ] Run tests and typecheck.

### Task 4: Web Portal Screens

**Files:**
- Create: `src/screens/platform/trainer/TrainerDashboardScreen.tsx`
- Create: `src/screens/platform/trainer/TrainerStudentsScreen.tsx`
- Create: `src/screens/platform/trainer/TrainerStudentDetailScreen.tsx`
- Create: `src/screens/platform/trainer/TrainerRoutinesScreen.tsx`
- Create: `src/screens/platform/trainer/TrainerRoutineEditorScreen.tsx`
- Create: `src/screens/platform/student/StudentPortalScreen.tsx`
- Create: `src/screens/platform/PlatformChatScreen.tsx`
- Modify: `src/types/navigation.ts`
- Modify: `src/navigation/AppNavigator.tsx`

**Interfaces:**
- Consumes AuthContext and platform services.

- [ ] Add trainer dashboard with zero-cost Supabase-backed metrics and empty states.
- [ ] Add linked students list and link-by-email form.
- [ ] Add student detail dashboard.
- [ ] Add routines list and routine editor.
- [ ] Add assignment action for linked students.
- [ ] Add student web dashboard.
- [ ] Add chat screen shared by trainer/student routes.
- [ ] Run typecheck.

### Task 5: Student App Uses Assigned Routine

**Files:**
- Modify: `src/context/UserContext.tsx`
- Modify: `src/screens/DashboardScreen.tsx`
- Modify: `src/screens/ActiveWorkoutScreen.tsx`
- Modify: `src/screens/WorkoutCompleteScreen.tsx`
- Modify: `src/data/workouts.ts` if helper export is needed.

**Interfaces:**
- Consumes assigned routine mapper and session sync service.

- [ ] Load student assigned routine when logged in as student and Supabase is configured.
- [ ] Display assigned routine in Dashboard when available.
- [ ] Start assigned routine through existing ActiveWorkout flow.
- [ ] Sync completed sessions to Supabase while preserving local history.
- [ ] Keep pending local sessions if sync fails.
- [ ] Run tests and typecheck.

### Task 6: Documentation And Verification

**Files:**
- Modify: `README.md`
- Modify: `RELATORIO_SISTEMA.md`

- [ ] Document Supabase Free setup and `.env` keys.
- [ ] Document no-cost limitations.
- [ ] Run `npm run test`.
- [ ] Run `npm run typecheck`.
- [ ] Report manual testing not performed unless actually run.
