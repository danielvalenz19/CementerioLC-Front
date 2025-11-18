import React, { useEffect, useState } from "react";
import { getMe } from "../api/auth";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const cached = localStorage.getItem("user");
        if (cached) {
          setProfile(JSON.parse(cached));
        }

        const fromApi = await getMe();
        setProfile(fromApi);
        localStorage.setItem("user", JSON.stringify(fromApi));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="loading-placeholder">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  if (!profile) {
    return <div>No se encontró información del usuario.</div>;
  }

  return (
    <div className="profile-page">
      <h2>Perfil de usuario</h2>
      <p>Información básica de tu cuenta.</p>

      <div className="profile-card">
        <div className="profile-row">
          <span>Nombre completo</span>
          <strong>
            {profile.nombre_completo ||
              profile.nombre ||
              "-"}
          </strong>
        </div>
        <div className="profile-row">
          <span>Correo</span>
          <strong>{profile.correo || "-"}</strong>
        </div>
        <div className="profile-row">
          <span>Rol</span>
          <strong>{profile.rol || profile.rol_id || "-"}</strong>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
