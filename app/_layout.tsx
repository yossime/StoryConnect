import React, { useEffect, useCallback, useState } from "react";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync().catch(() => {
});

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...Colors.light,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...Colors.dark,
  },
};

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme(); 
  const { loadStoredAuth } = useAuthStore();

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await loadStoredAuth();
      } finally {
        setAppReady(true);
      }
    })();
  }, [loadStoredAuth]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ThemeProvider value={colorScheme === "dark" ? CustomDarkTheme : CustomLightTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen
            name="story-viewer"
            options={{
              presentation: "modal",
              headerShown: false,
              gestureEnabled: true,
            }}
          />

          <Stack.Screen
            name="profile/[userId]"
            options={{
              title: "Profile",
              presentation: "modal",
            }}
          />
        </Stack>

        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
