import React, { useEffect } from 'react';
import { View, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthStack';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#16A34A' }}>
      <StatusBar barStyle="light-content" backgroundColor="#16A34A" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image 
          source={require('../../../../assets/images/spash_logo-1.png')}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
};
