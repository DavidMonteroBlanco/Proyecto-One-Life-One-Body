import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import * as THREE from "three";
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
            <p className="section-label">El método</p>
            <h2 className="section-title">No es un gym.<br />Es un sistema.</h2>
            <div className="cyan-line" />
            <p className="metodo__desc">
              One Life One Body no es un centro más. Es un método estructurado donde cada pesaje, cada sesión y cada rutina tiene un propósito claro. David Montero diseña tu progreso semana a semana con seguimiento real y datos reales.
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

      {/* ══ ENTRENOS ONLINE ══ */}
      <section className="section-entrenos" id="entrenos">
        <div className="container entrenos__inner">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label">Entrenos online</p>
            <h2 className="section-title">Entrena donde<br />quieras</h2>
            <div className="cyan-line" />
            <p className="entrenos__desc">
              Accede a rutinas diseñadas por David con vídeos HD, progresión semanal y seguimiento directo. Como tener un entrenador personal en el bolsillo, donde estés.
            </p>
            <div className="entrenos__features">
              {["Vídeos HD explicados por David", "Progresión automática semana a semana", "Chat directo con tu entrenador", "Nuevas rutinas cada semana"].map((f) => (
                <div key={f} className="entrenos__feature">
                  <span className="entrenos__feature-dot" />{f}
                </div>
              ))}
            </div>
            <a href="#contacto" className="btn-primary" style={{ marginTop: "2rem" }}>Acceder ahora</a>
          </motion.div>

          <motion.div className="entrenos__preview"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            {["Día 1 · Pecho y tríceps", "Día 2 · Espalda y bíceps", "Día 3 · Pierna completa"].map((r, i) => (
              <div key={r} className="entrenos__preview-card">
                <div className="entrenos__preview-thumb" style={{ opacity: 1 - i * 0.15 }}>
                  <span>{i + 1}</span>
                </div>
                <div>
                  <strong>{r}</strong>
                  <p>6 ejercicios · {45 + i * 5} min</p>
                </div>
                <span className="entrenos__preview-arrow">▶</span>
              </div>
            ))}
          </motion.div>
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

      {/* ══ CONTACTO / BOT ══ */}
      <section className="section-contacto" id="contacto">
        <div className="container contacto__inner">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="section-label">Contacto</p>
            <h2 className="section-title">Empieza hoy</h2>
            <div className="cyan-line" />
            <p className="contacto__desc">
              ¿Tienes dudas? Escríbeme directamente o usa el asistente. Te respondo en menos de 24h.
            </p>
            <div className="contacto__links">
              <a href="https://www.instagram.com/one.life.one.body.benidorm/" target="_blank" rel="noreferrer" className="btn-ghost">
                Instagram
              </a>
              <a href="mailto:info@onelifeonebody.es" className="btn-primary">Enviar email</a>
            </div>
          </motion.div>

          <motion.div className="contacto__bot"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <div className="bot__header">
              <span className="bot__dot" />
              <strong>Asistente One Life One Body</strong>
            </div>
            <div className="bot__messages">
              <div className="bot__msg bot__msg--bot">
                ¡Hola! Soy el asistente de One Life One Body. ¿En qué puedo ayudarte?
              </div>
              <div className="bot__msg bot__msg--bot">
                Puedo informarte sobre servicios, precios o ponerte en contacto con David.
              </div>
            </div>
            <div className="bot__input">
              <input type="text" placeholder="Escribe tu pregunta..." />
              <button className="btn-primary">→</button>
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
          <p className="footer__copy">© {new Date().getFullYear()} One Life One Body · Fitness Center · Todos los derechos reservados</p>
        </div>
      </footer>

    </div>
  );
}