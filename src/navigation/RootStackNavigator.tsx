import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabNavigator } from './DashboardNavigator';
import OrderDetailScreen from '@/features/profile/screens/OrderDetailScreen';
import OrderHistoryScreen from '@/features/profile/screens/OrderHistoryScreen';
import OrderHistoryDetailScreen from '@/features/profile/screens/OrderHistoryDetailScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  OrderDetail: { order?: any };
  OrderHistory: undefined;
  OrderHistoryDetail: { order?: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderHistoryDetail" component={OrderHistoryDetailScreen} />
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
