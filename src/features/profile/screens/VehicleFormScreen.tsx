import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRoute, RouteProp } from "@react-navigation/native";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { useAddUpdateVehicle } from "../hooks/useProfile";
import type { VehicleDetailRequest } from "../types";

type VehicleFormRouteProp = RouteProp<ProfileStackParamList, 'VehicleForm'>;

interface VehicleFormScreenProps {
  navigation: any;
}

export const VehicleFormScreen: React.FC<VehicleFormScreenProps> = ({
  navigation,
}) => {
  const route = useRoute<VehicleFormRouteProp>();
  const initialData = route.params?.initialData;
  
  const [formData, setFormData] = useState<VehicleDetailRequest>({
    vehicleType: "",
    vehicleNumber: "",
    model: "",
    image: "",
  });

  const addUpdateVehicle = useAddUpdateVehicle();
  
  const isEditMode = Boolean(initialData);
  
  // Update form data when initialData is available
  useEffect(() => {
    if (initialData) {
      console.log("VehicleFormScreen - Loading initial data:", initialData);
      setFormData({
        vehicleType: initialData.vehicleType || "",
        vehicleNumber: initialData.vehicleNumber || "",
        model: initialData.model || "",
        image: initialData.image || "",
      });
    }
  }, [initialData]);
  
  // Debug logs
  console.log("VehicleFormScreen - Is Edit Mode:", isEditMode);
  console.log("VehicleFormScreen - Current Form Data:", formData);

  const handleSubmit = async () => {
    // Validation
    if (!formData.vehicleType.trim()) {
      Alert.alert("Error", "Please enter vehicle type");
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      Alert.alert("Error", "Please enter vehicle number");
      return;
    }
    if (!formData.model.trim()) {
      Alert.alert("Error", "Please enter vehicle model");
      return;
    }

    try {
      await addUpdateVehicle.mutateAsync(formData);
      Alert.alert(
        "Success", 
        isEditMode 
          ? "Vehicle details updated successfully" 
          : "Vehicle details added successfully",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error 
          ? error.message 
          : isEditMode 
            ? "Failed to update vehicle details"
            : "Failed to add vehicle details"
      );
    }
  };

  const handleImagePick = async () => {
    // Show options to choose between camera and gallery
    Alert.alert(
      "Select Image Source",
      "Choose where to pick the image from",
      [
        {
          text: "Camera",
          onPress: () => pickImageFromCamera(),
        },
        {
          text: "Gallery",
          onPress: () => pickImageFromGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickImageFromGallery = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required to upload images."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set the image URI
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera is required to take photos."
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set the image URI
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
      console.error("Camera error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">
            {isEditMode ? "Update" : "Add"} Vehicle Details
          </Text>
        </View>
        {isEditMode && (
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-blue-700 text-xs font-semibold">Editing</Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Vehicle Image */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Vehicle Image
            </Text>
            <TouchableOpacity
              onPress={handleImagePick}
              className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl h-48 items-center justify-center overflow-hidden"
            >
              {formData.image ? (
                <>
                  <Image
                    source={{ uri: formData.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, image: "" });
                    }}
                    className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  >
                    <Ionicons name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <View className="items-center">
                  <Ionicons name="camera-outline" size={48} color="#9ca3af" />
                  <Text className="mt-2 text-gray-500">Tap to upload image</Text>
                  <Text className="mt-1 text-xs text-gray-400">From Camera or Gallery</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Vehicle Type */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Vehicle Type *
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="e.g., Bike, Scooter, Car"
              value={formData.vehicleType}
              onChangeText={(text) =>
                setFormData({ ...formData, vehicleType: text })
              }
            />
          </View>

          {/* Vehicle Number */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Vehicle Number *
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="e.g., DL01AB1234"
              value={formData.vehicleNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, vehicleNumber: text.toUpperCase() })
              }
              autoCapitalize="characters"
            />
          </View>

          {/* Model */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Model *
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="e.g., Honda Activa"
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={addUpdateVehicle.isPending}
            className={`py-4 rounded-lg items-center ${
              addUpdateVehicle.isPending ? "bg-blue-400" : "bg-blue-600"
            }`}
          >
            {addUpdateVehicle.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                {initialData ? "Update" : "Add"} Vehicle
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
