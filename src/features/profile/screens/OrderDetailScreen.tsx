import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUpdateOrderStatus } from '../hooks/useOrder';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Order status enum
type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PICKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

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

// Status Step Component
const StatusStep: React.FC<{ 
  stepNumber: number; 
  title: string; 
  isActive: boolean; 
  isCompleted: boolean;
  isLast?: boolean;
}> = ({ stepNumber, title, isActive, isCompleted, isLast }) => {
  // Calculate dynamic sizes based on screen width
  const stepSize = Math.min(40, SCREEN_WIDTH * 0.09);
  const fontSize = Math.min(14, SCREEN_WIDTH * 0.035);
  const labelFontSize = Math.min(10, SCREEN_WIDTH * 0.025);
  
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 2 }}>
      <View style={{ alignItems: 'center', width: stepSize + 10 }}>
        <View 
          style={{
            width: stepSize,
            height: stepSize,
            borderRadius: stepSize / 2,
            backgroundColor: isCompleted || isActive ? '#22c55e' : '#d1d5db',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={stepSize * 0.5} color="white" />
          ) : (
            <Text style={{ 
              fontSize: fontSize, 
              fontWeight: 'bold',
              color: isActive || isCompleted ? 'white' : '#6b7280'
            }}>
              {stepNumber}
            </Text>
          )}
        </View>
        <Text 
          style={{
            marginTop: 4,
            fontSize: labelFontSize,
            textAlign: 'center',
            color: isActive ? '#111827' : '#6b7280',
            fontWeight: isActive ? '600' : '400',
            width: stepSize + 10,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {title}
        </Text>
      </View>
      {!isLast && (
        <View style={{ 
          height: 2, 
          flex: 1, 
          marginHorizontal: 2,
          backgroundColor: isCompleted ? '#22c55e' : '#d1d5db',
          marginTop: stepSize / 2 - 1,
        }} />
      )}
    </View>
  );
};

export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const order = route.params?.order;
  const [currentStatus, setCurrentStatus] = useState<string>(order?.orderStatus || 'PENDING');
  const [isDeliveryComplete, setIsDeliveryComplete] = useState(false);
  const orderMutation = useUpdateOrderStatus();

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

  // Get current step based on status
  const getCurrentStep = () => {
    const status = currentStatus?.toUpperCase();
    if (status === 'PENDING') return 0;
    if (status === 'ACCEPTED') return 1;
    if (status === 'PICKED' || status === 'PICKED_UP') return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  const currentStep = getCurrentStep();

  // Handle status update
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const identifier = order.orderNumber || order.id;
      await orderMutation.mutateAsync({ 
        orderNumber: identifier, 
        fallbackId: order.id, 
        orderStatus: newStatus 
      });
      setCurrentStatus(newStatus);
      
      // Show delivery complete screen
      if (newStatus === 'DELIVERED') {
        setIsDeliveryComplete(true);
      }
    } catch (err: any) {
      Alert.alert('Update failed', err?.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  // Get next action button
  const getActionButton = () => {
    const status = currentStatus?.toUpperCase();
    
    if (status === 'PENDING') {
      return {
        text: 'Accept Order',
        nextStatus: 'ACCEPTED',
        color: 'bg-green-500',
        hint: 'Review the order details before accepting'
      };
    }
    if (status === 'ACCEPTED') {
      return {
        text: 'Picked Up Order',
        nextStatus: 'PICKED',
        color: 'bg-green-500',
        hint: 'Head to the pickup location to collect the order'
      };
    }
    if (status === 'PICKED' || status === 'PICKED_UP') {
      return {
        text: 'Out for Delivery',
        nextStatus: 'OUT_FOR_DELIVERY',
        color: 'bg-green-500',
        hint: 'Update status after picking up the order'
      };
    }
    if (status === 'OUT_FOR_DELIVERY') {
      return {
        text: 'Mark as Delivered',
        nextStatus: 'DELIVERED',
        color: 'bg-green-500',
        hint: 'Confirm delivery only after handing over the package'
      };
    }
    return null;
  };

  const actionButton = getActionButton();

  // Handle phone call
  const handleCall = () => {
    const phone = order.customerPhone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  // If delivery is complete, show success screen
  if (isDeliveryComplete) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Delivery Completed</Text>
          <Text className="text-2xl font-bold text-gray-900 mb-4">Successfully 🎉</Text>
          <Text className="text-gray-600 text-center mb-8">
            Great job! Head back for more orders.
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Dashboard')}
            className="bg-green-500 px-8 py-4 rounded-xl w-full"
          >
            <Text className="text-white text-center font-semibold text-lg">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-4 pt-3 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center" style={{ flex: 1, marginRight: 8 }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="mr-3"
              style={{ padding: 4 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text 
                className="text-base font-bold text-gray-900" 
                numberOfLines={1}
                style={{ fontSize: Math.min(18, SCREEN_WIDTH * 0.045) }}
              >
                {order.orderNumber || `ORD-${order.id}`}
              </Text>
              <Text 
                className="text-xs text-gray-500" 
                numberOfLines={1}
                style={{ fontSize: Math.min(12, SCREEN_WIDTH * 0.03) }}
              >
                {order.items?.map((i: any) => i.product?.name || i.name).join(', ') || 'Order items'}
              </Text>
            </View>
          </View>
          <View 
            className={`rounded-full ${getStatusBadgeColor(currentStatus)}`}
            style={{ paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 }}
          >
            <Text 
              className={`font-semibold ${getStatusTextColor(currentStatus)}`} 
              numberOfLines={1}
              style={{ fontSize: Math.min(11, SCREEN_WIDTH * 0.028) }}
            >
              {getStatusDisplayText(currentStatus)}
            </Text>
          </View>
        </View>

        {/* Status Progress Bar */}
        <View 
          style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            marginTop: 8,
            paddingHorizontal: 4,
            minHeight: 65,
          }}
        >
          <StatusStep stepNumber={1} title="Accepted" isActive={currentStep === 0} isCompleted={currentStep > 0} />
          <StatusStep stepNumber={2} title="Picked" isActive={currentStep === 1} isCompleted={currentStep > 1} />
          <StatusStep stepNumber={3} title="Out" isActive={currentStep === 2} isCompleted={currentStep > 2} />
          <StatusStep stepNumber={4} title="Delivered" isActive={currentStep === 3} isCompleted={currentStep > 3} isLast />
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: actionButton ? 140 : 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info */}
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
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
          <View className="flex-row items-start mt-3 bg-yellow-50 p-3 rounded-lg">
            <Ionicons name="bulb-outline" size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
            <Text className="text-xs text-yellow-800 ml-2" style={{ flex: 1 }}>
              Call customer if location is unclear
            </Text>
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
            {order.pickupLocation || order.storeName || 'Burger King, MG Road'}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {order.pickupAddress || 'Shop 12, MG Road, Sector 14, Gurugram'}
          </Text>
        </View>

        {/* Delivery Address */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3" style={{ flexShrink: 0 }}>
              <Ionicons name="cube" size={18} color="#f97316" />
            </View>
            <Text className="text-xs text-gray-500 uppercase">Deliver To</Text>
          </View>
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
            {order.deliveryAddress || order.address?.buildingName || 'B-204, Green Valley Apartments, Sector 22'}
          </Text>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {order.address?.phone || order.customerPhone || '+91 98765 43210'}
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
            {order.paymentMode || 'COD'}
          </Text>
        </View>

        {/* Items */}
        <View className="bg-white mx-4 mt-3 mb-4 rounded-xl p-4 shadow-sm">
          <Text className="text-xs text-gray-500 mb-3 uppercase">Items</Text>
          <Text className="text-base text-gray-900">
            {order.items?.map((i: any) => `${i.quantity}x ${i.product?.name || i.name || 'Item'}`).join(', ') || '2x Whopper, 1x Fries, 1x Coke'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      {actionButton && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <View className="flex-row items-start mb-3">
            <Ionicons name="bulb-outline" size={16} color="#f59e0b" style={{ marginTop: 2 }} />
            <Text className="text-xs text-gray-600 ml-2 flex-1">{actionButton.hint}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleStatusUpdate(actionButton.nextStatus)}
            disabled={orderMutation.isPending}
            className={`${actionButton.color} px-6 py-4 rounded-xl flex-row items-center justify-center`}
          >
            {orderMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">{actionButton.text}</Text>
            )}
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 text-center mt-2">Update status after each step</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
