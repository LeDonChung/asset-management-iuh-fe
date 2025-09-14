import { configureStore } from '@reduxjs/toolkit'
import assetSlice from './slices/assetSlice'
import authSlice from './slices/authSlice'
export const store = configureStore({
  reducer: {
    asset: assetSlice,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
