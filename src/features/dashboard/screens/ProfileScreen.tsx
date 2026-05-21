import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore, UpdateProfileRequest } from '@/store/profileStore';
import { Address } from '@/features/auth/types';

const ADDRESS_TYPES: Array<'HOME' | 'OFFICE' | 'OTHER'> = ['HOME', 'OFFICE', 'OTHER'];

// Edit Profile Modal Component - Completely Rebuilt
const EditProfileModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { profile, updateProfile, isUpdating } = useProfileStore();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [building, setBuilding] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [stateName, setStateName] = useState('');
  const [addrType, setAddrType] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');

  // Initialize form when modal opens
  useEffect(() => {
    if (visible && profile) {
      setName(profile.fullName || '');
      setPhone(profile.phone || '');
      if (profile.address) {
        setBuilding(profile.address.buildingName || '');
        setStreet(profile.address.streetName || '');
        setLandmark(profile.address.landmark || '');
        setDistrict(profile.address.district || '');
        setCity(profile.address.city || '');
        setPin(profile.address.pin || '');
        setStateName(profile.address.stateName || '');
        setAddrType((profile.address.type as any) || 'HOME');
      }
    }
  }, [visible, profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: {
          buildingName: building.trim(),
          streetName: street.trim(),
          landmark: landmark.trim(),
          district: district.trim(),
          city: city.trim(),
          pin: pin.trim(),
          stateName: stateName.trim(),
          latitude: profile?.address?.latitude || '',
          longitude: profile?.address?.longitude || '',
          type: addrType,
        },
      });
      Alert.alert('Success', 'Profile updated successfully!');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1 bg-black/50"
        >
          {/* Modal Content Container */}
          <View className="flex-1 justify-end">
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl max-h-[90%]"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                className="px-6 py-4"
              >
                {/* Personal Information Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Personal Information
                  </Text>

                  {/* Name Field */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    />
                  </View>

                  {/* Phone Field */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number
                    </Text>
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+91 XXXXX XXXXX"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    />
                  </View>

                  {/* Email Field (Read-only) */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Email (Cannot be changed)
                    </Text>
                    <TextInput
                      value={profile?.email || ''}
                      editable={false}
                      className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-500"
                    />
                  </View>
                </View>

                {/* Address Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Address Details
                  </Text>

                  {/* Building */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Building / Flat No.
                    </Text>
                    <TextInput
                      value={building}
                      onChangeText={setBuilding}
                      placeholder="e.g. B-42, Tower A"
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    />
                  </View>

                  {/* Street */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Street / Area
                    </Text>
                    <TextInput
                      value={street}
                      onChangeText={setStreet}
                      placeholder="e.g. Sector 62"
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    />
                  </View>

                  {/* Landmark */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Landmark
                    </Text>
                    <TextInput
                      value={landmark}
                      onChangeText={setLandmark}
                      placeholder="e.g. Near Metro Station"
                      placeholderTextColor="#9CA3AF"
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    />
                  </View>

                  {/* District & City Row */}
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        District
                      </Text>
                      <TextInput
                        value={district}
                        onChangeText={setDistrict}
                        placeholder="District"
                        placeholderTextColor="#9CA3AF"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        City
                      </Text>
                      <TextInput
                        value={city}
                        onChangeText={setCity}
                        placeholder="City"
                        placeholderTextColor="#9CA3AF"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      />
                    </View>
                  </View>

                  {/* State & PIN Row */}
                  <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        State
                      </Text>
                      <TextInput
                        value={stateName}
                        onChangeText={setStateName}
                        placeholder="State"
                        placeholderTextColor="#9CA3AF"
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        PIN Code
                      </Text>
                      <TextInput
                        value={pin}
                        onChangeText={setPin}
                        placeholder="560001"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        maxLength={6}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                      />
                    </View>
                  </View>

                  {/* Address Type */}
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Address Type
                  </Text>
                  <View className="flex-row gap-2 mb-4">
                    {ADDRESS_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setAddrType(type)}
                        className={`flex-1 py-3 rounded-xl items-center ${
                          addrType === type ? 'bg-primary' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`font-semibold ${
                            addrType === type ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-6">
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 bg-gray-100 py-4 rounded-xl items-center justify-center"
                  >
                    <Text className="text-gray-700 font-bold text-base">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isUpdating}
                    className={`flex-1 bg-primary py-4 rounded-xl items-center justify-center ${
                      isUpdating ? 'opacity-60' : ''
                    }`}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white font-bold text-base">Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const ProfileScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const { profile, isLoading, fetchProfile } = useProfileStore();
  const [editVisible, setEditVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16A34A" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#16A34A" />

      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-12">
        <Text className="text-white text-2xl font-bold">My Profile</Text>
      </View>

      <ScrollView className="flex-1 -mt-6">
        {/* Profile Card */}
        <View className="mx-4 mb-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <View className="items-center py-6 px-4 border-b border-gray-100">
            <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#16A34A" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {profile?.fullName || 'Delivery Partner'}
            </Text>
            <Text className="text-gray-500 text-sm mb-1">
              {profile?.email || 'No email'}
            </Text>
            <Text className="text-gray-500 text-sm">
              {profile?.phone || 'No phone'}
            </Text>
            <View className="mt-3 bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-semibold">
                {profile?.status || 'ACTIVE'}
              </Text>
            </View>
          </View>

          {/* Profile Info */}
          <View className="p-4">
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons name="mail" size={20} color="#3B82F6" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Email</Text>
                <Text className="text-gray-800 font-medium">
                  {profile?.email || 'Not provided'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
                <Ionicons name="call" size={20} color="#16A34A" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Phone</Text>
                <Text className="text-gray-800 font-medium">
                  {profile?.phone || 'Not provided'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3 border-b border-gray-100">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                <Ionicons name="briefcase" size={20} color="#9333EA" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Role</Text>
                <Text className="text-gray-800 font-medium">
                  {profile?.role || 'DELIVERY'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center">
                <Ionicons
                  name={profile?.otpVerified ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={profile?.otpVerified ? '#EAB308' : '#EF4444'}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-500">Verification Status</Text>
                <Text className="text-gray-800 font-medium">
                  {profile?.otpVerified ? 'Verified' : 'Not Verified'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View className="mx-4 mb-4 bg-white rounded-2xl shadow-sm overflow-hidden">
          <TouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => setEditVisible(true)}
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="person-outline" size={20} color="#3B82F6" />
            </View>
            <Text className="flex-1 ml-3 text-gray-800 font-medium">
              Edit Profile
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
              <Ionicons name="lock-closed-outline" size={20} color="#9333EA" />
            </View>
            <Text className="flex-1 ml-3 text-gray-800 font-medium">
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
              <Ionicons name="notifications-outline" size={20} color="#F97316" />
            </View>
            <Text className="flex-1 ml-3 text-gray-800 font-medium">
              Notifications
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
            </View>
            <Text className="flex-1 ml-3 text-gray-800 font-medium">
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="mx-4 mb-6">
          <TouchableOpacity
            className="bg-red-500 rounded-xl py-4 flex-row items-center justify-center"
            onPress={() => logout()}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text className="text-white font-bold text-lg ml-2">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-6">
          <Text className="text-gray-400 text-sm">DeliveryBoy v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
    </SafeAreaView>
  );
};
