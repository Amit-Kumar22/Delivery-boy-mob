import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  DeliveryBoyDetailScreen,
  VehicleFormScreen,
  DocumentFormScreen,
  ServiceAreaListScreen,
  ProductListScreen,
} from '@/features/profile/screens';

export type ProfileStackParamList = {
  ProfileDetail: undefined;
  VehicleForm: {
    initialData?: {
      vehicleType: string;
      vehicleNumber: string;
      model: string;
      image: string | null;
    };
  };
  DocumentForm: undefined;
  ServiceAreaList: undefined;
  ProductList: undefined;
  
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileDetail" component={DeliveryBoyDetailScreen} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
      <Stack.Screen name="DocumentForm" component={DocumentFormScreen} />
      <Stack.Screen name="ServiceAreaList" component={ServiceAreaListScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
    </Stack.Navigator>
  );
};
