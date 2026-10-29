import { useRef, useState, useEffect, useCallback, lazy, Suspense } from "react";
import api from "../../services/api";
import Icon from "../../components/ui/Icon";
import type { IconName } from "../../components/ui/Icon";
import Counter from "../../components/ui/Counter";
import { useReveal } from "../../lib/motion";
import gymPhoto from "../../assets/icons/gym-hero.jpeg";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./Home.css";

// El fondo del hero —el pitbull hecho de partículas— va en un chunk
// aparte para que el titular se pinte sin esperarlo.
const HeroDogParticles = lazy(() => import("./HeroDogParticles"));

/* ── DATOS ── */
const services = [
  { icon: "dumbbell" as IconName, title: "Entrenamiento personal", desc: "Sesiones presenciales adaptadas a tu cuerpo y tus metas. Sin plantillas genéricas, sin excusas.", tag: "Presencial" },
  { icon: "scale" as IconName, title: "Control de peso", desc: "Seguimiento semanal con registro histórico. Tus datos, tus gráficas, tu evolución real en la app.", tag: "App incluida" },
  { icon: "monitor" as IconName, title: "Entrenos online", desc: "Rutinas de David desde cualquier lugar. Vídeos, progresión y seguimiento directo.", tag: "Digital" },
  { icon: "target" as IconName, title: "Plan 360°", desc: "Entrenamiento + nutrición + seguimiento + comunidad. La experiencia completa.", tag: "Premium" },
];

/* Frases de la cinta que recorre la portada en bucle */
const CLAIMS = [
  "Entrenamiento personal",
  "Seguimiento real",
  "Benidorm",
  "Nutrición a medida",
  "+200 transformaciones",
  "Sin humo",
];

const testimonials = [
  { name: "María G.", result: "-18 kg en 5 meses", text: "David no te da un plan, te da una nueva forma de verte. El seguimiento en la app me tenía enganchada cada semana." },
  { name: "Alejandro R.", result: "+12 kg de músculo", text: "Vine sin saber nada de gym y ahora no concibo mi semana sin entrenar. Los entrenos online me salvan cuando viajo." },
  { name: "Lucía M.", result: "Composición corporal ideal", text: "Ver mi historial de pesajes con gráficas me motivó más que cualquier otra cosa. Resultados reales, sin humo." },
];

/* ── CHATBOT COMPONENT ── */
type ChatMsg = { role: "user" | "bot"; text: string };

function ChatBot() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "bot", text: "¡Hola! Soy el asistente de One Life One Body. ¿En qué puedo ayudarte?" },
    { role: "bot", text: "Puedo informarte sobre servicios, precios o ponerte en contacto con David." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listaRef = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  /*
   * Mueve SOLO el panel del chat, tocando su scrollTop.
   *
   * Antes esto era un scrollIntoView sobre un ancla al final de la
   * lista, y scrollIntoView arrastra todos los contenedores con scroll
   * por encima, incluida la página. Como el chat arranca ya con dos
   * mensajes, el efecto saltaba al cargar la portada y te dejaba
   * directamente abajo del todo, en el chat, sin haber tocado nada.
   */
  const bajarLista = useCallback(() => {
    const lista = listaRef.current;
    if (!lista) return;
    lista.scrollTop = lista.scrollHeight;
  }, []);

  useEffect(() => {
    // Al montar no hay nada que seguir: los mensajes de bienvenida ya
    // se ven desde arriba, que es por donde se empieza a leer.
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    bajarLista();
  }, [messages, bajarLista]);

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
      <div className="bot__messages" ref={listaRef}>
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
          {loading ? <span className="spinner" /> : <Icon name="send" size={16} />}
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
          {open ? <Icon name="close" size={22} /> : <Icon name="chat" size={22} />}
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
  useReveal();

  return (
    <div className="home">

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero__canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <HeroDogParticles />
          </Suspense>
        </div>

        <div className="hero__inner container">
        <div className="hero__content">
          <p className="section-label rise" >
            Fitness Center · Benidorm, Alicante
          </p>
          <h1 className="hero__title rise rise--1" >
            ONE LIFE<br /><span className="hero__title--accent">ONE BODY</span>
          </h1>
          <p className="hero__sub rise rise--2" >
            Tienes un solo cuerpo.<br />Entrénalo como merece.
          </p>
          <div className="hero__ctas rise rise--3" >
            <a href="#servicios" className="btn-primary">Ver servicios</a>
            <a href="#contacto" className="btn-ghost">Habla con David</a>
          </div>
          {/* Instagram badge */}
          <a
            href="https://www.instagram.com/one.life.one.body.benidorm/"
            target="_blank" rel="noreferrer"
            className="hero__ig-badge rise rise--4"
            
          >
            <Icon name="instagram" size={16} />
            @one.life.one.body.benidorm
          </a>
        </div>
        </div>

        <div className="hero__scroll"><span /></div>
      </section>

      {/* ══ FRANJA STATS ══ */}
      <section className="stats-bar">
        <div className="container stats-bar__inner stagger">
          {[["+200", "Clientes transformados"], ["5+", "Años de experiencia"], ["98%", "Tasa de adherencia"], ["Benidorm", "Alicante"]].map(([n, l]) => (
            <div key={l} className="stats-bar__item" data-reveal>
              <Counter value={n} className="stats-bar__num" />
              <span className="stats-bar__label">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MÉTODO ══ */}
      <section className="section-metodo" id="metodo">
        <div className="container metodo__inner">
          <div className="metodo__text" data-reveal>
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
          </div>

          {/* Foto real del gimnasio */}
          <div
            className="metodo__photo-wrap parallax"
            data-reveal
          >
            <img src={gymPhoto} alt="One Life One Body Benidorm" className="metodo__photo" />
            <div className="metodo__photo-badge">
              <span className="metodo__photo-badge-text">QUE COMIENCE EL JUEGO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICIOS ══ */}
      <section className="section-servicios" id="servicios">
        <div className="container">
          <div className="section-header" data-reveal>
            <p className="section-label">Servicios</p>
            <h2 className="section-title">Elige tu camino</h2>
            <div className="cyan-line" />
          </div>
          <div className="servicios__grid stagger">
            {services.map((s) => (
              <div key={s.title} className="servicio-card"
                data-reveal>
                <div className="servicio-card__icon"><Icon name={s.icon} size={26} /></div>
                <span className="servicio-card__tag">{s.tag}</span>
                <h3 className="servicio-card__title">{s.title}</h3>
                <p className="servicio-card__desc">{s.desc}</p>
                <a href="#contacto" className="servicio-card__link">Más info <Icon name="arrow-right" size={15} /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BANNER INSTAGRAM ══ */}
      {/* ══ CINTA ══ */}
      <section className="claim-band" aria-hidden="true">
        <div className="marquee">
          {/* Dos copias idénticas: cuando la primera termina de salir,
              la segunda ya está en su sitio y el bucle no da el salto. */}
          {[0, 1].map((copy) => (
            <div className="marquee__track" key={copy}>
              {CLAIMS.map((claim) => (
                <span className="claim-band__item" key={claim}>
                  {claim}
                  <span className="claim-band__dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

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
            <Icon name="instagram" size={22} />
            Seguir en Instagram
          </a>
        </div>
      </section>

      {/* ══ MÉTODO ONE LIFE — PROMO ══ */}
      <section className="section-entrenos" id="entrenos">
        <div className="container">
          <div className="onelife-promo">
            <div className="onelife-promo__content"
              data-reveal>
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
            </div>
            <div className="onelife-promo__visual"
              data-reveal>
              <div className="onelife-promo__card">
                <div className="onelife-promo__card-glow" />
                <span className="onelife-promo__card-badge">ONLINE</span>
                <div className="onelife-promo__card-icon"><Icon name="bolt" size={30} /></div>
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
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIOS ══ */}
      <section className="section-testimonios" id="testimonios">
        <div className="container">
          <div className="section-header" data-reveal>
            <p className="section-label">Resultados reales</p>
            <h2 className="section-title">Lo dicen ellos</h2>
            <div className="cyan-line" />
          </div>
          <div className="testimonios__grid stagger">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonio-card"
                data-reveal>
                <p className="testimonio-card__text">"{t.text}"</p>
                <div className="testimonio-card__footer">
                  <div className="testimonio-card__avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span className="testimonio-card__result">{t.result}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACTO ══ */}
      <section className="section-contacto" id="contacto">
        <div className="container contacto__inner contacto__inner--centered">
          <div data-reveal>
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
                  <Icon name="whatsapp" size={22} />
                </span>
                <div className="contacto__wa-info">
                  <strong>Muky</strong>
                  <span>+34 631 98 63 91</span>
                </div>
              </a>

              <a href="https://wa.me/34601387263?text=Hola%20Dabuky!%20Me%20interesa%20información%20sobre%20One%20Life%20One%20Body"
                target="_blank" rel="noreferrer" className="contacto__wa-card">
                <span className="contacto__wa-icon">
                  <Icon name="whatsapp" size={22} />
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
          </div>
        </div>
      </section>

      {/* ══ MAPA ══ */}
      <section className="map-section">
        <div className="map-section__header container">
          <span className="map-section__label">Encuéntranos</span>
          <h2 className="map-section__title">DÓNDE ESTAMOS</h2>
          <p className="map-section__address"><Icon name="pin" size={15} /> C/ de Goya, 37, BAJO · 03502 Benidorm, Alicante</p>
        </div>
        <div className="map-section__embed-wrap">
          <iframe
            className="map-section__iframe"
            title="Localización One Life One Body"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1583.4!2d-0.13252!3d38.53952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6218b4fae62bcd%3A0x8b3c5a3b2e1f4a5c!2sCalle+de+Goya%2C+37%2C+03502+Benidorm%2C+Alicante!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
          />
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
              <Icon name="instagram" size={18} />
              @one.life.one.body.benidorm
            </a>
            <p className="footer__location"><Icon name="pin" size={14} /> Benidorm, Alicante</p>
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