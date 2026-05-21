import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { queryClient } from "./src/api/queryClient";
import { AuthStack } from "./src/navigation/AuthStack";
import RootStackNavigator from './src/navigation/RootStackNavigator';
import { useAuthStore } from "./src/store/authStore";

// Import Reactotron in development mode
if (__DEV__) {
  require("./src/config/ReactotronConfig");
}

// Import CSS for web
if (Platform.OS === "web") {
  require("./global.css");
}

export default function App() {
  const { isLoading, isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="dark" />
  {isAuthenticated ? <RootStackNavigator /> : <AuthStack />}
      </NavigationContainer>
    </QueryClientProvider>
  );
}
