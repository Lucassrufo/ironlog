import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { OnboardingFlowScreen } from '../screens/onboarding/OnboardingFlowScreen';
import { OnboardingStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="OnboardingFlow" component={OnboardingFlowScreen} />
    </Stack.Navigator>
  );
}
