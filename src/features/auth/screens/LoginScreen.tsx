import { AuthStackParamList } from "@/navigation/AuthStack";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useRef, useState } from "react";
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
import { useLogin } from "../hooks/useAuth";
import { LoginFormData, loginSchema } from "../validation";

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const passwordInputRef = useRef<View>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        // Login successful - role validation is done in useLogin hook
      },
      onError: (error: any) => {
        let errorMessage = "An error occurred";

        if (error.message === 'Access denied. This app is only for delivery partners.') {
          errorMessage = "Access denied. This app is only for delivery partners with DELIVERY role.";
        } else if (
          error.code === "NETWORK_ERROR" ||
          error.message === "Network Error"
        ) {
          errorMessage = "Network error - Check if the server is running";
        } else if (error.response?.status === 404) {
          errorMessage = "API endpoint not found - Check server configuration";
        } else if (error.response?.status === 500) {
          errorMessage = "Server error - Try again later";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert("Login Failed", errorMessage);
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
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 12 }}>
            <Text style={{ fontSize: 36, fontWeight: '800', letterSpacing: -1 }}>
              <Text style={{ color: '#5FBB7D' }}>Khana</Text>
              <Text style={{ color: '#1E293B' }}>Mart</Text>
            </Text>
          </View>

          {/* Welcome Section */}
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center' }}>
              Welcome Back
            </Text>
            <Text style={{ fontSize: 13.5, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
              Login to start your delivery shift
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ paddingHorizontal: 20, zIndex: 2 }}>
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 8, letterSpacing: 0.5 }}>
                DELIVERY ID
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: 10, 
                    paddingHorizontal: 16, 
                    height: 48,
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB'
                  }}>
                    <TextInput
                      placeholder="Enter your Delivery ID"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{ fontSize: 14, color: "#1F2937", padding: 0 }}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                  {errors.email.message}
                </Text>
              )}
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
                Use the ID provided by your company
              </Text>
            </View>

            <View ref={passwordInputRef} onLayout={() => {}} style={{ marginBottom: 0 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 8, letterSpacing: 0.5 }}>
                PASSWORD
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: 10, 
                    paddingHorizontal: 16, 
                    height: 48,
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB'
                  }}>
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      style={{ fontSize: 14, color: "#1F2937", padding: 0 }}
                    />
                  </View>
                )}
              />
              {errors.password && (
                <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>
                  {errors.password.message}
                </Text>
              )}
            </View>
          </View>

          {/* Delivery Boy Illustration - Behind the button */}
          <View style={{ 
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
            zIndex: 1
          }}>
            <Image
              source={require("../../../../assets/images/login_logo.png")}
              style={{ 
                width: 360, 
                height: 300
              }}
              resizeMode="contain"
            />
          </View>

          {/* Button overlaying the image */}
          <View style={{ paddingHorizontal: 20, marginTop: -140, zIndex: 3 }}>
            <TouchableOpacity
              style={{ 
                backgroundColor: '#5FBB7D',
                borderRadius: 28,
                height: 52,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5
              }}
              onPress={handleSubmit(onSubmit)}
              disabled={loginMutation.isPending}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', letterSpacing: 0.2 }}>
                {loginMutation.isPending ? "Logging in..." : "Login to Continue"}
              </Text>
            </TouchableOpacity>

            <Text style={{ textAlign: 'center', fontSize: 11.5, color: '#9CA3AF', marginTop: 16, marginBottom: 20 }}>
              Use your company-provided ID
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
