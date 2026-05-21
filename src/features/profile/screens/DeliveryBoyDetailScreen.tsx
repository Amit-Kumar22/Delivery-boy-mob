import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useDeliveryBoyProfile } from "../hooks/useProfile";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/authStore";
import type { DeliveryStatus, AvailabilityStatus } from "../types";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type ProfileDetailNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileDetail'>;

export const DeliveryBoyDetailScreen = () => {
  const navigation = useNavigation<ProfileDetailNavigationProp>();
  const { data: profile, isLoading, error, refetch, isRefetching } = useDeliveryBoyProfile();
  const { logout } = useAuthStore();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const openImageViewer = (uri?: string | null) => {
    if (!uri) return;
    setViewerImage(uri);
    setViewerVisible(true);
  };

  const closeImageViewer = () => {
    setViewerVisible(false);
    setViewerImage(null);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-orange-100 text-orange-800";
      case "BLOCKED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2EB85C" />
          <Text className="mt-4 text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null && 'response' in error
        ? (error as any).response?.data?.message || (error as any).response?.statusText || "Something went wrong"
        : "Something went wrong";
    
    const errorDetails = __DEV__ && typeof error === 'object' && error !== null && 'response' in error
      ? `Status: ${(error as any).response?.status}\nURL: ${(error as any).config?.url}`
      : null;

    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-800">
            Failed to load profile
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            {errorMessage}
          </Text>
          {errorDetails && (
            <Text className="mt-2 text-xs text-gray-500 text-center">
              {errorDetails}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => refetch()}
            style={{ backgroundColor: '#2EB85C' }}
            className="mt-6 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={logout}
            className="mt-4 px-6 py-3 rounded-lg bg-gray-100"
          >
            <Text className="text-gray-700 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            tintColor="#2EB85C"
            colors={['#2EB85C']}
          />
        }
      >
        {/* Header with Profile Info */}
        <View className="px-5 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              My Profile
            </Text>
            <TouchableOpacity 
              onPress={logout}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="bg-white rounded-2xl p-5 border border-gray-200">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => openImageViewer(profile.profileImage)}>
                <Image
                  source={
                    profile.profileImage
                      ? { uri: profile.profileImage }
                      : require("@/assets/images/icon.png")
                  }
                  className="w-20 h-20 rounded-full bg-gray-200"
                />
              </TouchableOpacity>

              <View className="ml-4 flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  {profile.name}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {profile.email}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View
                    className={`px-3 py-1 rounded-full ${getStatusColor(profile.status)}`}
                  >
                    <Text className="font-semibold text-xs">
                      {profile.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row mt-4 pt-4 border-t border-gray-100">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {profile.totalDeliveries || 0}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Deliveries
                </Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="flex-1 items-center">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-2xl font-bold text-gray-900 ml-1">
                    {profile.rating ? profile.rating.toFixed(1) : '0.0'}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Rating
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Account
          </Text>

          {/* Vehicle Details Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('VehicleForm', { 
              initialData: profile.vehicle ? {
                vehicleType: profile.vehicle.vehicleType,
                vehicleNumber: profile.vehicle.vehicleNumber,
                model: profile.vehicle.model,
                image: profile.vehicle.image,
              } : undefined
            })}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 flex-row items-center"
          >
            <View 
              style={{ backgroundColor: '#E8F7EE' }}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="car-sport" size={24} color="#2EB85C" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Vehicle Details
              </Text>
              {profile.vehicle ? (
                <Text className="text-sm text-gray-500 mt-1">
                  {profile.vehicle.vehicleNumber} • {profile.vehicle.vehicleType}
                </Text>
              ) : (
                <Text className="text-sm text-gray-500 mt-1">
                  Add your vehicle details
                </Text>
              )}
            </View>
            {profile.vehicle?.verified && (
              <View className="bg-green-50 px-2 py-1 rounded-full mr-2">
                <Ionicons name="checkmark-circle" size={16} color="#2EB85C" />
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Documents Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('DocumentForm')}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 flex-row items-center"
          >
            <View 
              style={{ backgroundColor: '#FFF4E6' }}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="document-text" size={24} color="#F59E0B" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Documents
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {profile.deliveryBoyDocuments && profile.deliveryBoyDocuments.length > 0
                  ? `${profile.deliveryBoyDocuments.length} document${profile.deliveryBoyDocuments.length > 1 ? 's' : ''} uploaded`
                  : 'Upload your documents'}
              </Text>
            </View>
            {profile.deliveryBoyDocuments && profile.deliveryBoyDocuments.some(doc => doc.verified) && (
              <View className="bg-green-50 px-2 py-1 rounded-full mr-2">
                <Ionicons name="checkmark-circle" size={16} color="#2EB85C" />
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Service Areas Card */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('ServiceAreaList')}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 flex-row items-center"
          >
            <View 
              style={{ backgroundColor: '#EEF2FF' }}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="location" size={24} color="#3B82F6" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Service Areas
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {profile.serviceAreaMappings && profile.serviceAreaMappings.length > 0
                  ? `${profile.serviceAreaMappings.length} area${profile.serviceAreaMappings.length > 1 ? 's' : ''} assigned`
                  : 'No areas assigned'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Orders History Card */}
          <TouchableOpacity 
            onPress={() => (navigation as any).navigate('OrderHistory')}
            className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 flex-row items-center"
          >
            <View 
              style={{ backgroundColor: '#F3E8FF' }}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="time" size={24} color="#A855F7" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-semibold text-gray-900">
                Order History
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                View completed deliveries
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Contact Info Section */}
          <Text className="text-lg font-bold text-gray-900 mb-3 mt-2">
            Contact Information
          </Text>

          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <Ionicons name="mail" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Email</Text>
                <Text className="text-base text-gray-900 mt-1">
                  {profile.email}
                </Text>
              </View>
            </View>

            <View className="h-px bg-gray-100 my-2" />

            <View className="flex-row items-center">
              <Ionicons name="call" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Phone</Text>
                <Text className="text-base text-gray-900 mt-1">
                  {profile.phone || 'Not provided'}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Info Section */}
          <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">
            Account Information
          </Text>

          <View className="bg-white rounded-2xl p-4 mb-6 border border-gray-200">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-gray-600">Account Status</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {profile.active ? "Active" : "Inactive"}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-2" />

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-gray-600">Verification</Text>
              <View className="flex-row items-center">
                {profile.verified ? (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="#2EB85C" />
                    <Text className="text-sm font-semibold text-gray-900 ml-1">
                      Verified
                    </Text>
                  </>
                ) : (
                  <Text className="text-sm font-semibold text-yellow-600">
                    Pending
                  </Text>
                )}
              </View>
            </View>

            <View className="h-px bg-gray-100 my-2" />

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-gray-600">Availability</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {profile.availability}
              </Text>
            </View>

            <View className="h-px bg-gray-100 my-2" />

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Member Since</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {new Date(profile.created).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={logout}
            className="bg-red-50 rounded-2xl p-4 mb-6 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
          <Pressable onPress={closeImageViewer} className="absolute top-12 right-6 z-50 p-2">
            <Ionicons name="close" size={32} color="#fff" />
          </Pressable>

          {viewerImage ? (
            <Image
              source={{ uri: viewerImage }}
              style={{ width: '92%', height: '80%', borderRadius: 12 }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
