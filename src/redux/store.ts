import { configureStore } from "@reduxjs/toolkit";
import connectionSlice from "./slices/connectionSlice";
import scanSlice from "./slices/scanSlice";
import authenticationSlice from "./slices/authenticationSlice";
import channelsSlice from "./slices/channelsSlice";
import appSlice from "./slices/appSlice";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "authentication",
  storage,
  // Only the password itself should survive a restart.
  blacklist: ["passwordOk", "passwordDialogOpen"],
};

const persistedReducer = persistReducer(
  persistConfig,
  authenticationSlice.reducer,
);
export const store = configureStore({
  reducer: {
    connection: connectionSlice.reducer,
    scan: scanSlice.reducer,
    authentication: persistedReducer,
    channels: channelsSlice.reducer,
    app: appSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
