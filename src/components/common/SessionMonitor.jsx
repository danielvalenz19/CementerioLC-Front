import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { refreshToken } from "../../api/auth";

const SESSION_DURATION = 8 * 60 * 60 * 1000;
const WARNING_TIME = 5 * 60 * 1000;

function SessionMonitor() {
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const timeout = SESSION_DURATION - WARNING_TIME;
    timerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, timeout);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleImHere = async () => {
    try {
      await refreshToken();
      setShowWarning(false);
      startTimer();
    } catch (err) {
      console.error("Error renovando sesión:", err);
      alert("Tu sesión ha expirado. Por favor ingresa nuevamente.");
      window.location.href = "/login";
    }
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <Modal
      title="¿Sigues ahí?"
      open={showWarning}
      footer={
        <>
          <button className="btn-outline" onClick={handleLogout}>
            Cerrar sesión
          </button>
          <button className="btn-primary" onClick={handleImHere}>
            ¡Sí, sigo aquí!
          </button>
        </>
      }
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          Tu sesión de 8 horas está a punto de expirar por seguridad.
        </p>
        <p style={{ color: "#6b7280" }}>
          ¿Deseas extender tu sesión otras 8 horas?
        </p>
      </div>
    </Modal>
  );
}

export default SessionMonitor;
