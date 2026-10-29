// src/components/ui/NotificationBell.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Icon from "./Icon";
import type { IconName } from "./Icon";
import "./NotificationBell.css";

/* ══════════════════════════════════════════════════════════
   CAMPANA DE AVISOS

   El email avisa de que hay algo nuevo, pero puede acabar en spam
   o perderse. Esto es la otra mitad: dentro de la web el aviso
   está siempre, y es lo que hace que un fallo de correo no deje al
   cliente sin enterarse de su plan.

   Se recarga cada minuto, y solo con la pestaña a la vista: una
   consulta por minuto es barata, pero no si se sigue haciendo con
   el navegador de fondo durante horas.
   ══════════════════════════════════════════════════════════ */

const RECARGA_MS = 60_000;

type Aviso = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

/** Icono por tipo de aviso; cualquier tipo nuevo cae en la campana. */
function iconoDe(tipo: string): IconName {
  if (tipo === "diet_plan") return "plate";
  if (tipo === "workout") return "dumbbell";
  if (tipo === "appointment") return "calendar";
  return "bell";
}

/** "hace 5 min", "ayer"... más legible que una fecha completa. */
function haceCuanto(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  return new Date(iso).toLocaleDateString("es-ES");
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sinLeer, setSinLeer] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const cajaRef = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setAvisos(data.notifications || []);
      setSinLeer(data.unread ?? 0);
    } catch {
      // Silencio a propósito: si los avisos no cargan, la pantalla
      // que hay detrás tiene que seguir funcionando igual.
    }
  }, []);

  useEffect(() => {
    cargar();

    let id: number | undefined;
    const arrancar = () => {
      if (id === undefined) id = window.setInterval(cargar, RECARGA_MS);
    };
    const parar = () => {
      if (id !== undefined) { window.clearInterval(id); id = undefined; }
    };

    const onVisibility = () => {
      if (document.hidden) { parar(); return; }
      cargar();   // al volver, ponerse al día antes de seguir el ciclo
      arrancar();
    };

    if (!document.hidden) arrancar();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      parar();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cargar]);

  // Cerrar al pulsar fuera o con Escape.
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      if (!cajaRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  const abrirAviso = async (a: Aviso) => {
    setAbierto(false);

    if (!a.read_at) {
      // Se marca en local antes de que responda el servidor: el panel
      // se cierra al instante y esperar la respuesta solo se notaría
      // como un parpadeo del contador.
      setAvisos((prev) => prev.map((x) => (x.id === a.id ? { ...x, read_at: new Date().toISOString() } : x)));
      setSinLeer((n) => Math.max(0, n - 1));
      try { await api.patch(`/notifications/${a.id}/read`); } catch { /* se recupera en la próxima recarga */ }
    }

    if (a.link) navigate(a.link);
  };

  const marcarTodas = async () => {
    const ahora = new Date().toISOString();
    setAvisos((prev) => prev.map((x) => (x.read_at ? x : { ...x, read_at: ahora })));
    setSinLeer(0);
    try { await api.post("/notifications/read-all"); } catch { cargar(); }
  };

  return (
    <div className="nb" ref={cajaRef}>
      <button
        className="nb__boton"
        onClick={() => setAbierto((v) => !v)}
        aria-label={sinLeer > 0 ? `Avisos, ${sinLeer} sin leer` : "Avisos"}
        aria-expanded={abierto}
      >
        <Icon name="bell" size={18} />
        {sinLeer > 0 && <span className="nb__punto">{sinLeer > 9 ? "9+" : sinLeer}</span>}
      </button>

      {abierto && (
        <div className="nb__panel" role="dialog" aria-label="Avisos">
          <div className="nb__panel-cab">
            <span className="nb__panel-titulo">Avisos</span>
            {sinLeer > 0 && (
              <button className="nb__marcar" onClick={marcarTodas}>
                Marcar todas
              </button>
            )}
          </div>

          {avisos.length === 0 ? (
            <div className="nb__vacio">No tienes avisos</div>
          ) : (
            <ul className="nb__lista">
              {avisos.map((a) => (
                <li key={a.id}>
                  <button
                    className={`nb__aviso ${a.read_at ? "" : "nb__aviso--nuevo"}`}
                    onClick={() => abrirAviso(a)}
                  >
                    <span className="nb__aviso-icono"><Icon name={iconoDe(a.type)} size={16} /></span>
                    <span className="nb__aviso-texto">
                      <span className="nb__aviso-titulo">{a.title}</span>
                      {a.body && <span className="nb__aviso-cuerpo">{a.body}</span>}
                      <span className="nb__aviso-fecha">{haceCuanto(a.created_at)}</span>
                    </span>
                    {!a.read_at && <span className="nb__aviso-punto" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
