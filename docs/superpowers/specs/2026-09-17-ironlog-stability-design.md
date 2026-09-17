# IronLog Stability Design

Goal: make the current local-first IronLog app safer to use during real workouts, with reliable active-session recovery, clearer metrics, working navigation paths, and basic controls for features that were previously inert.

Architecture: keep the app offline and AsyncStorage-based. Move calculation, date filtering, validation, and draft-shaping logic into small utility modules so screens can share the same behavior and tests can protect the core rules.

Scope:
- Persist and restore active workouts locally.
- Prevent duplicate workout completion.
- Validate stored data before hydrating state.
- Correct volume and duration semantics for strength, timed, and cardio exercises.
- Make progress periods interactive and date-local.
- Expose schedule/history paths from the main UI.
- Make plan cards select the chosen plan.
- Add profile validation.
- Mark not-yet-built features clearly instead of presenting inert controls.
- Update docs after implementation.

Out of scope:
- Remote accounts and cross-device sync.
- Full custom workout builder.
- Native reminders and push notifications.
- Full media library cleanup across all historical edge cases.
