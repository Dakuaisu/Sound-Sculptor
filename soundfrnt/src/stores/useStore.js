import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const SLIDER_DEFAULTS = {
  danceability: 50,
  energy: 50,
  loudness: 50,
  acousticness: 50,
  instrumentalness: 50,
  tempo: 50,
  liveness: 50,
}

let toastSeq = 0

const useStore = create(
  persist(
    (set, get) => ({
      // ---- Auth ----
      user: null,
      isAuthenticated: false,
      authReady: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthReady: (v) => set({ authReady: v }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // ---- Wizard ----
      selectedMoods: [],
      selectedGenres: [],
      sliders: { ...SLIDER_DEFAULTS },

      toggleMood: (mood) =>
        set((state) => ({
          selectedMoods: state.selectedMoods.includes(mood)
            ? state.selectedMoods.filter((m) => m !== mood)
            : [...state.selectedMoods, mood],
        })),

      toggleGenre: (genre) =>
        set((state) => ({
          selectedGenres: state.selectedGenres.includes(genre)
            ? state.selectedGenres.filter((g) => g !== genre)
            : [...state.selectedGenres, genre],
        })),

      setSlider: (key, value) =>
        set((state) => ({ sliders: { ...state.sliders, [key]: value } })),

      resetWizard: () =>
        set({ selectedMoods: [], selectedGenres: [], sliders: { ...SLIDER_DEFAULTS } }),

      // ---- Playlist result ----
      playlist: null,
      setPlaylist: (playlist) => set({ playlist }),
      clearPlaylist: () => set({ playlist: null }),

      // ---- Loading ----
      loading: false,
      setLoading: (loading) => set({ loading }),

      // ---- Toasts ----
      toasts: [],
      addToast: ({ type = 'info', title, message, duration = 4500 }) => {
        const id = `${Date.now()}-${++toastSeq}`
        set((state) => ({ toasts: [...state.toasts, { id, type, title, message }] }))
        if (duration) setTimeout(() => get().dismissToast(id), duration)
        return id
      },
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      // Back-compat: existing callers use setError(string)
      setError: (message) => {
        set({ loading: false })
        get().addToast({ type: 'danger', title: 'Something went wrong', message })
      },
    }),
    {
      name: 'sound-sculptor',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedMoods: state.selectedMoods,
        selectedGenres: state.selectedGenres,
        sliders: state.sliders,
      }),
    }
  )
)

export default useStore
