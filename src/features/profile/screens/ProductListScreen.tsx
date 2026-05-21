import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Platform, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAllProducts, useAllFranchises, useUpdateOrderStatus } from "../hooks/useProfile";

const formatDate = (d: Date) => d.toISOString().slice(0, 10);

// Get today's date
const getTodayDate = () => formatDate(new Date());

// Status badge colors
const getStatusBadgeColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100';
    case 'ACCEPTED':
      return 'bg-blue-100';
    case 'PICKED':
    case 'PICKED_UP':
      return 'bg-purple-100';
    case 'OUT_FOR_DELIVERY':
      return 'bg-orange-100';
    case 'DELIVERED':
      return 'bg-green-100';
    case 'CANCELLED':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

const getStatusTextColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'text-yellow-800';
    case 'ACCEPTED':
      return 'text-blue-800';
    case 'PICKED':
    case 'PICKED_UP':
      return 'text-purple-800';
    case 'OUT_FOR_DELIVERY':
      return 'text-orange-800';
    case 'DELIVERED':
      return 'text-green-800';
    case 'CANCELLED':
      return 'text-red-800';
    default:
      return 'text-gray-800';
  }
};

const getStatusDisplayText = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'Pending';
    case 'ACCEPTED':
      return 'Accepted';
    case 'PICKED':
    case 'PICKED_UP':
      return 'Picked Up';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export const ProductListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | undefined>(undefined);
  const [showFranchiseDropdown, setShowFranchiseDropdown] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const todayDate = getTodayDate();

  // Fetch franchises
  const { data: franchisesData, isLoading: franchisesLoading } = useAllFranchises();
  const franchises = franchisesData?.content || [];

  // Fetch today's orders for selected franchise
  const { data, isLoading, error, refetch, isRefetching } = useAllProducts(
    page, 
    size, 
    ['orderDate,desc', 'created,desc'], // Sort by order date descending (latest completed date first)
    selectedFranchiseId,
    todayDate
  );

  // Update order status mutation
  const updateOrderStatus = useUpdateOrderStatus();

  // Filter only active orders (not delivered or cancelled) and sort by date
  const activeOrders = (data?.content?.filter((order: any) => 
    !['DELIVERED', 'CANCELLED'].includes(order.orderStatus?.toUpperCase())
  ) || []).sort((a: any, b: any) => {
    // Client-side sorting to ensure latest orders show first
    const dateA = new Date(a.orderDate || a.completedDate || a.created || 0).getTime();
    const dateB = new Date(b.orderDate || b.completedDate || b.created || 0).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const handleStatusUpdate = (order: any) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = (status: 'DELIVERED' | 'CANCELLED' | 'RETURNED') => {
    if (!selectedOrder) return;

    Alert.alert(
      'Confirm Status Update',
      `Are you sure you want to mark order ${selectedOrder.orderNumber} as ${status}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            updateOrderStatus.mutate(
              {
                orderNumber: selectedOrder.orderNumber,
                orderStatus: status,
              },
              {
                onSuccess: () => {
                  Alert.alert('Success', `Order status updated to ${status}`);
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  refetch();
                },
                onError: (error: any) => {
                  Alert.alert(
                    'Error',
                    error?.response?.data?.message || 'Failed to update order status'
                  );
                },
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading || franchisesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-4 text-gray-600">Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedFranchise = franchises.find((f: any) => f.franchiseId === selectedFranchiseId);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-bold text-gray-900">All Orders</Text>
            <Text className="text-sm text-gray-500 mt-1">Today's deliveries</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('OrderHistory')}
            className="flex-row items-center"
          >
            <Ionicons name="time-outline" size={20} color="#6b7280" />
            <Text className="ml-1 text-gray-600">History</Text>
          </TouchableOpacity>
        </View>

        {/* Franchise Dropdown */}
        <View>
          <Text className="text-xs text-gray-600 mb-2">Select Franchise</Text>
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
      </View>

      {/* Orders List */}
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-semibold text-gray-800 mb-2">No orders today</Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              Today's orders will appear here
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('OrderDetail', { order: item })}
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
                    {item.pickupLocation || item.storeName || 'Burger King, MG Road'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center ml-3">
                <View className="w-0.5 h-4 bg-gray-300" />
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-3 mt-0.5">
                  <Ionicons name="cube" size={14} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600" numberOfLines={1}>
                    {item.deliveryAddress || item.address?.buildingName || 'B-204, Green Valley Apartments, Sector 22'}
                  </Text>
                </View>
              </View>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('OrderDetail', { order: item })}
              className="border border-gray-200 rounded-lg py-2.5 items-center mt-2"
            >
              <Text className="text-gray-700 font-medium">View Details</Text>
            </TouchableOpacity>

            {/* Update Status Button */}
            <TouchableOpacity 
              onPress={() => handleStatusUpdate(item)}
              className="bg-green-500 rounded-lg py-2.5 items-center mt-2"
            >
              <Text className="text-white font-semibold">Update Status</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Update Order Status</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View className="mb-6">
                <Text className="text-sm text-gray-600 mb-1">Order Number</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {selectedOrder.orderNumber || `ORD-${selectedOrder.id}`}
                </Text>
              </View>
            )}

            <Text className="text-sm text-gray-600 mb-3">Select new status:</Text>
            
            {/* Status Options */}
            <TouchableOpacity 
              onPress={() => confirmStatusUpdate('DELIVERED')}
              disabled={updateOrderStatus.isPending}
              className="bg-green-100 border border-green-300 rounded-xl p-4 mb-3 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                <Ionicons name="checkmark-circle" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-green-800 font-semibold text-base">Delivered</Text>
                <Text className="text-green-600 text-xs mt-0.5">Mark order as delivered</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => confirmStatusUpdate('CANCELLED')}
              disabled={updateOrderStatus.isPending}
              className="bg-red-100 border border-red-300 rounded-xl p-4 mb-3 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-red-500 items-center justify-center mr-3">
                <Ionicons name="close-circle" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-red-800 font-semibold text-base">Cancelled</Text>
                <Text className="text-red-600 text-xs mt-0.5">Cancel this order</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => confirmStatusUpdate('RETURNED')}
              disabled={updateOrderStatus.isPending}
              className="bg-orange-100 border border-orange-300 rounded-xl p-4 mb-3 flex-row items-center"
            >
              <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center mr-3">
                <Ionicons name="return-down-back" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-orange-800 font-semibold text-base">Returned</Text>
                <Text className="text-orange-600 text-xs mt-0.5">Mark order as returned</Text>
              </View>
            </TouchableOpacity>

            {updateOrderStatus.isPending && (
              <View className="items-center mt-4">
                <ActivityIndicator size="small" color="#22c55e" />
                <Text className="text-gray-600 text-sm mt-2">Updating status...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductListScreen;
