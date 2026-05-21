import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAllProducts, useAllFranchises } from "../hooks/useProfile";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

// Get date from 1 month ago
const getOneMonthAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};

// Get date from 7 days ago (1 week)
const getOneWeekAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
};

// Status badge colors
const getStatusBadgeColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return 'bg-green-100';
    case 'CANCELLED':
      return 'bg-red-100';
    case 'CONFIRMED':
    case 'ACCEPTED':
      return 'bg-blue-100';
    case 'PICKED':
      return 'bg-purple-100';
    case 'OUT_FOR_DELIVERY':
      return 'bg-orange-100';
    default:
      return 'bg-gray-100';
  }
};

const getStatusTextColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return 'text-green-800';
    case 'CANCELLED':
      return 'text-red-800';
    case 'CONFIRMED':
    case 'ACCEPTED':
      return 'text-blue-800';
    case 'PICKED':
      return 'text-purple-800';
    case 'OUT_FOR_DELIVERY':
      return 'text-orange-800';
    default:
      return 'text-gray-800';
  }
};

const getStatusDisplayText = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'ACCEPTED':
      return 'Accepted';
    case 'PICKED':
      return 'Picked Up';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    default:
      return status;
  }
};

export const OrderHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>(undefined);
  const [showFranchiseDropdown, setShowFranchiseDropdown] = useState(false);
  const [dateText, setDateText] = useState(''); // Empty by default - show all orders
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(true); // Show filters by default so user can select franchise

  // Fetch franchises
  const { data: franchisesData, isLoading: franchisesLoading } = useAllFranchises();
  const franchises = franchisesData?.content || [];

  const { data, isLoading, error, refetch, isRefetching } = useAllProducts(
    page, 
    size, 
    ['orderDate,desc', 'created,desc'], // Sort by order date descending (latest completed date first)
    selectedFranchiseId, 
    dateText || undefined
  );

  // Show all orders in history (no filtering by status)
  // History page shows orders based on date filter, with client-side sorting
  const historyOrders = (data?.content || []).sort((a: any, b: any) => {
    // Client-side sorting to ensure latest orders show first
    const dateA = new Date(a.orderDate || a.completedDate || a.created || 0).getTime();
    const dateB = new Date(b.orderDate || b.completedDate || b.created || 0).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  if (isLoading || franchisesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-4 text-gray-600">Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedFranchise = franchises.find((f: any) => f.franchiseId === selectedFranchiseId);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">Orders History</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            className="p-2"
          >
            <Ionicons name="filter" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center mt-1">
          <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-2">
            <Ionicons name="time-outline" size={16} color="#22c55e" />
          </View>
          <Text className="text-sm text-gray-600">
            {historyOrders.length} order(s) found
          </Text>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View className="p-4 bg-white border-b border-gray-200">
          {/* Franchise Dropdown */}
          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-2">Select Franchise</Text>
            <TouchableOpacity
              onPress={() => setShowFranchiseDropdown(!showFranchiseDropdown)}
              className="bg-gray-100 px-3 py-3 rounded-lg flex-row items-center justify-between"
            >
              <Text className="text-gray-900">
                {selectedFranchise ? selectedFranchise.franchiseName : 'All Franchises'}
              </Text>
              <Ionicons 
                name={showFranchiseDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6b7280" 
              />
            </TouchableOpacity>
            
            {showFranchiseDropdown && (
              <View className="bg-white border border-gray-200 rounded-lg mt-1 max-h-60">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFranchiseId(undefined);
                    setShowFranchiseDropdown(false);
                    setPage(0);
                  }}
                  className="px-3 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-900">All Franchises</Text>
                </TouchableOpacity>
                {franchises.map((franchise: any) => (
                  <TouchableOpacity
                    key={franchise.franchiseId}
                    onPress={() => {
                      setSelectedFranchiseId(franchise.franchiseId);
                      setShowFranchiseDropdown(false);
                      setPage(0);
                    }}
                    className={`px-3 py-3 border-b border-gray-100 ${
                      selectedFranchiseId === franchise.franchiseId ? 'bg-green-50' : ''
                    }`}
                  >
                    <Text className={`${
                      selectedFranchiseId === franchise.franchiseId ? 'text-green-700 font-semibold' : 'text-gray-900'
                    }`}>
                      {franchise.franchiseName}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">{franchise.franchiseCode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-2">From Date (Optional)</Text>
            <TouchableOpacity 
              onPress={() => setDatePickerVisible(true)} 
              className="bg-gray-100 px-3 py-3 rounded-lg flex-row items-center justify-between"
            >
              <Text className="text-gray-900">{dateText || 'All dates'}</Text>
              <Ionicons name="calendar" size={20} color="#6B7280" />
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={selectedDate}
              maximumDate={new Date()}
              onConfirm={(date: Date) => {
                setSelectedDate(date);
                setDateText(formatDate(date));
                setDatePickerVisible(false);
              }}
              onCancel={() => setDatePickerVisible(false)}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setPage(0);
              refetch();
            }}
            className="bg-green-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* History List */}
      <FlatList
        data={historyOrders}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-4">
              <Ionicons name="time-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {!selectedFranchiseId ? 'Select a Franchise' : 'No orders found'}
            </Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              {!selectedFranchiseId 
                ? 'Please select a franchise from the filter above to view order history'
                : 'No orders found for the selected date and franchise'}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('OrderHistoryDetail', { order: item })}
            className="mb-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            {/* Order Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-900">
                {item.orderNumber || `ORD-${item.id}`}
              </Text>
              <View className={`px-3 py-1 rounded-full ${getStatusBadgeColor(item.orderStatus)}`}>
                <Text className={`text-xs font-semibold ${getStatusTextColor(item.orderStatus)}`}>
                  {getStatusDisplayText(item.orderStatus)}
                </Text>
              </View>
            </View>

            {/* Pickup and Delivery Info */}
            <View className="mb-3">
              <View className="flex-row items-start mb-2">
                <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="location" size={14} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">
                    {item.pickupLocation || item.storeName || 'Pickup Location'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center ml-3 mb-2">
                <Ionicons name="arrow-down" size={16} color="#9ca3af" />
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="home" size={14} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {item.deliveryAddress || item.address?.buildingName || 'Delivery Address'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Date and Time */}
            <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text className="text-xs text-gray-500 ml-2">
                Completed: {item.orderDate || 'N/A'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;
