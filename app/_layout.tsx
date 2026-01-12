import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutContent() {
  const { effectiveColorScheme } = useTheme();

  return (
    <NavigationThemeProvider
      value={effectiveColorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="webview"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            headerShown: false,
            presentation: 'card'
          }}
        />
      </Stack>
      <StatusBar style={effectiveColorScheme === "dark" ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
