import { create } from 'zustand';
import { api } from '@/api/axios';
import { Address } from '@/features/auth/types';

export interface ProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  otpVerified: boolean;
  address?: Address;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  address: Address;
}

export interface UpdatePasswordRequest {
  password: string;
  confirmPassword: string;
  code: string;
}

export interface UpdateProfileResponse {
  statusCode: string;
  message: string;
  result: {};
}

interface ProfileState {
  profile: ProfileData | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updatePassword: (data: UpdatePasswordRequest) => Promise<void>;
  setProfile: (profile: ProfileData) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/v1/api/profile');
      set({ profile: response.data.result as ProfileData, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load profile', isLoading: false });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await api.put('/v1/api/profile/update', data);
      // After successful update, fetch the updated profile
      const profileResponse = await api.get('/v1/api/profile');
      set({ 
        profile: profileResponse.data.result as ProfileData, 
        isUpdating: false 
      });
    } catch (e: any) {
      set({ 
        error: e?.response?.data?.message ?? e?.message ?? 'Failed to update profile', 
        isUpdating: false 
      });
      throw e; // Re-throw to handle in component
    }
  },

  updatePassword: async (data: UpdatePasswordRequest) => {
    set({ isUpdating: true, error: null });
    try {
      await api.put('/v1/api/profile/update-password', data);
      set({ isUpdating: false });
    } catch (e: any) {
      set({ 
        error: e?.response?.data?.message ?? e?.message ?? 'Failed to update password', 
        isUpdating: false 
      });
      throw e; // Re-throw to handle in component
    }
  },

  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null, error: null }),
}));
