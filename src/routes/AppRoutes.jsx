import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const NotFound = lazy(() => import('../pages/NotFound.jsx'));
const Login = lazy(() => import('../pages/login.jsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const Devices = lazy(() => import('../pages/Devices.jsx'));
const DeviceDetail = lazy(() => import('../pages/DeviceDetail.jsx'));
const Alerts = lazy(() => import('../pages/Alerts.jsx'));
const AlertRules = lazy(() => import('../pages/AlertRules.jsx'));
const History = lazy(() => import('../pages/History.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx'));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading" role="status">Loading…</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/rules" element={<AlertRules />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
