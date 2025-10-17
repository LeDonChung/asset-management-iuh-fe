import { configureStore } from '@reduxjs/toolkit'
import assetSlice from './slices/assetSlice'
import authSlice from './slices/authSlice'
import unitSlice from './slices/unitSlice'
import fileSlice from './slices/fileSlice'
import inventorySlice from './slices/inventorySlice'
import userSlice from './slices/userSlice'
import roleSlice from './slices/roleSlice'
import assetBookSlice from './slices/assetBookSlice'
import permissionSlice from './slices/permissionSlice'
import alertSlice from './slices/alertSlice'
import roomSlice from './slices/roomSlice'
import liquidationSlice from './slices/liquidationSlice'
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
    permission: permissionSlice,
    alert: alertSlice,
    room: roomSlice,
    liquidation: liquidationSlice,
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
