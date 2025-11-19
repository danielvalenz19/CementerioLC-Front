import React from "react";
import { Link } from "react-router-dom";

// Definimos TODOS los items
const allNavItems = [
  { label: "Dashboard", path: "/app", roles: [1, 2] },
  { label: "Manzanas", path: "/app/manzanas", roles: [1, 2] },
  { label: "Nichos", path: "/app/nichos", roles: [1, 2] },
  { label: "Solicitudes", path: "/app/solicitudes", roles: [1, 2] },
  { label: "Arrendamientos", path: "/app/arrendamientos", roles: [1, 2] },
  { label: "Propietarios", path: "/app/propietarios", roles: [1, 2] },
  { label: "Recibos", path: "/app/recibos", roles: [1, 2] },
  { label: "Tarifas", path: "/app/tarifas", roles: [1, 2] },
  { label: "Alertas", path: "/app/alertas", roles: [1, 2] },
  { label: "Reportes", path: "/app/reportes", roles: [1, 2] },

  // ESTOS SOLO PARA ADMIN (Rol 1)
  { label: "Usuarios", path: "/app/usuarios", roles: [1] },
  { label: "Auditoría", path: "/app/auditoria", roles: [1] },

  { label: "Perfil", path: "/app/perfil", roles: [1, 2] },
];

function Sidebar({ currentPath, user }) {
  // Si no hay usuario cargado aún, asumimos rol 2 (restringido) por seguridad
  const userRoleId = user?.rol_id || 2;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="logo-circle">C</div>
        <div className="logo-text">
          <span>Cementerio</span>
          <small>Panel administrativo</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {allNavItems.map((item) => {
          // FILTRO DE SEGURIDAD VISUAL
          if (!item.roles.includes(userRoleId)) return null;

          const isActive =
            currentPath === item.path ||
            (item.path !== "/app" &&
              currentPath.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "is-active" : ""}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>v1.1.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;
