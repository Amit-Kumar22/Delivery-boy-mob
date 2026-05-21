# DeliveryBoy Mobile App

A React Native mobile application for delivery partners built with Expo. This app allows delivery boys to manage their deliveries, track earnings, and handle customer orders efficiently.

## Features

- **Authentication**: Login, Registration, and Forgot Password with the same API as KhanaMart
- **Dashboard**: View delivery stats, earnings, and ratings
- **Order Management**: View and manage assigned orders
- **Profile Management**: Update profile information and settings
- **Real-time Updates**: Track delivery status and earnings

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for routing
- **TailwindCSS** (NativeWind) for styling
- **Zustand** for state management
- **React Query** for API calls and caching
- **React Hook Form** + **Zod** for form validation
- **Axios** for HTTP requests
- **AsyncStorage** for local data persistence

## Project Structure

```
DeliveryBoy-mob/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── assets/                # Images and static assets
└── src/
    ├── api/              # API configuration
    │   ├── axios.ts      # Axios instance with interceptors
    │   └── queryClient.ts # React Query client setup
    ├── config/           # App configuration
    │   ├── env.ts        # Environment variables
    │   └── ReactotronConfig.ts # Debug tool config
    ├── constants/        # App constants
    │   ├── theme.ts      # Colors, spacing, fonts
    │   └── app.ts        # App-level constants
    ├── features/         # Feature modules
    │   ├── auth/         # Authentication feature
    │   │   ├── screens/  # Auth screens
    │   │   ├── hooks/    # Auth-related hooks
    │   │   ├── services/ # Auth API services
    │   │   ├── types.ts  # Auth type definitions
    │   │   └── validation.ts # Form validation schemas
    │   └── dashboard/    # Dashboard feature
    │       └── screens/  # Dashboard screens
    ├── navigation/       # Navigation configuration
    │   ├── AuthStack.tsx # Auth flow navigation
    │   └── DashboardNavigator.tsx # Main app navigation
    └── store/           # Global state management
        └── authStore.ts # Authentication state
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS Simulator (for Mac) or Android Emulator
- Expo CLI

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd /Users/amitkumar/Documents/hiprotech/mobile/DeliveryBoy-mob
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Update the API base URL in `src/config/env.ts`
   - The default URL is set to `http://76.13.245.49:8081`
   - Change this to your backend server IP address

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on a platform**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`

## API Integration

The app uses the same authentication APIs as KhanaMart:

- **Login**: `POST /api/v1/auth/login`
- **Register**: `POST /api/v1/auth/register`
- **Forgot Password**: `POST /api/v1/auth/forgotPassword`
- **Logout**: `DELETE /api/v1/auth/logout`

### API Configuration

The API base URL is configured in `src/config/env.ts`:

```typescript
export const ENV = {
  API_BASE_URL: "http://76.13.245.49:8081",
  API_VERSION: "v1",
};
```

## Key Features Implementation

### Authentication Flow

1. **Splash Screen** → Shows app logo for 2 seconds
2. **Onboarding Screen** → Welcome screen with app introduction
3. **Login/Register** → User authentication
4. **Dashboard** → Main app interface after successful login

### State Management

- **Zustand** is used for global state management
- Auth state persists using AsyncStorage
- Automatic token injection in API requests

### Styling

- **NativeWind** (TailwindCSS for React Native) for consistent styling
- Custom theme with primary colors matching KhanaMart
- Responsive design for different screen sizes

## Development

### Debug Tools

- **Reactotron** is configured for development debugging
- API requests/responses are logged in development mode
- Error tracking and state inspection available

### Type Safety

- Full TypeScript support throughout the app
- Strong typing for API responses, navigation, and state
- Zod schemas for runtime type validation

## Notes

- **Home Screen**: Currently uses dummy data for demonstration
- **Real Data**: API integration for orders and delivery tracking will be implemented
- **Design**: Follows the exact same design patterns as KhanaMart-mob
- **Theme**: Uses the same color scheme and styling approach

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## Environment Setup

Make sure to update the following before running:

1. Backend API URL in `src/config/env.ts`
2. Android/iOS bundle identifiers in `app.json` if needed
3. App icons and splash screens in `assets/images/`

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for delivery partners**
# Delivery-boy-mob
