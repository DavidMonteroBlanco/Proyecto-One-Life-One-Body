import { useEffect, useRef, useState } from "react";
import PageShell from "../components/PageShell";
import "./dashboard.css";
// ─── Lottie via CDN  ────────────────────────────
declare global {
  interface Window {
    lottie: any;
  }
}

function useLottie(
  url: string,
  options?: { loop?: boolean; speed?: number }
) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !window.lottie) return;
    const anim = window.lottie.loadAnimation({
      container: ref.current,
      renderer: "svg",
      loop: options?.loop ?? true,
      autoplay: true,
      path: url,
    });
    if (options?.speed) anim.setSpeed(options.speed);
    return () => anim.destroy();
  }, [url]);
  return ref;
}

// ─── Contador animado ───────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return (
    <span ref={ref} className="counter-value">
      {value.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Card de estadística ────────────────────────────────────────────
function StatCard({
  label,
  value,
  suffix,
  lottieUrl,
  delay,
  color,
}: {
  label: string;
  value: number;
  suffix?: string;
  lottieUrl: string;
  delay: number;
  color: string;
}) {
  const iconRef = useLottie(lottieUrl, { loop: true, speed: 0.8 });

  return (
    <div
      className="stat-card"
      style={{ animationDelay: `${delay}ms`, "--accent": color } as React.CSSProperties}
    >
      <div className="stat-card__icon" ref={iconRef} />
      <div className="stat-card__body">
        <div className="stat-card__value">
          <AnimatedCounter target={value} suffix={suffix} />
        </div>
        <div className="stat-card__label">{label}</div>
      </div>
      <div className="stat-card__glow" />
    </div>
  );
}

// ─── Indicador de estado ────────────────────────────────────────────
function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`status-dot ${ok ? "status-dot--ok" : "status-dot--warn"}`}>
      <span className="status-dot__ring" />
    </span>
  );
}

// ─── Dashboard principal ────────────────────────────────────────────
export default function Dashboard() {
  const heroLottie = useLottie(
    "https://assets5.lottiefiles.com/packages/lf20_qp1q7mct.json",
    { loop: true, speed: 0.6 }
  );

  const stats = [
    {
      label: "Entrenamientos",
      value: 1284,
      suffix: "",
      lottieUrl: "https://assets9.lottiefiles.com/packages/lf20_kkflmtur.json",
      color: "var(--blue-dark)",
    },
    {
      label: "Usuarios activos",
      value: 347,
      suffix: "",
      lottieUrl: "https://assets3.lottiefiles.com/packages/lf20_jcikwtux.json",
      color: "#0ea5e9",
    },
    {
      label: "Sesiones hoy",
      value: 89,
      suffix: "",
      lottieUrl: "https://assets4.lottiefiles.com/packages/lf20_xlkxtmul.json",
      color: "#6366f1",
    },
    {
      label: "Satisfacción",
      value: 98,
      suffix: "%",
      lottieUrl: "https://assets7.lottiefiles.com/packages/lf20_touohxv0.json",
      color: "#10b981",
    },
  ];

  const systemStatus = [
    { label: "API REST", ok: true, detail: "Operativa · 12 ms avg" },
    { label: "Sesión JWT", ok: true, detail: "Token válido · expira en 6 h" },
    { label: "Base de datos", ok: true, detail: "PostgreSQL · 99.9 % uptime" },
    { label: "CDN / Media", ok: true, detail: "Cloudflare · global" },
    { label: "Modo mantenimiento", ok: false, detail: "Programado · 02:00 – 03:00" },
  ];

  return (
    <>
      {/* Cargar Lottie desde CDN */}
      <script
        src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"
        async
      />

      <PageShell>
        <div className="dash-root">

          {/* ── HERO ── */}
          <div className="dash-hero slide-up" style={{ animationDelay: "0ms" }}>
            <div className="dash-hero__text">
              <span className="dash-hero__eyebrow">Panel interno</span>
              <h1 className="dash-hero__title">
                One Life<br />
                <span className="dash-hero__title--accent">One Body</span>
              </h1>
              <p className="dash-hero__sub">
                Gestión centralizada de entrenamientos, usuarios y contenidos.
                Todo en tiempo real.
              </p>
            </div>
            <div className="dash-hero__lottie" ref={heroLottie} />
          </div>

          {/* ── STATS ── */}
          <div className="stats-grid">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={100 + i * 120} />
            ))}
          </div>

          {/* ── ESTADO DEL SISTEMA ── */}
          <div
            className="olob-card dash-status slide-up"
            style={{ animationDelay: "600ms" }}
          >
            <h2 className="dash-section-title">Estado del sistema</h2>
            <ul className="status-list">
              {systemStatus.map((s) => (
                <li key={s.label} className="status-item">
                  <StatusDot ok={s.ok} />
                  <div className="status-item__info">
                    <span className="status-item__name">{s.label}</span>
                    <span className="status-item__detail">{s.detail}</span>
                  </div>
                  <span className={`status-badge ${s.ok ? "status-badge--ok" : "status-badge--warn"}`}>
                    {s.ok ? "OK" : "Aviso"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── NOTA RÁPIDA ── */}
          <div
            className="olob-card dash-note slide-up"
            style={{ animationDelay: "750ms" }}
          >
            <div className="dash-note__icon">💡</div>
            <div>
              <h3 className="dash-note__title">Acceso rápido</h3>
              <p className="olob-muted dash-note__text">
                Usa el <strong>Menú</strong> desplegable del Navbar para navegar
                entre secciones. Las opciones visibles cambian según tu rol{" "}
                <span className="dash-badge">admin</span> /{" "}
                <span className="dash-badge">user</span>.
              </p>
            </div>
          </div>

        </div>
      </PageShell>
    </>
  );
}