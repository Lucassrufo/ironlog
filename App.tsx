import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, StyleSheet, View } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider, useUser } from './src/context/UserContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function Bootstrap() {
  const { isLoading } = useUser();
  const { theme, navigationTheme } = useTheme();
  const [showBrandSplash, setShowBrandSplash] = useState(true);
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(brandScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(brandOpacity, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }).start(() => setShowBrandSplash(false));
    }, 1800);

    return () => clearTimeout(timer);
  }, [brandOpacity, brandScale]);

  if (isLoading || showBrandSplash) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
        {isLoading ? <ActivityIndicator color={theme.colors.primary} size="large" /> : null}
        <Animated.View style={{ opacity: brandOpacity, transform: [{ scale: brandScale }] }}>
          <Image source={require('./assets/ironlog-logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 260,
    height: 260,
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <Bootstrap />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
