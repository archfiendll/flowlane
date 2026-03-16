import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext.jsx";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Departments from "./pages/Departments.jsx";
import Vacations from "./pages/Vacations.jsx";
import Invitations from "./pages/Invitations.jsx";
import Register from "./pages/Register.jsx";
import AcceptInvite from "./pages/AcceptInvite.jsx";
import CompanySetup from "./pages/CompanySetup.jsx";

function DefaultRouteRedirect() {
  const { defaultRoute, isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? defaultRoute : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/accept" element={<AcceptInvite />} />



      {/* Protected + Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/employees"
          element={(
            <ProtectedRoute roles={["admin", "manager"]}>
              <Employees />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/company-setup"
          element={(
            <ProtectedRoute roles={["admin", "manager"]}>
              <CompanySetup />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/departments"
          element={(
            <ProtectedRoute roles={["admin", "manager"]}>
              <Departments />
            </ProtectedRoute>
          )}
        />
        <Route path="/vacations" element={<Vacations />} />
        <Route
          path="/invitations"
          element={(
            <ProtectedRoute roles={["admin", "manager"]}>
              <Invitations />
            </ProtectedRoute>
          )}
        />
      </Route>

      {/* Defaults */}
        <Route path="/" element={<DefaultRouteRedirect />} />
        <Route path="*" element={<DefaultRouteRedirect />} />
    </Routes>
  );
}
