import { create } from 'zustand'
import type { Profile, UserPreferences } from '@/types/database'

interface UserState {
  profile: Profile | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null
  setProfile: (profile: Profile | null) => void
  setPreferences: (preferences: UserPreferences | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  updateProfile: (updates: Partial<Profile>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  reset: () => void
}

const initialState = {
  profile: null,
  preferences: null,
  isLoading: false,
  error: null,
}

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setProfile: (profile) => set({ profile }),

  setPreferences: (preferences) => set({ preferences }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),

  updatePreferences: (updates) =>
    set((state) => ({
      preferences: state.preferences
        ? { ...state.preferences, ...updates }
        : null,
    })),

  reset: () => set(initialState),
}))
