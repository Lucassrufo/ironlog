import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActiveWorkoutScreen } from '../screens/app/ActiveWorkoutScreen';
import { AuthLandingScreen } from '../screens/auth/AuthLandingScreen';
import { AuthLoadingScreen } from '../screens/auth/AuthLoadingScreen';
import { CompleteOAuthProfileScreen } from '../screens/auth/CompleteOAuthProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SupabaseSetupScreen } from '../screens/auth/SupabaseSetupScreen';
import { PlatformChatScreen } from '../screens/platform/PlatformChatScreen';
import { StudentPortalScreen } from '../screens/platform/student/StudentPortalScreen';
import { TrainerDashboardScreen } from '../screens/platform/trainer/TrainerDashboardScreen';
import { TrainerRoutineEditorScreen } from '../screens/platform/trainer/TrainerRoutineEditorScreen';
import { TrainerRoutinesScreen } from '../screens/platform/trainer/TrainerRoutinesScreen';
import { TrainerStudentDetailScreen } from '../screens/platform/trainer/TrainerStudentDetailScreen';
import { TrainerStudentsScreen } from '../screens/platform/trainer/TrainerStudentsScreen';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { ExerciseDetailScreen } from '../screens/app/ExerciseDetailScreen';
import { ExerciseLibraryScreen } from '../screens/app/ExerciseLibraryScreen';
import { OnboardingNavigator } from './OnboardingNavigator';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { ProgressScreen } from '../screens/app/ProgressScreen';
import { RootStackParamList } from '../types/navigation';
import { TrainingHubScreen } from '../screens/app/TrainingHubScreen';
import { TrainingPreferencesScreen } from '../screens/app/TrainingPreferencesScreen';
import { WorkoutScheduleScreen } from '../screens/app/WorkoutScheduleScreen';
import { WorkoutSummaryScreen } from '../screens/app/WorkoutSummaryScreen';
import { WorkoutCompleteScreen } from '../screens/app/WorkoutCompleteScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user } = useUser();
  const { isConfigured, localOnly, platformProfile, profileStatus, session } = useAuth();

  if (!isConfigured && !localOnly) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SupabaseSetup" component={SupabaseSetupScreen} />
      </Stack.Navigator>
    );
  }

  if (isConfigured && !session) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 420 }}>
        <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  if (isConfigured && session && !platformProfile && profileStatus !== 'missing') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      </Stack.Navigator>
    );
  }

  if (isConfigured && session && profileStatus === 'missing') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 420 }}>
        <Stack.Screen name="CompleteOAuthProfile" component={CompleteOAuthProfileScreen} />
      </Stack.Navigator>
    );
  }

  if (isConfigured && platformProfile?.role === 'trainer') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 420 }}>
        <Stack.Screen name="TrainerDashboard" component={TrainerDashboardScreen} />
        <Stack.Screen name="TrainerStudents" component={TrainerStudentsScreen} />
        <Stack.Screen name="TrainerStudentDetail" component={TrainerStudentDetailScreen} />
        <Stack.Screen name="TrainerRoutines" component={TrainerRoutinesScreen} />
        <Stack.Screen name="TrainerRoutineEditor" component={TrainerRoutineEditorScreen} />
        <Stack.Screen name="PlatformChat" component={PlatformChatScreen} />
      </Stack.Navigator>
    );
  }

  if (isConfigured && platformProfile?.role === 'student' && !user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 420 }}>
        <Stack.Screen name="StudentPortal" component={StudentPortalScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="PlatformChat" component={PlatformChatScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 420,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="TrainingHub" component={TrainingHubScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
          <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
          <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
          <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="TrainingPreferences" component={TrainingPreferencesScreen} />
          <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
          <Stack.Screen name="WorkoutSchedule" component={WorkoutScheduleScreen} />
          <Stack.Screen name="StudentPortal" component={StudentPortalScreen} />
          <Stack.Screen name="PlatformChat" component={PlatformChatScreen} />
        </>
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
    </Stack.Navigator>
  );
}
