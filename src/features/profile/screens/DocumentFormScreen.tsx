import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
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
import { useAddUpdateDocument } from "../hooks/useProfile";
import type { DocumentRequest, DocumentType } from "../types";

type DocumentFormRouteProp = RouteProp<ProfileStackParamList, 'DocumentForm'>;

interface DocumentFormScreenProps {
  navigation: any;
}

const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: "Aadhar Card", value: "AADHAR_CARD" },
  { label: "Driving License", value: "DRIVING_LICENSE" },
  { label: "PAN Card", value: "PAN_CARD" },
];

export const DocumentFormScreen: React.FC<DocumentFormScreenProps> = ({
  navigation,
}) => {
  const route = useRoute<DocumentFormRouteProp>();
  
  const [formData, setFormData] = useState<DocumentRequest>({
    type: "AADHAR_CARD",
    frontImage: "",
    backImage: "",
  });

  const addUpdateDocument = useAddUpdateDocument();

  const handleSubmit = async () => {
    // Validation
    if (!formData.frontImage.trim()) {
      Alert.alert("Error", "Please upload front image of the document");
      return;
    }
    if (!formData.backImage.trim()) {
      Alert.alert("Error", "Please upload back image of the document");
      return;
    }

    try {
      await addUpdateDocument.mutateAsync(formData);
      Alert.alert("Success", "Document uploaded successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to upload document"
      );
    }
  };

  const handleImagePick = async (side: "front" | "back") => {
    // Show options to choose between camera and gallery
    Alert.alert(
      "Select Image Source",
      "Choose where to pick the image from",
      [
        {
          text: "Camera",
          onPress: () => pickImageFromCamera(side),
        },
        {
          text: "Gallery",
          onPress: () => pickImageFromGallery(side),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickImageFromGallery = async (side: "front" | "back") => {
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Use the file URI for multipart upload and preview
        const uri = asset.uri;

        if (side === "front") {
          setFormData({ ...formData, frontImage: uri });
        } else {
          setFormData({ ...formData, backImage: uri });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  const pickImageFromCamera = async (side: "front" | "back") => {
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
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;

        if (side === "front") {
          setFormData({ ...formData, frontImage: uri });
        } else {
          setFormData({ ...formData, backImage: uri });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
      console.error("Camera error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          Upload Documents
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-5">
          {/* Document Type Selection */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Document Type *
            </Text>
            <View className="space-y-2">
              {DOCUMENT_TYPES.map((docType) => (
                <TouchableOpacity
                  key={docType.value}
                  onPress={() =>
                    setFormData({ ...formData, type: docType.value })
                  }
                  className={`flex-row items-center p-4 rounded-xl border-2 ${
                    formData.type === docType.value
                      ? "bg-green-50"
                      : "bg-white"
                  }`}
                  style={{
                    borderColor: formData.type === docType.value ? '#2EB85C' : '#E5E7EB'
                  }}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center`}
                    style={{
                      borderColor: formData.type === docType.value ? '#2EB85C' : '#D1D5DB'
                    }}
                  >
                    {formData.type === docType.value && (
                      <View 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: '#2EB85C' }}
                      />
                    )}
                  </View>
                  <Text
                    className={`ml-3 font-medium ${
                      formData.type === docType.value
                        ? "text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {docType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Front Image */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Front Image *
            </Text>
            <TouchableOpacity
              onPress={() => handleImagePick("front")}
              className="bg-gray-50 border-2 border-dashed rounded-2xl h-48 items-center justify-center overflow-hidden"
              style={{ borderColor: '#E5E7EB' }}
            >
              {formData.frontImage ? (
                <Image
                  source={{ uri: formData.frontImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <View 
                    style={{ backgroundColor: '#E8F7EE' }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  >
                    <Ionicons name="image-outline" size={32} color="#2EB85C" />
                  </View>
                  <Text className="text-gray-600 font-medium">Upload Front Image</Text>
                  <Text className="text-sm text-gray-400 mt-1">Tap to select photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Back Image */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Back Image *
            </Text>
            <TouchableOpacity
              onPress={() => handleImagePick("back")}
              className="bg-gray-50 border-2 border-dashed rounded-2xl h-48 items-center justify-center overflow-hidden"
              style={{ borderColor: '#E5E7EB' }}
            >
              {formData.backImage ? (
                <Image
                  source={{ uri: formData.backImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <View 
                    style={{ backgroundColor: '#E8F7EE' }}
                    className="w-16 h-16 rounded-full items-center justify-center mb-3"
                  >
                    <Ionicons name="image-outline" size={32} color="#2EB85C" />
                  </View>
                  <Text className="text-gray-600 font-medium">Upload Back Image</Text>
                  <Text className="text-sm text-gray-400 mt-1">Tap to select photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View 
            className="border rounded-2xl p-4 mb-6"
            style={{ borderColor: '#2EB85C', backgroundColor: '#E8F7EE' }}
          >
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color="#2EB85C" />
              <View className="ml-2 flex-1">
                <Text className="text-sm text-gray-700">
                  Please ensure the document images are clear and all details are
                  visible. The document will be verified by our team.
                </Text>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={addUpdateDocument.isPending}
            className="py-4 rounded-full items-center"
            style={{ 
              backgroundColor: addUpdateDocument.isPending ? '#9CA3AF' : '#2EB85C'
            }}
          >
            {addUpdateDocument.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Upload Document
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
