# IronLog Trainer And Student Platform Design

## Goal

Turn IronLog from a local-first workout app into a zero-cost-start platform where trainers and students use the same account system, trainers manage student workouts from a web portal, and students use both the app and web dashboard with shared workout data.

## Hard Cost Constraint

The first version must not require any paid plan, billing account, paid hosting, paid SMS, paid email provider, paid server, or paid database.

Allowed services:

- Supabase Free for Auth, Postgres, Row Level Security, Realtime, and optional Storage.
- Local development through Expo and local web.
- Static or local web portal code inside this repository.

Not allowed in the first version:

- Phone/SMS login.
- Paid deployment.
- Paid push notification provider.
- Paid chat service.
- Custom server hosted on paid infrastructure.

If Supabase Free quotas are exceeded in the future, the product must degrade gracefully instead of silently creating paid usage. The first implementation should document quotas and keep usage small.

## Product Roles

### Visitor

Can register or log in from the web portal or mobile app.

Registration requires:

- Name.
- Email.
- Password.
- Role selection: trainer or student.

Role is stored once in `profiles.role`. Changing role later is an admin/manual operation, not a normal profile edit, to avoid a student granting themselves trainer access.

### Trainer

Trainer web access is the primary trainer experience.

Trainer can:

- See a general dashboard with total students, active students, workouts completed this week, total assigned routines, unread chat messages, and recent workout activity.
- Create, edit, archive, and duplicate workout routines.
- Create workout days inside routines.
- Create exercises/sets inside workout days.
- Assign a routine to a student.
- See a list of linked students.
- Open a student dashboard with that student's profile, assigned routine, recent sessions, volume trend, adherence, strongest exercises, and notes.
- Chat with linked students.

Trainer cannot:

- See students not linked to them.
- Edit another trainer's routines.
- Read another trainer's chats.

### Student

Student app access is the primary student workout experience. Student web access is a companion dashboard.

Student can:

- Log in with the same account on web and app.
- See the assigned routine.
- Start and complete assigned workouts in the mobile app.
- See their own web dashboard with results, history, volume, adherence, and active routine.
- Chat with their linked trainer.

Student cannot:

- Create trainer-owned routines.
- See another student's data.
- Assign themselves to a trainer without an invite/linking mechanism.

## Recommended MVP Scope

The full request is large, so the first working version should be built as a complete vertical slice:

1. Supabase client, environment variables, schema, and RLS policies.
2. Login/register on web and app with role selection.
3. Trainer portal shell and student portal shell.
4. Trainer can create a routine with workout days and exercises.
5. Trainer can link a student by email and assign one routine.
6. Student app can load assigned routine from Supabase and complete a workout.
7. Completed workout syncs to Supabase.
8. Trainer dashboard shows the student's completed sessions.
9. Basic realtime chat between linked trainer and student.

Features deferred after the first vertical slice:

- Full routine editor polish with drag-and-drop.
- Multiple trainers per student.
- Payments.
- Native push notifications.
- File/media storage beyond profile photo and workout photo.
- Offline conflict resolution beyond "save local draft, retry sync".
- Admin moderation panel.

## Technology Architecture

### Supabase

Supabase provides:

- Email/password Auth.
- Postgres database.
- Row Level Security.
- Realtime subscriptions for chat.

The app must use only the public anon key in client code. No service role key goes into the app, web bundle, repo, or `.env` committed file.

Required local environment variables:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

The repository will include `.env.example`, never real secrets.

### Mobile App

The existing Expo app remains the student-first mobile app.

Current local onboarding must become conditional:

- If not logged in: show Auth flow.
- If logged in and no profile/onboarding data: complete profile.
- If logged in as student: show student app using assigned routine when available.
- If logged in as trainer on mobile: show a simple trainer notice and link to web portal, not the full trainer UI.

The app keeps local draft support for active workouts. When online and authenticated, completed sessions sync to Supabase. If sync fails, the session remains queued locally and can be retried.

### Web Portal

The web portal should live in this repo and run with Expo Web where possible.

Because the current project lacks web dependencies, implementation must add the Expo web dependencies needed for local web:

- `react-dom`
- `react-native-web`

Portal routes:

- `/login`
- `/register`
- `/trainer`
- `/trainer/students`
- `/trainer/students/:id`
- `/trainer/routines`
- `/trainer/routines/:id`
- `/student`
- `/student/chat`

If React Navigation web URLs become too heavy for the first version, the first MVP can use screen state instead of deep links, as long as the trainer/student areas are functional locally.

### Shared Data Access Layer

Create a shared API layer:

- `src/services/supabase/client.ts`
- `src/services/auth/authService.ts`
- `src/services/platform/profileService.ts`
- `src/services/platform/routineService.ts`
- `src/services/platform/studentService.ts`
- `src/services/platform/sessionSyncService.ts`
- `src/services/platform/chatService.ts`

Screens should not call raw Supabase query chains everywhere. They should call service functions so tests can cover permissions, mapping, and offline behavior.

## Database Schema

### `profiles`

One row per auth user.

Columns:

- `id uuid primary key references auth.users(id)`
- `role text not null check (role in ('trainer', 'student'))`
- `name text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `trainer_students`

Links trainers to students.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trainer_id uuid not null references profiles(id)`
- `student_id uuid not null references profiles(id)`
- `status text not null check (status in ('active', 'archived')) default 'active'`
- `created_at timestamptz not null default now()`
- unique `(trainer_id, student_id)`

### `routines`

Trainer-owned routine template.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trainer_id uuid not null references profiles(id)`
- `title text not null`
- `description text`
- `status text not null check (status in ('draft', 'active', 'archived')) default 'draft'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `routine_days`

Days inside a routine.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `routine_id uuid not null references routines(id) on delete cascade`
- `position int not null`
- `title text not null`
- `focus text`
- unique `(routine_id, position)`

### `routine_exercises`

Exercises inside each routine day.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `routine_day_id uuid not null references routine_days(id) on delete cascade`
- `position int not null`
- `exercise_name text not null`
- `muscle_group text`
- `sets int not null`
- `reps int`
- `duration_seconds int`
- `load_kg numeric`
- `notes text`
- unique `(routine_day_id, position)`

### `routine_assignments`

Current assignment of routine to student.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trainer_id uuid not null references profiles(id)`
- `student_id uuid not null references profiles(id)`
- `routine_id uuid not null references routines(id)`
- `status text not null check (status in ('active', 'ended')) default 'active'`
- `assigned_at timestamptz not null default now()`

Only one active assignment per student should be enforced with a partial unique index.

### `workout_sessions`

Completed workout header.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `student_id uuid not null references profiles(id)`
- `trainer_id uuid references profiles(id)`
- `routine_id uuid references routines(id)`
- `routine_day_id uuid references routine_days(id)`
- `title text not null`
- `started_at timestamptz`
- `completed_at timestamptz not null default now()`
- `duration_seconds int not null default 0`
- `total_volume_kg numeric not null default 0`
- `total_reps int not null default 0`
- `work_seconds int not null default 0`
- `client_session_id text unique`

### `workout_session_sets`

Completed set details.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `session_id uuid not null references workout_sessions(id) on delete cascade`
- `exercise_name text not null`
- `muscle_group text`
- `set_number int not null`
- `reps int`
- `duration_seconds int`
- `load_kg numeric`
- `completed boolean not null default true`
- `notes text`

### `chat_threads`

One thread per trainer/student pair.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trainer_id uuid not null references profiles(id)`
- `student_id uuid not null references profiles(id)`
- `created_at timestamptz not null default now()`
- unique `(trainer_id, student_id)`

### `chat_messages`

Messages in a thread.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `thread_id uuid not null references chat_threads(id) on delete cascade`
- `sender_id uuid not null references profiles(id)`
- `body text not null`
- `created_at timestamptz not null default now()`
- `read_at timestamptz`

## Security Rules

Use RLS on every table.

Rules:

- Users can read/update their own profile except `role`.
- Trainers can read linked active students.
- Students can read their linked active trainer.
- Trainers can CRUD routines where `routines.trainer_id = auth.uid()`.
- Students can read active assigned routines assigned to them.
- Trainers can create assignments only for linked students.
- Students can insert workout sessions for themselves.
- Trainers can read workout sessions for linked students.
- Chat messages can be read/inserted only by thread participants.

## Data Flow

### Registration

1. User submits email, password, name, and role.
2. Supabase Auth creates auth user.
3. App inserts `profiles` row with selected role.
4. App routes trainer to trainer portal and student to student app/student portal.

### Linking Student To Trainer

Initial zero-cost MVP uses email linking:

1. Trainer types student email.
2. System finds profile with role `student`.
3. System creates `trainer_students` row.
4. System creates or reuses `chat_threads` row.

This requires the student to register first. Invitation emails are deferred to avoid paid email complexity.

### Routine Assignment

1. Trainer creates routine.
2. Trainer assigns routine to linked student.
3. Existing active assignment for that student is ended.
4. New assignment becomes active.
5. Student app fetches active assignment and uses it as the workout plan.

### Workout Completion

1. Student completes workout in app.
2. Existing local record is saved.
3. `sessionSyncService` sends `workout_sessions` and `workout_session_sets`.
4. If sync fails, local queued sync remains pending.
5. Trainer dashboard reads synced sessions.

### Chat

1. Trainer/student opens thread.
2. Client loads recent `chat_messages`.
3. Client subscribes to realtime inserts for the thread.
4. Sending a message inserts into `chat_messages`.

## Error Handling

- Missing Supabase env vars: show a clear setup screen explaining `.env`.
- Login failure: show the Supabase auth error in friendly Portuguese.
- Student without assigned routine: show empty state asking them to contact trainer.
- Trainer without students: show dashboard empty state and "Vincular aluno".
- Sync failure: keep local session and show "pendente de sincronizacao".
- RLS denial: show generic permission error and log detail in development only.

## Testing Strategy

Unit tests:

- Role routing.
- Mapping routine rows to app workout plans.
- Mapping local workout completion to Supabase payload.
- Dashboard metric calculations.
- Chat permission helper logic.

Integration/manual tests:

- Register trainer.
- Register student.
- Link student by email.
- Trainer creates routine.
- Trainer assigns routine.
- Student logs into app and sees assigned routine.
- Student completes workout.
- Trainer sees session in dashboard.
- Trainer and student exchange chat messages.

## Implementation Phases

### Phase 1: Backend Contract

- Add Supabase dependency.
- Add `.env.example`.
- Add SQL migration with schema and RLS.
- Add shared TypeScript platform models.
- Add Supabase client and setup guard.

### Phase 2: Auth And Role Routing

- Add login/register screens.
- Add auth context separate from legacy local user context.
- Route trainer/student differently.
- Preserve existing local onboarding for student profile completion.

### Phase 3: Web Portal Shell

- Add web dependencies.
- Add responsive auth, trainer, and student portal screens.
- Add trainer dashboard with real data from services.
- Add student dashboard with real data from services.

### Phase 4: Trainer Routine Management

- Add routine list.
- Add routine editor.
- Add student linking.
- Add routine assignment.

### Phase 5: Student App Sync

- Fetch assigned routine.
- Convert assigned routine into the existing workout flow.
- Sync completed sessions.
- Add pending sync retry.

### Phase 6: Chat

- Add thread service.
- Add chat screens for trainer web and student app/web.
- Add realtime subscription.

## Known Limitations In Zero-Cost MVP

- No SMS login.
- No invite email automation.
- No push notifications.
- No guaranteed production hosting.
- Supabase Free quotas can stop service after heavy usage; this is acceptable for first validation.
- Realtime chat depends on Supabase Realtime quota.
