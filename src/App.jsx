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
import PropietariosPage from "./pages/PropietariosPage";
import PropietarioDetallePage from "./pages/PropietarioDetallePage";
import SolicitudesPage from "./pages/SolicitudesPage";
import SolicitudDetallePage from "./pages/SolicitudDetallePage";
import ArrendamientosPage from "./pages/ArrendamientosPage";
import ArrendamientoDetallePage from "./pages/ArrendamientoDetallePage";
import RecibosPage from "./pages/RecibosPage";
import TarifasPage from "./pages/TarifasPage";
import AlertasPage from "./pages/AlertasPage";
import ReportesPage from "./pages/ReportesPage";
import AuditoriaPage from "./pages/AuditoriaPage";
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
          {/* /app/solicitudes */}
          <Route path="solicitudes" element={<SolicitudesPage />} />
          {/* /app/solicitudes/:id */}
          <Route path="solicitudes/:id" element={<SolicitudDetallePage />} />
          {/* /app/arrendamientos */}
          <Route path="arrendamientos" element={<ArrendamientosPage />} />
          {/* /app/arrendamientos/:id */}
          <Route
            path="arrendamientos/:id"
            element={<ArrendamientoDetallePage />}
          />
          {/* /app/propietarios (listado) */}
          <Route path="propietarios" element={<PropietariosPage />} />
          {/* /app/propietarios/:id (detalle) */}
          <Route path="propietarios/:id" element={<PropietarioDetallePage />} />
          {/* /app/recibos */}
          <Route path="recibos" element={<RecibosPage />} />
          {/* /app/tarifas */}
          <Route path="tarifas" element={<TarifasPage />} />
          {/* /app/alertas */}
          <Route path="alertas" element={<AlertasPage />} />
          {/* /app/reportes */}
          <Route path="reportes" element={<ReportesPage />} />
          {/* /app/auditoria */}
          <Route path="auditoria" element={<AuditoriaPage />} />
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
