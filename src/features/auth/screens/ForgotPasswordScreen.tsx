import { AuthStackParamList } from "@/navigation/AuthStack";
import { zodResolver } from "@hookform/resolvers/zod";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForgotPassword } from "../hooks/useAuth";
import { ForgotPasswordFormData, forgotPasswordSchema } from "../validation";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "ForgotPassword"
>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const forgotPasswordMutation = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert(
          "Success",
          "Password reset link has been sent to your email",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      },
      onError: (error: any) => {
        let errorMessage = "An error occurred";

        if (
          error.code === "NETWORK_ERROR" ||
          error.message === "Network Error"
        ) {
          errorMessage = "Network error - Check if the server is running";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert("Error", errorMessage);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-12">
          <TouchableOpacity
            className="w-10 h-10 bg-primary rounded-full items-center justify-center mb-8"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Image
              source={require("../../../../assets/images/login_logo.png")}
              className="w-64 h-48"
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-center mb-2">
            Forgot Password?
          </Text>
          <Text className="text-gray-600 text-center mb-8 px-4">
            Enter your email address and we'll send you a link to reset your
            password
          </Text>

          <View className="space-y-4">
            <View>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3">
                    <Text className="text-gray-400 mr-3">✉</Text>
                    <TextInput
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 text-base"
                      style={{ color: "#111827" }}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="bg-primary-dark rounded-full py-4 mt-8"
              onPress={handleSubmit(onSubmit)}
              disabled={forgotPasswordMutation.isPending}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {forgotPasswordMutation.isPending
                  ? "Sending..."
                  : "Send Reset Link"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="font-semibold text-black">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
