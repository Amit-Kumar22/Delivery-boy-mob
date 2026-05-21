import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export const OrderHistoryDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const order = route.params?.order;

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600">No order data provided.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 px-4 py-2 bg-blue-50 rounded-lg">
            <Text className="text-blue-600">Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isDelivered = order.orderStatus?.toUpperCase() === 'DELIVERED';

  // Handle phone call
  const handleCall = () => {
    const phone = order.customerPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
                {order.orderNumber || `ORD-${order.id}`}
              </Text>
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {order.items?.map((i: any) => i.product?.name || i.name).join(', ') || 'Order items'}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-full ${isDelivered ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-semibold ${isDelivered ? 'text-green-800' : 'text-red-800'}`}>
              {isDelivered ? 'Delivered' : 'Cancelled'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Status Steps - All Completed */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 flex-1">Accepted</Text>
            </View>
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 flex-1">Picked</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 flex-1">Out</Text>
            </View>
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text className="text-sm font-semibold text-gray-900 flex-1">Delivered</Text>
            </View>
          </View>
        </View>

        {/* Completed Date */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm flex-row items-center">
          <Ionicons name="calendar-outline" size={20} color="#22c55e" />
          <Text className="text-sm text-gray-600 ml-3">
            Completed: {order.orderDate || order.completedDate || 'N/A'}
          </Text>
        </View>

        {/* Customer Info */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <Text className="text-xs text-gray-500 mb-2 uppercase">Customer</Text>
          <View className="flex-row items-center justify-between">
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
                {order.customerName || 'Customer'}
              </Text>
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {order.customerPhone || 'No phone'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleCall}
              className="w-12 h-12 rounded-full bg-green-500 items-center justify-center"
              style={{ flexShrink: 0 }}
            >
              <Ionicons name="call" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Pickup Location */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3" style={{ flexShrink: 0 }}>
              <Ionicons name="location" size={18} color="#22c55e" />
            </View>
            <Text className="text-xs text-gray-500 uppercase">Pickup From</Text>
          </View>
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
            {order.pickupLocation || order.storeName || 'Domino\'s Pizza, Huda Market'}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {order.pickupAddress || 'Huda Market, Sector 15, Gurugram'}
          </Text>
        </View>

        {/* Delivery Address */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3" style={{ flexShrink: 0 }}>
              <Ionicons name="home" size={18} color="#f97316" />
            </View>
            <Text className="text-xs text-gray-500 uppercase">Deliver To</Text>
          </View>
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
            {order.deliveryAddress || order.address?.buildingName || 'A-101, Palm Heights, Sector 9'}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {order.address?.phone || order.customerPhone || '+91 87654 32109'}
          </Text>
        </View>

        {/* Payment */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3" style={{ flexShrink: 0 }}>
              <Ionicons name="card-outline" size={18} color="#3b82f6" />
            </View>
            <Text className="text-xs text-gray-500 uppercase">Payment</Text>
          </View>
          <Text className="text-base font-bold text-gray-900">
            {order.paymentMode || 'Paid'}
          </Text>
        </View>

        {/* Items */}
        <View className="bg-white mx-4 mt-3 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="text-xs text-gray-500 mb-3 uppercase">Items</Text>
          <Text className="text-base text-gray-900">
            {order.items?.map((i: any) => `${i.quantity}x ${i.product?.name || i.name || 'Item'}`).join(', ') || '1x Large Pizza, 1x Garlic Bread'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderHistoryDetailScreen;
