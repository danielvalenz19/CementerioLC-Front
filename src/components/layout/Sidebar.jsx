import React from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/app" },
  { label: "Manzanas", path: "/app/manzanas" }, // aún no implementado
  { label: "Nichos", path: "/app/nichos" }, // aún no implementado
  { label: "Propietarios", path: "/app/propietarios" }, // aún no
  { label: "Perfil", path: "/app/perfil" },
];

function Sidebar({ currentPath }) {
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
        {navItems.map((item) => {
          const isActive =
            currentPath === item.path ||
            (item.path !== "/app" &&
              currentPath.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path === "/app" ? "/app" : item.path}
              className={`sidebar-link ${isActive ? "is-active" : ""}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>v1.0.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;
