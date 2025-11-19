import React, { useEffect, useState } from "react";
import {
  listUsuarios,
  createUsuario,
  toggleUsuarioEstado,
  deleteUsuario,
} from "../api/usuarios";
import Modal from "../components/common/Modal";

// Asumiendo roles fijos, si vienen de BD podrías cargarlos en un useEffect
const ROLES = [
  { value: 1, label: "Administrador (Acceso Total)" },
  { value: 2, label: "Operador (Restringido)" },
];

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo: "",
    password: "",
    rol_id: 2, // Por defecto Operador
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async () => {
    if (
      !formData.nombre_completo ||
      !formData.correo ||
      !formData.password
    ) {
      alert("Completa todos los campos.");
      return;
    }
    try {
      await createUsuario(formData);
      setModalOpen(false);
      setFormData({
        nombre_completo: "",
        correo: "",
        password: "",
        rol_id: 2,
      });
      loadUsers();
    } catch (err) {
      alert("Error creando usuario: " + (err.response?.data?.message || ""));
    }
  };

  const handleToggle = async (u) => {
    if (
      !window.confirm(
        `¿${u.activo ? "Desactivar" : "Activar"} acceso a ${
          u.nombre_completo
        }?`
      )
    )
      return;
    try {
      await toggleUsuarioEstado(u.id, !u.activo);
      loadUsers();
    } catch (err) {
      alert("No se pudo cambiar el estado.");
    }
  };

  const handleDelete = async (u) => {
    if (
      !window.confirm(
        `¿Estás seguro de ELIMINAR a ${u.nombre_completo}?\n\nEsta acción es permanente.`
      )
    )
      return;

    try {
      await deleteUsuario(u.id);
      loadUsers();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "No se pudo eliminar el usuario.";
      alert(msg);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p>Crea cuentas para administradores y operadores.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="loading-placeholder">Cargando...</div>
      ) : (
        <div className="data-table">
          {/* Ajustamos columnas para que quepan los botones */}
          <div
            className="data-table-header"
            style={{
              gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 1.2fr",
            }}
          >
            <div>Nombre</div>
            <div>Correo</div>
            <div>Rol</div>
            <div>Estado</div>
            <div style={{ textAlign: "right" }}>Acciones</div>
          </div>
          <div className="data-table-body">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="data-table-row"
                style={{
                  gridTemplateColumns: "1fr 1.2fr 0.8fr 0.8fr 1.2fr",
                }}
              >
                <div style={{ fontWeight: 500 }}>{u.nombre_completo}</div>
                <div style={{ fontSize: "13px" }}>{u.correo}</div>
                <div>
                  <span
                    className={
                      u.rol_id === 1 ? "tag tag-reservado" : "tag tag-default"
                    }
                  >
                    {u.rol_nombre || (u.rol_id === 1 ? "Admin" : "Operador")}
                  </span>
                </div>
                <div>
                  <span
                    className={u.activo ? "tag tag-vigente" : "tag tag-ocupado"}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="col-actions">
                  <button
                    className="btn-ghost"
                    onClick={() => handleToggle(u)}
                    title={u.activo ? "Desactivar" : "Activar"}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>

                  <button
                    className="btn-danger-ghost"
                    onClick={() => handleDelete(u)}
                    title="Eliminar permanentemente"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        title="Nuevo Usuario"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button className="btn-outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </>
        }
      >
        <div
          className="form-grid"
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <label className="form-label">
            Nombre Completo
            <input
              type="text"
              value={formData.nombre_completo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nombre_completo: e.target.value,
                }))
              }
            />
          </label>
          <label className="form-label">
            Correo Electrónico
            <input
              type="email"
              value={formData.correo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, correo: e.target.value }))
              }
            />
          </label>
          <label className="form-label">
            Contraseña
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </label>
          <label className="form-label">
            Rol
            <select
              value={formData.rol_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rol_id: Number(e.target.value),
                }))
              }
              style={{
                padding: 8,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}

export default UsuariosPage;
