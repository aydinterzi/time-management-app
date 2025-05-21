import { MaterialIcons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
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
            headerStyle: {
              backgroundColor: isDark ? "#121212" : "#ffffff",
            },
            headerTintColor: isDark ? "#ffffff" : "#000000",
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
        </Tabs>
        <StatusBar style={isDark ? "light" : "dark"} />
      </ThemeProvider>
    </PaperProvider>
  );
}
