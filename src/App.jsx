import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard, GuestGuard, RoleGuard } from "./routes/RoleGuard";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Auth/Login";
import ChatPage from "./pages/Chat/ChatPage";
import PackagesPage from "./pages/Admin/PackagesPage";
import UsersPage from "./pages/Admin/UsersPage";
import NotFound from "./pages/NotFound/NotFound";
import Forbidden from "./pages/NotFound/Forbidden";
import { ROLES } from "./lib/roles";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_APP ? `/${import.meta.env.VITE_APP}` : "/"}>
      <Routes>
        <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/403" element={<Forbidden />} />

        <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
          <Route index element={<ChatPage />} />
          <Route
            path="packages"
            element={
              <RoleGuard allowed={[ROLES.ADMIN, ROLES.UPLOADER]}>
                <PackagesPage />
              </RoleGuard>
            }
          />
          <Route
            path="users"
            element={
              <RoleGuard allowed={[ROLES.ADMIN]}>
                <UsersPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
