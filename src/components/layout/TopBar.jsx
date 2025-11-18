import React from "react";

function TopBar({ user, loading, onLogout }) {
  const displayName =
    user?.nombre_completo ||
    user?.nombre ||
    user?.correo ||
    "Usuario";

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <h1>Cementerio Municipal</h1>
        <p>Panel de administración y reportes</p>
      </div>

      <div className="topbar-right">
        <div className="user-chip">
          <div className="user-avatar">
            {displayName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">
              {loading ? "Cargando..." : displayName}
            </span>
            {user?.rol && (
              <span className="user-role">{user.rol}</span>
            )}
          </div>
        </div>

        <button className="btn-outline" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default TopBar;
