import { configureStore } from '@reduxjs/toolkit'
import assetSlice from './slices/assetSlice'
import authSlice from './slices/authSlice'
import unitSlice from './slices/unitSlice'
import fileSlice from './slices/fileSlice'
import inventorySlice from './slices/inventorySlice'
import userSlice from './slices/userSlice'
import roleSlice from './slices/roleSlice'
import assetBookSlice from './slices/assetBookSlice'

export const store = configureStore({
  reducer: {
    asset: assetSlice,
    auth: authSlice,
    unit: unitSlice,
    file: fileSlice,
    inventory: inventorySlice,
    user: userSlice,
    role: roleSlice,
    assetBook: assetBookSlice,
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
