import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";

// Check if the app is running in a browser environment
const isWeb = typeof window !== "undefined";

// Import Platform only if not on web
const Platform = isWeb ? null : require("react-native").Platform;

// Import SplashScreen only if not on web
const SplashScreen = isWeb
  ? null
  : require("react-native-splash-screen").default;

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded && SplashScreen && Platform && Platform.OS !== "web") {
      SplashScreen.preventAutoHideAsync();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Create a stack for auth screens (login/signup) */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Create a stack for the main app screen */}
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}