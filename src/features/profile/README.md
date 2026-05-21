# Delivery Boy Profile Feature

This feature implements a comprehensive delivery boy profile management system with the following endpoints and screens.

## 📋 API Endpoints

### 1. Get Logged In Profile
- **Endpoint**: `GET /v1/delivery-user/loggedIn`
- **Description**: Fetches the complete profile of the logged-in delivery boy
- **Response**: Complete delivery boy profile with vehicle, documents, and service areas

### 2. Add/Update Vehicle Details
- **Endpoint**: `POST /v1/delivery-user/add-update-vehicle-detail`
- **Request Body**:
  ```json
  {
    "vehicleType": "string",
    "vehicleNumber": "string",
    "model": "string",
    "image": "string"
  }
  ```

### 3. Add/Update Document
- **Endpoint**: `POST /v1/delivery-user/add-update-document`
- **Request Body**:
  ```json
  {
    "type": "AADHAR_CARD",
    "frontImage": "string",
    "backImage": "string"
  }
  ```
- **Document Types**: `AADHAR_CARD`, `DRIVING_LICENSE`, `PAN_CARD`

### 4. Update Delivery Status
- **Endpoint**: `PUT /v1/delivery-user/update-status/{userId}`
- **Request Body**:
  ```json
  {
    "status": "ACTIVE"
  }
  ```
- **Status Values**: `ACTIVE`, `INACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`, `BLOCKED`, `DELETED`

## 🎨 Screens

### 1. DeliveryBoyDetailScreen
Main profile screen displaying:
- Profile header with image, name, rating, and total deliveries
- Contact information (email, phone)
- Vehicle details with verification status
- Document list with front/back images
- Service areas coverage
- Account information

**Features**:
- Pull-to-refresh
- Status badges with color coding
- Professional card-based UI
- Error handling with retry option
- Loading states

### 2. VehicleFormScreen
Form to add or update vehicle details:
- Vehicle image upload
- Vehicle type selection
- Vehicle number input (auto-capitalized)
- Model information
- Form validation
- Loading states during submission

### 3. DocumentFormScreen
Form to upload documents:
- Document type selection (Radio buttons)
- Front image upload
- Back image upload
- Form validation
- Info box with guidelines
- Loading states during submission

## 🔧 Implementation Details

### File Structure
```
src/features/profile/
├── types.ts                          # TypeScript interfaces
├── services/
│   └── profileService.ts             # API service functions
├── hooks/
│   └── useProfile.ts                 # React Query hooks
├── screens/
│   ├── DeliveryBoyDetailScreen.tsx   # Main profile display
│   ├── VehicleFormScreen.tsx         # Vehicle form
│   ├── DocumentFormScreen.tsx        # Document upload form
│   └── index.ts                      # Screen exports
└── index.ts                          # Feature exports
```

### Services
All API calls are centralized in `profileService.ts`:
- `getLoggedInProfile()`: Fetch delivery boy profile
- `addUpdateVehicleDetail(data)`: Add/update vehicle
- `addUpdateDocument(data)`: Add/update document
- `updateDeliveryStatus(userId, status)`: Update status

### React Query Hooks
Custom hooks in `useProfile.ts`:
- `useDeliveryBoyProfile()`: Query hook for profile data
- `useAddUpdateVehicle()`: Mutation hook for vehicle updates
- `useAddUpdateDocument()`: Mutation hook for document uploads
- `useUpdateDeliveryStatus()`: Mutation hook for status updates

All mutation hooks automatically invalidate and refetch the profile query on success.

## 🎯 Features

### UI/UX Features
- **Responsive Design**: Adapts to different screen sizes
- **Pull-to-Refresh**: Refresh profile data with pull gesture
- **Loading States**: Clear feedback during data fetching
- **Error Handling**: User-friendly error messages with retry option
- **Status Badges**: Color-coded status indicators
- **Image Preview**: Display vehicle and document images
- **Form Validation**: Client-side validation before submission

### Technical Features
- **TypeScript**: Full type safety
- **React Query**: Efficient data caching and synchronization
- **NativeWind**: Tailwind CSS for React Native styling
- **Axios Interceptors**: Automatic token injection
- **Error Handling**: Comprehensive error management
- **Code Organization**: Clean separation of concerns

## 🚀 Usage

### Navigation Integration
The `DeliveryBoyDetailScreen` is integrated into the main tab navigator:

```tsx
import { DeliveryBoyDetailScreen } from '../features/profile/screens';

// In MainTabNavigator
<Tab.Screen name="Profile" component={DeliveryBoyDetailScreen} />
```

### Using the Hooks
```tsx
// In any component
import { useDeliveryBoyProfile, useAddUpdateVehicle } from '@/features/profile';

const MyComponent = () => {
  const { data, isLoading, error, refetch } = useDeliveryBoyProfile();
  const addVehicle = useAddUpdateVehicle();

  const handleAddVehicle = async (vehicleData) => {
    await addVehicle.mutateAsync(vehicleData);
  };

  // ...
};
```

## 🎨 Design Highlights

### Color Scheme
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow/Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Neutral**: Gray shades

### Status Colors
- **ACTIVE**: Green
- **INACTIVE**: Gray
- **PENDING_VERIFICATION**: Yellow
- **SUSPENDED**: Orange
- **BLOCKED**: Red
- **DELETED**: Red

### Availability Colors
- **ONLINE**: Green
- **OFFLINE**: Gray
- **BUSY**: Orange

## 📝 TODO / Future Enhancements

1. **Image Picker Integration**: Implement actual image picker for vehicle and documents
2. **Status Update UI**: Add interface to update delivery status
3. **Navigation to Forms**: Wire up "Update Vehicle" and "Add Document" buttons
4. **Image Zoom**: Add image viewer for document images
5. **Push Notifications**: Notify when documents are verified
6. **Analytics**: Track profile completeness and verification status
7. **Offline Support**: Cache profile data for offline viewing

## 🔐 Security Considerations

- All API calls use Bearer token authentication
- Images should be validated on backend
- Document verification should be done by admin
- Status updates may require admin privileges
- Sensitive data is not logged in production

## 🐛 Known Issues

- Image picker placeholder needs implementation
- Navigation props typing can be improved with proper navigator setup
- Some TypeScript strict mode issues may need addressing

## 📚 Dependencies

- `@tanstack/react-query`: Data fetching and caching
- `axios`: HTTP client
- `react-navigation`: Navigation
- `nativewind`: Styling
- `@expo/vector-icons`: Icons
- `react-native-safe-area-context`: Safe area handling
