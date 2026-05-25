import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import * as THREE from "three";
import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import gymPhoto from "../../assets/icons/gym-hero.jpeg";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./Home.css";

/* ── FIGURA 3D ── */
function HeroBody() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.08;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <Sphere args={[1.5, 128, 128]}>
          <MeshDistortMaterial
            color="#1a9e9e"
            emissive="#0d5555"
            emissiveIntensity={0.6}
            distort={0.38}
            speed={1.8}
            roughness={0.1}
            metalness={0.7}
          />
        </Sphere>
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.2, 0.018, 16, 120]} />
        <meshBasicMaterial color="#7ee8e8" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[2.6, 0.01, 16, 120]} />
        <meshBasicMaterial color="#7ee8e8" transparent opacity={0.15} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2.2, Math.sin(angle * 0.5) * 0.6, Math.sin(angle) * 2.2]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#7ee8e8" />
          </mesh>
        );
      })}
    </Float>
  );
}

/* ── DATOS ── */
const services = [
  { icon: "◎", title: "Entrenamiento Personal", desc: "Sesiones presenciales adaptadas a tu cuerpo y tus metas. Sin plantillas genéricas, sin excusas.", tag: "Presencial" },
  { icon: "▣", title: "Control de Peso", desc: "Seguimiento semanal con registro histórico. Tus datos, tus gráficas, tu evolución real en la app.", tag: "App incluida" },
  { icon: "◈", title: "Entrenos Online", desc: "Rutinas de David desde cualquier lugar. Vídeos, progresión y seguimiento directo.", tag: "Digital" },
  { icon: "◉", title: "Plan 360°", desc: "Entrenamiento + nutrición + seguimiento + comunidad. La experiencia completa.", tag: "Premium" },
];

const testimonials = [
  { name: "María G.", result: "-18 kg en 5 meses", text: "David no te da un plan, te da una nueva forma de verte. El seguimiento en la app me tenía enganchada cada semana." },
  { name: "Alejandro R.", result: "+12 kg de músculo", text: "Vine sin saber nada de gym y ahora no concibo mi semana sin entrenar. Los entrenos online me salvan cuando viajo." },
  { name: "Lucía M.", result: "Composición corporal ideal", text: "Ver mi historial de pesajes con gráficas me motivó más que cualquier otra cosa. Resultados reales, sin humo." },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: "easeOut" },
  }),
};

/* ── CHATBOT COMPONENT ── */
type ChatMsg = { role: "user" | "bot"; text: string };

function ChatBot() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "bot", text: "¡Hola! Soy el asistente de One Life One Body. ¿En qué puedo ayudarte?" },
    { role: "bot", text: "Puedo informarte sobre servicios, precios o ponerte en contacto con David." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build history for context (skip initial bot messages)
      const history = messages
        .slice(2)
        .concat(userMsg)
        .map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text }));

      const { data } = await api.post("/chatbot", {
        message: text,
        history: history.slice(-16), // Last 16 messages max
      });

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Perdona, ha habido un error. Inténtalo de nuevo o contacta con David por Instagram." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="bot__header">
        <span className="bot__dot" />
        <strong>Asistente One Life One Body</strong>
        <span className="bot__badge">IA</span>
      </div>
      <div className="bot__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`bot__msg bot__msg--${msg.role === "user" ? "user" : "bot"}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bot__msg bot__msg--bot bot__msg--typing">
            <span className="bot__typing-dot" />
            <span className="bot__typing-dot" />
            <span className="bot__typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bot__input">
        <input
          type="text"
          placeholder="Escribe tu pregunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={500}
        />
        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "→"}
        </button>
      </div>
    </>
  );
}

/* ── FLOATING CHAT WIDGET ── */
function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Stop pulsing after first open
  const handleToggle = () => {
    setOpen((v) => !v);
    if (!hasOpened) {
      setHasOpened(true);
      setPulse(false);
    }
  };

  return (
    <div className="floating-chat">
      {/* Chat panel */}
      <div className={`floating-chat__panel ${open ? "floating-chat__panel--open" : ""}`}>
        <div className="floating-chat__window">
          <ChatBot />
        </div>
      </div>

      {/* Toggle button */}
      <button
        className={`floating-chat__btn ${open ? "floating-chat__btn--open" : ""} ${pulse ? "floating-chat__btn--pulse" : ""}`}
        onClick={handleToggle}
        aria-label={open ? "Cerrar chat" : "Abrir asistente"}
      >
        <span className={`floating-chat__icon ${open ? "floating-chat__icon--close" : ""}`}>
          {open ? "✕" : "💬"}
        </span>
        {!open && !hasOpened && (
          <span className="floating-chat__tooltip">¿Necesitas ayuda?</span>
        )}
      </button>
    </div>
  );
}

/* ── COMPONENTE ── */
export default function Home() {
  return (
    <div className="home">

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero__canvas">
          <Canvas camera={{ position: [0, 0, 5.5], fov: 50 }} dpr={[1, 2]}>
            <ambientLight intensity={0.3} />
            <pointLight position={[4, 4, 4]} intensity={2.5} color="#7ee8e8" />
            <pointLight position={[-4, -2, -4]} intensity={1} color="#1a9e9e" />
            <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.6} />
            <HeroBody />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4}
              maxPolarAngle={Math.PI / 1.6} minPolarAngle={Math.PI / 3} />
          </Canvas>
        </div>

        <div className="hero__content container">
          <motion.p className="section-label" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            Fitness Center · Benidorm, Alicante
          </motion.p>
          <motion.h1 className="hero__title" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            ONE LIFE<br /><span className="hero__title--accent">ONE BODY</span>
          </motion.h1>
          <motion.p className="hero__sub" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Tienes un solo cuerpo.<br />Entrénalo como merece.
          </motion.p>
          <motion.div className="hero__ctas" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <a href="#servicios" className="btn-primary">Ver servicios</a>
            <a href="#contacto" className="btn-ghost">Habla con David</a>
          </motion.div>
          {/* Instagram badge */}
          <motion.a
            href="https://www.instagram.com/one.life.one.body.benidorm/"
            target="_blank" rel="noreferrer"
            className="hero__ig-badge"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            @one.life.one.body.benidorm
          </motion.a>
        </div>

        <div className="hero__scroll"><span /></div>
      </section>

      {/* ══ FRANJA STATS ══ */}
      <section className="stats-bar">
        <div className="container stats-bar__inner">
          {[["+200", "Clientes transformados"], ["5+", "Años de experiencia"], ["98%", "Tasa de adherencia"], ["Benidorm", "Alicante"]].map(([n, l]) => (
            <div key={l} className="stats-bar__item">
              <span className="stats-bar__num">{n}</span>
              <span className="stats-bar__label">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MÉTODO ══ */}
      <section className="section-metodo" id="metodo">
        <div className="container metodo__inner">
          <motion.div className="metodo__text" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label">Método</p>
            <h2 className="section-title">No es un gym.<br />Es un sistema.</h2>
            <div className="cyan-line" />
            <p className="metodo__desc">
              One Life One Body no es un centro más. Es un método estructurado donde cada pesaje, cada sesión y cada rutina tiene un propósito claro. David diseña tu progreso semana a semana con seguimiento real y datos reales.
            </p>
            <div className="metodo__steps">
              {[["01","Evaluación inicial","Análisis de composición corporal y objetivos reales."],
                ["02","Plan personalizado","Entrenamiento y nutrición ajustados a tu vida."],
                ["03","Seguimiento continuo","Pesajes semanales con historial en la app."],
                ["04","Evolución real","Resultados medibles, visibles y sostenibles."]].map(([n, t, d]) => (
                <div key={n} className="metodo__step">
                  <span className="metodo__step-num">{n}</span>
                  <div><strong>{t}</strong><p>{d}</p></div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Foto real del gimnasio */}
          <motion.div
            className="metodo__photo-wrap"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
          >
            <img src={gymPhoto} alt="One Life One Body Benidorm" className="metodo__photo" />
            <div className="metodo__photo-badge">
              <span className="metodo__photo-badge-text">QUE COMIENCE EL JUEGO</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ SERVICIOS ══ */}
      <section className="section-servicios" id="servicios">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label">Servicios</p>
            <h2 className="section-title">Elige tu camino</h2>
            <div className="cyan-line" />
          </motion.div>
          <div className="servicios__grid">
            {services.map((s, i) => (
              <motion.div key={s.title} className="servicio-card"
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <div className="servicio-card__icon">{s.icon}</div>
                <span className="servicio-card__tag">{s.tag}</span>
                <h3 className="servicio-card__title">{s.title}</h3>
                <p className="servicio-card__desc">{s.desc}</p>
                <a href="#contacto" className="servicio-card__link">Más info <span>→</span></a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BANNER INSTAGRAM ══ */}
      <section className="ig-banner">
        <div className="container ig-banner__inner">
          <div className="ig-banner__text">
            <p className="section-label">Síguenos</p>
            <h2 className="ig-banner__title">Mira lo que<br />hacemos cada día</h2>
          </div>
          <a
            href="https://www.instagram.com/one.life.one.body.benidorm/"
            target="_blank" rel="noreferrer"
            className="ig-banner__btn"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            Seguir en Instagram
          </a>
        </div>
      </section>

      {/* ══ MÉTODO ONE LIFE — PROMO ══ */}
      <section className="section-entrenos" id="entrenos">
        <div className="container">
          <div className="onelife-promo">
            <motion.div className="onelife-promo__content"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p className="section-label">Método</p>
              <h2 className="onelife-promo__title">METODO<br /><span>ONE LIFE</span></h2>
              <p className="onelife-promo__desc">
                Tu transformación no depende de un lugar. Plan personalizado, seguimiento por videollamada, 
                control de pesajes, nutrición y chat directo con David. Todo desde tu móvil.
              </p>
              <div className="onelife-promo__features">
                {["Plan personalizado", "Videollamadas semanales", "Control de pesajes", "Chat directo", "Pautas de nutrición", "Informes mensuales"].map((f) => (
                  <span key={f} className="onelife-promo__tag">{f}</span>
                ))}
              </div>
              <div className="onelife-promo__ctas">
                <a href="/entrenos-online" className="btn-primary">Descubrir método</a>
                <a href="/entrenos-online#suplementos" className="btn-ghost">Ver suplementos</a>
              </div>
            </motion.div>
            <motion.div className="onelife-promo__visual"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
              <div className="onelife-promo__card">
                <div className="onelife-promo__card-glow" />
                <span className="onelife-promo__card-badge">ONLINE</span>
                <div className="onelife-promo__card-icon">⚡</div>
                <h3>Entrena donde quieras</h3>
                <p>Sin horarios. Sin excusas.<br />Solo resultados.</p>
              </div>
              <div className="onelife-promo__biotech">
                <img src="/img/biotech.webp" alt="BioTech USA" className="onelife-promo__biotech-img" />
                <div>
                  <span className="onelife-promo__biotech-label">Colaborador oficial</span>
                  <strong>BioTech USA</strong>
                  <span className="onelife-promo__biotech-code">Código: DAVIDS15</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIOS ══ */}
      <section className="section-testimonios" id="testimonios">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label">Resultados reales</p>
            <h2 className="section-title">Lo dicen ellos</h2>
            <div className="cyan-line" />
          </motion.div>
          <div className="testimonios__grid">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} className="testimonio-card"
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <p className="testimonio-card__text">"{t.text}"</p>
                <div className="testimonio-card__footer">
                  <div className="testimonio-card__avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span className="testimonio-card__result">{t.result}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACTO ══ */}
      <section className="section-contacto" id="contacto">
        <div className="container contacto__inner contacto__inner--centered">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label">Contacto</p>
            <h2 className="section-title">Empieza hoy</h2>
            <div className="cyan-line" />
            <p className="contacto__desc">
              Escríbenos por WhatsApp, Instagram o usa el asistente virtual en la esquina inferior derecha. Te respondemos en menos de 24h.
            </p>

            <div className="contacto__whatsapp-cards">
              <a href="https://wa.me/34631986391?text=Hola%20Muky!%20Me%20interesa%20información%20sobre%20One%20Life%20One%20Body"
                target="_blank" rel="noreferrer" className="contacto__wa-card">
                <span className="contacto__wa-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <div className="contacto__wa-info">
                  <strong>Muky</strong>
                  <span>+34 631 98 63 91</span>
                </div>
              </a>

              <a href="https://wa.me/34601387263?text=Hola%20Dabuky!%20Me%20interesa%20información%20sobre%20One%20Life%20One%20Body"
                target="_blank" rel="noreferrer" className="contacto__wa-card">
                <span className="contacto__wa-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <div className="contacto__wa-info">
                  <strong>Dabuky</strong>
                  <span>+34 601 38 72 63</span>
                </div>
              </a>
            </div>

            <div className="contacto__links">
              <a href="https://www.instagram.com/one.life.one.body.benidorm/" target="_blank" rel="noreferrer" className="btn-ghost">
                Instagram
              </a>
              <a href="mailto:info@onelifeonebody.es" className="btn-ghost">Enviar email</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="container footer__top">
          <div className="footer__brand">
            <img src={logoImg} alt="One Life One Body" className="footer__logo" />
            <p className="footer__tagline">Tienes un solo cuerpo.<br />Entrénalo como merece.</p>
          </div>
          <div className="footer__nav">
            <span className="footer__nav-title">Navegación</span>
            {[["#metodo","Método"],["#servicios","Servicios"],["#entrenos","Entrenos"],["#testimonios","Testimonios"],["#contacto","Contacto"]].map(([h,l]) => (
              <a key={h} href={h} className="footer__nav-link">{l}</a>
            ))}
          </div>
          <div className="footer__social">
            <span className="footer__nav-title">Síguenos</span>
            <a href="https://www.instagram.com/one.life.one.body.benidorm/" target="_blank" rel="noreferrer" className="footer__ig-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              @one.life.one.body.benidorm
            </a>
            <p className="footer__location">📍 Benidorm, Alicante</p>
          </div>
        </div>
        <div className="container footer__bottom">
          <div className="footer__legal">
             <a href="/legal/privacidad">Privacidad</a>
             <a href="/legal/aviso-legal">Aviso legal</a>
             <a href="/legal/cookies">Cookies</a>
          </div>
          <p className="footer__copy">© {new Date().getFullYear()} One Life One Body · Fitness Center · Todos los derechos reservados</p>
        </div>
      </footer>

      {/* ══ FLOATING CHAT WIDGET ══ */}
      <FloatingChat />

    </div>
  );
}