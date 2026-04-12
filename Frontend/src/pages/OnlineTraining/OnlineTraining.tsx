// src/pages/EntrenosOnline/EntrenosOnline.tsx

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./OnlineTraining.css";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: "easeOut" },
  }),
};

/* ═══════════════════════════════════════
   DATOS — Edita aquí para cambiar contenido
   ═══════════════════════════════════════ */

const BIOTECH_CODE = "DAVIDS15";
const BIOTECH_BASE_URL = "https://www.biotechusa.es";

const features = [
  {
    icon: "📱",
    title: "Plan de entreno personalizado",
    desc: "Rutinas diseñadas por David adaptadas a tus objetivos, nivel y disponibilidad. Actualizadas cada mes.",
  },
  {
    icon: "📹",
    title: "Seguimiento por videollamada",
    desc: "Sesiones semanales por videollamada para revisar técnica, resolver dudas y ajustar tu plan.",
  },
  {
    icon: "⚖",
    title: "Control de pesajes",
    desc: "Registro semanal de peso, % grasa y % músculo con gráficas de evolución en la app.",
  },
  {
    icon: "🍎",
    title: "Pautas de nutrición",
    desc: "Guía nutricional adaptada a tu objetivo. Sin dietas genéricas, ajustada a tu vida real.",
  },
  {
    icon: "💬",
    title: "Chat directo con David",
    desc: "Contacto directo por WhatsApp para dudas rápidas, ajustes de entreno o motivación.",
  },
  {
    icon: "📊",
    title: "Informes mensuales",
    desc: "Cada mes recibes un resumen de tu progreso con datos, gráficas y próximos pasos.",
  },
];

const products = [
  {
    name: "Iso Whey Zero",
    type: "Proteína aislada",
    price: "49.90",
    image: "/Prote.webp",
    url: `https://shop.biotechusa.es/collections/pf-iso-whey-zero/products/iso-whey-zero-bebida-de-proteina-en-polvo-1816-g`,
  },
  {
    name: "100% Creatine Monohydrate",
    type: "Creatina",
    price: "19.90",
    image: "/creatina.png",
    url: `https://shop.biotechusa.es/collections/kreatiny/products/100-micronized-creatine-monohydrate-300-g-sin-sabor`,
  },
  {
    name: "BCAA Zero",
    type: "BCAAs",
    price: "24.90",
    image: "/bcaa.png",
    url: `https://shop.biotechusa.es/products/bcaa-zero-aminoacidos-en-polvo-360-g`,
  },
  {
    name: "Black Blood NOX+",
    type: "Pre-entreno",
    price: "29.90",
    image: "/preentreno.webp",
    url: `https://shop.biotechusa.es/products/black-blood-nox-330-g?variant=31713128644672`,
  },
];

/* ═══════════════════════════════════════
   COMPONENTE
   ═══════════════════════════════════════ */
export default function EntrenosOnline() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="eo-page">

      {/* ══ HERO CON VIDEO ══ */}
      <section className="eo-hero">
        <div className="eo-hero__video-wrap">
          {/* Video MP4 — pon tu archivo en public/video-entrenos.mp4 */}
          <video
            ref={videoRef}
            className={`eo-hero__video ${videoLoaded ? "eo-hero__video--loaded" : ""}`}
            src="/video-entrenos.mp4"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
          />
          {/* Overlay oscuro */}
          <div className="eo-hero__overlay" />
        </div>

        <div className="container eo-hero__content">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <p className="eo-label">Entrenamiento Online</p>
          </motion.div>
          <motion.h1 className="eo-hero__title" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            METODO<br /><span className="eo-hero__title--accent">ONE LIFE</span>
          </motion.h1>
          <motion.p className="eo-hero__sub" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            Tu transformación no depende de un lugar.<br />
            Depende de un sistema. Y ahora lo tienes en el bolsillo.
          </motion.p>
          <motion.div className="eo-hero__ctas" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <a href="#que-incluye" className="btn-primary">Ver qué incluye</a>
            <a href="https://www.instagram.com/one.life.one.body.benidorm/" target="_blank" rel="noreferrer" className="btn-ghost">
              Contactar con David
            </a>
          </motion.div>
        </div>

        <div className="eo-hero__scroll"><span /></div>
      </section>

      {/* ══ QUÉ INCLUYE ══ */}
      <section className="eo-section" id="que-incluye">
        <div className="container">
          <motion.div className="eo-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="eo-label">Todo incluido</p>
            <h2 className="eo-section__title">Que incluye el<br />Metodo One Life</h2>
            <div className="eo-cyan-line" />
            <p className="eo-section__desc">
              No es solo una rutina. Es un sistema completo de transformación con seguimiento real, 
              adaptado a ti, desde cualquier lugar del mundo.
            </p>
          </motion.div>

          <div className="eo-features">
            {features.map((f, i) => (
              <motion.div key={f.title} className="eo-feature"
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <span className="eo-feature__icon">{f.icon}</span>
                <h3 className="eo-feature__title">{f.title}</h3>
                <p className="eo-feature__desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BIOTECH USA — COLABORADOR ══ */}
      <section className="eo-section eo-section--biotech" id="suplementos">
        <div className="container">
          <motion.div className="eo-section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="eo-label">Colaborador oficial</p>
            <h2 className="eo-section__title">BioTech USA</h2>
            <div className="eo-cyan-line" />
          </motion.div>

          {/* Código de descuento */}
          <motion.div className="eo-discount" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <div className="eo-discount__text">
              <p className="eo-discount__label">Codigo de descuento exclusivo</p>
              <p className="eo-discount__info">
                Usa este código en <strong>biotechusa.es</strong> para obtener un descuento en todos los productos. 
                Exclusivo para clientes de One Life One Body.
              </p>
            </div>
            <div className="eo-discount__code-wrap">
              <span className="eo-discount__code">{BIOTECH_CODE}</span>
              <button
                className="eo-discount__copy"
                onClick={() => {
                  navigator.clipboard.writeText(BIOTECH_CODE);
                  const btn = document.querySelector(".eo-discount__copy") as HTMLElement;
                  if (btn) { btn.textContent = "Copiado ✓"; setTimeout(() => btn.textContent = "Copiar", 2000); }
                }}
              >
                Copiar
              </button>
            </div>
          </motion.div>

          {/* Productos */}
          <div className="eo-products">
            {products.map((p, i) => (
              <motion.div key={p.name} className="eo-product"
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <div className="eo-product__img-wrap">
                  <img src={p.image} alt={p.name} className="eo-product__img" loading="lazy" />
                </div>
                <div className="eo-product__info">
                  <span className="eo-product__type">{p.type}</span>
                  <h3 className="eo-product__name">{p.name}</h3>
                  <span className="eo-product__price">{p.price}€</span>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="eo-product__btn"
                >
                  Comprar
                </a>
              </motion.div>
            ))}
          </div>

          <motion.p className="eo-products__note" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            * Precios orientativos. Aplica el código <strong>{BIOTECH_CODE}</strong> en el checkout para tu descuento.
          </motion.p>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="eo-cta">
        <div className="container eo-cta__inner">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="eo-label">Da el paso</p>
            <h2 className="eo-cta__title">Empieza tu<br />transformacion</h2>
            <div className="eo-cyan-line" />
            <p className="eo-cta__desc">
              Contacta con nosotros para empezar con el Método One Life. 
              Sin compromiso. Sin excusas. Solo resultados.
            </p>
 
            <div className="eo-cta__whatsapp">
              <a href="https://wa.me/34631986391?text=Hola%20Muky!%20Quiero%20info%20sobre%20el%20Método%20One%20Life"
                target="_blank" rel="noreferrer" className="eo-cta__wa-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Muky · 631 98 63 91
              </a>
              <a href="https://wa.me/34601387263?text=Hola%20Dabuky!%20Quiero%20info%20sobre%20el%20Método%20One%20Life"
                target="_blank" rel="noreferrer" className="eo-cta__wa-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Dabuky · 601 38 72 63
              </a>
            </div>
 
            <div className="eo-cta__buttons">
              <a href="https://www.instagram.com/one.life.one.body.benidorm/" target="_blank" rel="noreferrer" className="btn-ghost">
                Instagram
              </a>
              <a href="/" className="btn-ghost">← Volver a la web</a>
            </div>
          </motion.div>
        </div>
      </section>
 
      {/* ══ FOOTER MINI ══ */}
      <footer className="eo-footer">
        <div className="container eo-footer__inner">
          <img src={logoImg} alt="OLOB" className="eo-footer__logo" />
          <p>© {new Date().getFullYear()} One Life One Body · Fitness Center · Benidorm</p>
        </div>
      </footer>
    </div>
  );
}