import { Navigate, useLocation } from "react-router-dom";
import { getSessionUser, getToken } from "../lib/auth";

export function AuthGuard({ children }) {
  const token = getToken();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function GuestGuard({ children }) {
  const token = getToken();
  if (token) return <Navigate to="/" replace />;
  return children;
}

// allowed: array of role strings permitted to view this route
export function RoleGuard({ allowed, children }) {
  const role = getSessionUser()?.role;
  if (!allowed.includes(role)) return <Navigate to="/403" replace />;
  return children;
}
