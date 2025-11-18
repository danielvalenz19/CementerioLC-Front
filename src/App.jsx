import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ManzanasPage from "./pages/ManzanasPage";
import NichosPage from "./pages/NichosPage";
import AppLayout from "./components/layout/AppLayout";

// Ruta protegida: exige access_token en localStorage
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Área de la app (layout + subrutas) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* /app → Dashboard */}
          <Route index element={<DashboardPage />} />
          {/* /app/manzanas */}
          <Route path="manzanas" element={<ManzanasPage />} />
          {/* /app/nichos */}
          <Route path="nichos" element={<NichosPage />} />
          {/* /app/perfil */}
          <Route path="perfil" element={<ProfilePage />} />
        </Route>

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
