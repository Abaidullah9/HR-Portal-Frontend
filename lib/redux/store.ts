import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer from './slices/leaveSlice';
import payrollReducer from './slices/payrollSlice';
import recruitmentReducer from './slices/recruitmentSlice';
import performanceReducer from './slices/performanceSlice';
import organizationReducer from './slices/organizationSlice';
import reportReducer from './slices/reportSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      employee: employeeReducer,
      attendance: attendanceReducer,
      leaves: leaveReducer,
      payroll: payrollReducer,
      recruitment: recruitmentReducer,
      performance: performanceReducer,
      organization: organizationReducer,
      reports: reportReducer,
    },
  });
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
