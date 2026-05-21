import React from 'react';
import ProductListScreen from '@/features/profile/screens/ProductListScreen';

// Render the ProductListScreen so Orders tab shows dynamic orders
export const OrdersScreen: React.FC = ({ navigation }: any) => {
  return <ProductListScreen navigation={navigation} />;
};
