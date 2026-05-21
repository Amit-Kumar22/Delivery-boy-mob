export const COLORS = {
  primary: '#2EB85C',
  primaryDark: '#27A350',
  primaryLight: '#E8F7EE',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
  red: {
    500: '#EF4444',
  },
  blue: {
    50: '#EFF6FF',
    600: '#2563EB',
  },
  yellow: {
    500: '#F59E0B',
    100: '#FEF3C7',
  },
  orange: {
    500: '#F97316',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const FONT_SIZES = {
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '4xl': 36,
} as const;
