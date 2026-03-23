import { Navigate, Outlet } from 'react-router-dom';

const isTokenExpired = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const paddingNeeded = (4 - (base64.length % 4)) % 4;
    const base64Padded = base64 + '='.repeat(paddingNeeded);
    const payloadJson = atob(base64Padded);
    const payload = JSON.parse(payloadJson);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const allowed = Boolean(token) && !isTokenExpired(token);

  return allowed ? <Outlet /> : <Navigate to="/login" replace />;
}

