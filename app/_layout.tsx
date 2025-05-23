import { db, expo_sqlite } from "@/db/client";
import migrations from "@/drizzle/migrations";
import { MaterialIcons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Force dark theme across the entire app
  const isDark = true; // colorScheme === "dark";

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { success, error: migrationError } = useMigrations(db, migrations);

  useDrizzleStudio(expo_sqlite);

  useEffect(() => {
    if (error) throw error;
    if (migrationError) throw migrationError;
  }, [error, migrationError]);

  useEffect(() => {
    if (loaded && success) {
      SplashScreen.hideAsync();
    }
  }, [loaded, success]);

  if (!loaded || !success) {
    return null;
  }

  return (
    <PaperProvider>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#625df5",
            tabBarInactiveTintColor: isDark ? "#888" : "#555",
            tabBarStyle: {
              backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5",
              borderTopColor: isDark ? "#333" : "#ddd",
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Timer",
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="timer" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              title: "Tasks",
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="assignment" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: "Statistics",
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="bar-chart" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
        <StatusBar style={isDark ? "light" : "dark"} />
      </ThemeProvider>
    </PaperProvider>
  );
}
