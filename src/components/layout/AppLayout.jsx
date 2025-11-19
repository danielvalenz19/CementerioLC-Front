import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { getMe, doLogout } from "../../api/auth";

function AppLayout() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        // primero intentamos leer de localStorage
        const cached = localStorage.getItem("user");
        if (cached) {
          setUser(JSON.parse(cached));
        }

        // siempre que entramos al layout, validamos con /auth/me
        const fromApi = await getMe();
        setUser(fromApi);
        localStorage.setItem("user", JSON.stringify(fromApi));
      } catch (err) {
        console.error("Error cargando usuario:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    await doLogout({ allDevices: false });
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <Sidebar currentPath={location.pathname} user={user} />

      <div className="app-main">
        <TopBar user={user} loading={loadingUser} onLogout={handleLogout} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
