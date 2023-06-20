import { configureStore } from "@reduxjs/toolkit"
import { apiSlice } from "../features/api/apiSlice"
import usersReducer from '../features/users/usersSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    users: usersReducer,
    auth: authReducer
  },
  //Middleware functions sit between the dispatching of an action and the updating of the store
  //getDefaultMiddleware is a function provided by Redux Toolkit that returns an array of default middleware.
  //The concat() function is then used to concatenate the default middleware array with the apiSlice.middleware array
  //The resulting array of middleware functions is passed as the value of the middleware property in the configureStore function
  middleware: getDefaultMiddleware => 
    getDefaultMiddleware().concat(apiSlice.middleware)
})