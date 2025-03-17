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

// التحقق مما إذا كان التطبيق يعمل في بيئة المتصفح
const isWeb = typeof window !== "undefined";

// استيراد Platform فقط إذا لم يكن التطبيق على الويب
const Platform = isWeb ? null : require("react-native").Platform;

// استيراد SplashScreen فقط إذا لم يكن التطبيق على الويب
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
