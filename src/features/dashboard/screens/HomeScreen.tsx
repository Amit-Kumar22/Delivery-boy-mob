import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useNavigation } from '@react-navigation/native';
import { useAllProducts, useAllFranchises } from '@/features/profile/hooks/useProfile';

export const HomeScreen: React.FC = () => {
  const { logout } = useAuthStore();
  const { profile, isLoading, fetchProfile } = useProfileStore();
  const navigation = useNavigation<any>();

  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>(undefined);
  const [showFranchiseDropdown, setShowFranchiseDropdown] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useAllProducts(0, 5, undefined, selectedFranchiseId, today);
  const { data: franchisesData, isLoading: franchisesLoading } = useAllFranchises();
  
  const franchises = franchisesData?.content || [];
  const selectedFranchise = franchises.find((f: any) => f.franchiseId === selectedFranchiseId);

  useEffect(() => {
    fetchProfile();
  }, []);

  const selectFranchise = (franchise: any) => {
    setSelectedFranchiseId(franchise.franchiseId);
    setShowFranchiseDropdown(false);
  };

  const clearFranchiseFilter = () => {
    setSelectedFranchiseId(undefined);
    setShowFranchiseDropdown(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const stats = {
    todayDeliveries: ordersData?.totalElements || 8,
    pendingOrders: 3,
  };

  const recentOrders = (ordersData?.content || []).filter((order: any) => {
    const orderDate = order.orderDate || order.orderDate;
    if (!orderDate) return false;
    const od = new Date(orderDate);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return od >= new Date(sevenDaysAgo.toDateString()) && od <= new Date(today.toDateString());
  }).slice(0, 5);

  const firstName = profile?.fullName?.split(' ')[0] || 'Raj';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-6">
          <Text className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {firstName} ��
          </Text>
          <Text className="text-base text-gray-500 mt-1">
            Ready for today's deliveries?
          </Text>
        </View>

        <View style={{ backgroundColor: '#E8F7EE' }} className="mx-5 rounded-2xl p-4 flex-row items-center justify-between mb-6">
          <View className="flex-row items-center flex-1">
            <View style={{ backgroundColor: '#2EB85C' }} className="w-12 h-12 rounded-full items-center justify-center">
              <Ionicons name="notifications" size={24} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-bold text-gray-900">
                New Order Assigned
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                Tap to view details
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: '#2EB85C' }} 
            className="px-5 py-2.5 rounded-lg"
            onPress={() => navigation.navigate('Orders')}
          >
            <Text className="text-white font-semibold text-sm">
              View Now
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row px-5 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-5 mr-2 border border-gray-200">
            <View style={{ backgroundColor: '#E8F7EE' }} className="w-14 h-14 rounded-full items-center justify-center mb-3">
              <Ionicons name="cube" size={28} color="#2EB85C" />
            </View>
            <Text className="text-4xl font-bold text-gray-900">
              {stats.todayDeliveries}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Delivered Today
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-5 ml-2 border border-gray-200">
            <View style={{ backgroundColor: '#FFF4E6' }} className="w-14 h-14 rounded-full items-center justify-center mb-3">
              <Ionicons name="time" size={28} color="#F59E0B" />
            </View>
            <Text className="text-4xl font-bold text-gray-900">
              {stats.pendingOrders}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Pending Orders
            </Text>
          </View>
        </View>

        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              Active Deliveries
            </Text>
            
            {/* Compact Franchise Filter */}
            <View className="relative">
              <TouchableOpacity 
                onPress={() => setShowFranchiseDropdown(!showFranchiseDropdown)}
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg border border-gray-200"
              >
                <Ionicons name="filter" size={14} color="#6B7280" />
                <Text className="text-xs font-medium text-gray-700 ml-1.5">
                  {selectedFranchise ? selectedFranchise.franchiseName.substring(0, 10) + (selectedFranchise.franchiseName.length > 10 ? '...' : '') : 'All'}
                </Text>
                <Ionicons 
                  name={showFranchiseDropdown ? "chevron-up" : "chevron-down"} 
                  size={14} 
                  color="#6B7280" 
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {showFranchiseDropdown && (
                <View 
                  className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50"
                  style={{ minWidth: 200, maxHeight: 300 }}
                >
                  <ScrollView showsVerticalScrollIndicator={true}>
                    {/* All Franchises Option */}
                    <TouchableOpacity
                      onPress={clearFranchiseFilter}
                      className={`p-3 border-b border-gray-100 ${!selectedFranchiseId ? 'bg-green-50' : ''}`}
                    >
                      <Text className={`text-sm font-semibold ${!selectedFranchiseId ? 'text-green-600' : 'text-gray-900'}`}>
                        All Franchises
                      </Text>
                    </TouchableOpacity>

                    {/* Franchise List */}
                    {franchisesLoading ? (
                      <View className="p-4 items-center">
                        <ActivityIndicator size="small" color="#2EB85C" />
                      </View>
                    ) : (
                      franchises.map((franchise: any) => (
                        <TouchableOpacity
                          key={franchise.franchiseId}
                          onPress={() => selectFranchise(franchise)}
                          className={`p-3 border-b border-gray-100 ${
                            selectedFranchiseId === franchise.franchiseId ? 'bg-green-50' : ''
                          }`}
                        >
                          <Text 
                            className={`text-sm font-semibold ${
                              selectedFranchiseId === franchise.franchiseId ? 'text-green-600' : 'text-gray-900'
                            }`}
                          >
                            {franchise.franchiseName}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-0.5">
                            {franchise.franchiseCode}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="px-5">

          {ordersLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color="#2EB85C" />
              <Text className="text-gray-600 mt-2">Loading orders...</Text>
            </View>
          ) : recentOrders.length === 0 ? (
            <View className="bg-gray-50 rounded-2xl p-6 items-center">
              <Ionicons name="checkmark-circle" size={48} color="#2EB85C" />
              <Text className="text-gray-600 mt-3 text-center">
                No active deliveries at the moment
              </Text>
            </View>
          ) : (
            recentOrders.map((order: any, index: number) => (
              <View
                key={order.id}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-lg font-bold text-gray-900">
                    {order.orderNumber || `ORD-${4521 + index}`}
                  </Text>
                  <View 
                    style={{ 
                      backgroundColor: order.orderStatus === 'Accepted' || order.orderStatus === 'ACCEPTED' ? '#3B82F6' : '#F59E0B'
                    }} 
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs font-semibold">
                      {order.orderStatus === 'Accepted' || order.orderStatus === 'ACCEPTED' ? 'Accepted' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mb-3">
                  <Ionicons name="location" size={18} color="#2EB85C" />
                  <View className="ml-2 flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {order.pickupLocation || 'Burger King, MG Road'}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      → {order.address?.streetName || order.address?.buildingName || 'B-204, Green Valley Apartments'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="rounded-xl py-3"
                  style={{ backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB' }}
                  onPress={() => navigation.navigate('OrderDetail', { order })}
                >
                  <Text style={{ color: '#1F2937' }} className="text-center text-base font-semibold">
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};
