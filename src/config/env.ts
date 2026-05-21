import { Platform } from 'react-native';
import Constants from 'expo-constants';

// On Android emulator, localhost = 10.0.2.2
// On physical Android device or iOS, use your actual server IP
const getBaseURL = () => {
  // Check if we're in development mode
  const isDev = __DEV__;
  
  // Your actual backend server IP
  const PRODUCTION_URL = "http://76.13.245.49:8081";
  
  // For development, you can use localhost or your dev server IP
  const DEV_URL = PRODUCTION_URL; // Change this if you have a different dev server
  
  console.log('🔧 Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
  console.log('🔧 Platform:', Platform.OS);
  console.log('🔧 Using API URL:', isDev ? DEV_URL : PRODUCTION_URL);
  
  return isDev ? DEV_URL : PRODUCTION_URL;
};

export const ENV = {
  API_BASE_URL: getBaseURL(),
  API_VERSION: "v1",
  IS_DEV: __DEV__,
} as const;
