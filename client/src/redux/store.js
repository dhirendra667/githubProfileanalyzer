import { configureStore } from '@reduxjs/toolkit';
import githubReducer from './slices/githubSlice';

const store = configureStore({
  reducer: {
    github: githubReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
});

export default store;
