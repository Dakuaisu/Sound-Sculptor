import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // Wizard state
  selectedMoods: [],
  selectedGenres: [],
  sliders: {
    danceability: 50,
    energy: 50,
    loudness: 50,
    acousticness: 50,
    instrumentalness: 50,
    tempo: 50,
    liveness: 50,
  },

  toggleMood: (mood) =>
    set((state) => {
      const exists = state.selectedMoods.includes(mood)
      return {
        selectedMoods: exists
          ? state.selectedMoods.filter((m) => m !== mood)
          : [...state.selectedMoods, mood],
      }
    }),

  toggleGenre: (genre) =>
    set((state) => {
      const exists = state.selectedGenres.includes(genre)
      return {
        selectedGenres: exists
          ? state.selectedGenres.filter((g) => g !== genre)
          : [...state.selectedGenres, genre],
      }
    }),

  setSlider: (key, value) =>
    set((state) => ({
      sliders: { ...state.sliders, [key]: value },
    })),

  resetWizard: () =>
    set({
      selectedMoods: [],
      selectedGenres: [],
      sliders: {
        danceability: 50,
        energy: 50,
        loudness: 50,
        acousticness: 50,
        instrumentalness: 50,
        tempo: 50,
        liveness: 50,
      },
    }),

  // Playlist result state
  playlist: null,
  setPlaylist: (playlist) => set({ playlist }),
  clearPlaylist: () => set({ playlist: null }),

  // Loading / error
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearError: () => set({ error: null }),
}))

export default useStore
