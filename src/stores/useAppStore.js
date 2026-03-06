import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // UI state
  currentScreen: 'dashboard',
  isLoading: false,
  loadingMessage: '',

  // Modals / sheets
  activeModal: null,    // null | 'swap' | 'filter' | 'booster' | 'recipe'
  activeSlotId: null,   // which meal slot modal is open for

  // Bottom sheet
  bottomSheetOpen: false,
  bottomSheetContent: null,

  // Toast notifications
  toast: null,

  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setLoading: (val, msg = '') => set({ isLoading: val, loadingMessage: msg }),
  openModal: (modal, slotId = null) => set({ activeModal: modal, activeSlotId: slotId }),
  closeModal: () => set({ activeModal: null, activeSlotId: null }),
  openBottomSheet: (content) => set({ bottomSheetOpen: true, bottomSheetContent: content }),
  closeBottomSheet: () => set({ bottomSheetOpen: false, bottomSheetContent: null }),
  showToast: (toast) => {
    set({ toast })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
