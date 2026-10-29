// src/pages/EntrenosOnline/EntrenosOnline.tsx

import { useEffect, useRef, useState } from "react";
import { useReveal } from "../../lib/motion";
import Icon from "../../components/ui/Icon";
import type { IconName } from "../../components/ui/Icon";
import logoImg from "../../assets/icons/logo-bw.jpg";
import "./OnlineTraining.css";

const BIOTECH_CODE = "DAVIDS15";

const features = [
  { icon: "phone" as IconName, title: "Plan personalizado", desc: "Rutinas diseñadas por David adaptadas a tus objetivos, nivel y disponibilidad. Actualizadas cada mes." },
  { icon: "video" as IconName, title: "Videollamadas semanales", desc: "Sesiones por videollamada para revisar técnica, resolver dudas y ajustar tu plan." },
  { icon: "scale" as IconName, title: "Control de pesajes", desc: "Registro semanal de peso, % grasa y % músculo con gráficas de evolución en la app." },
  { icon: "apple" as IconName, title: "Pautas de nutrición", desc: "Guía nutricional adaptada a tu objetivo. Sin dietas genéricas, ajustada a tu vida real." },
  { icon: "chat" as IconName, title: "Chat directo", desc: "Contacto directo por WhatsApp para dudas rápidas, ajustes de entreno o motivación." },
  { icon: "chart" as IconName, title: "Informes mensuales", desc: "Cada mes recibes un resumen de tu progreso con datos, gráficas y próximos pasos." },
];

const products = [
  { name: "Iso Whey Zero", type: "Proteína aislada", price: "49.90", image: "/img/Prote.webp", url: `https://shop.biotechusa.es/products/iso-whey-zero-bebida-de-proteina-en-polvo-1816-g/iso-whey-zero-2270-g.html` },
  { name: "100% Creatine Monohydrate", type: "Creatina", price: "19.90", image: "/img/creatina.png", url: `https://shop.biotechusa.es/products/100-micronized-creatine-monohydrate-500-g?variant=36970313678912/100-creatine-monohydrate-500-g.html` },
  { name: "BCAA Zero", type: "BCAAs", price: "24.90", image: "/img/bcaa.png", url: `https://shop.biotechusa.es/products/bcaa-glutamine-zero-480-g?variant=31620767481920/bcaa-flash-zero-360-g.html` },
  { name: "Black Blood NOX+", type: "Pre-entreno", price: "29.90", image: "/img/preentreno.webp", url: `https://shop.biotechusa.es/products/black-blood-nox-330-g?variant=31713128644672/black-blood-nox-330-g.html` },
];

export default function EntrenosOnline() {
  useReveal();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fallback: mostrar el video aunque onLoadedData no dispare
    const t = setTimeout(() => setVideoLoaded(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="eo-page">

      {/* ══ HERO — Video de fondo en loop ══ */}
      <section className="eo-hero">
        <div className="eo-hero__video-wrap">
          <video
            ref={videoRef}
            className={`eo-hero__video ${videoLoaded ? "eo-hero__video--loaded" : ""}`}
            src="/videos/video-entrenos.mp4"
            autoPlay muted loop playsInline
            onCanPlay={() => setVideoLoaded(true)}
            onLoadedData={() => setVideoLoaded(true)}
          />
          <div className="eo-hero__overlay" />
        </div>

        <div className="container eo-hero__content">
          <div className="rise">
            <p className="eo-label">Entrenamiento Online</p>
          </div>
          <h1 className="eo-hero__title rise rise--1" >
            <span className="eo-hero__title--shadow">METODO</span>
            <br />
            <span className="eo-hero__title--accent">EL DETALLE</span>
          </h1>
          <p className="eo-hero__sub rise rise--2" >
            Tu transformación no depende de un lugar.<br />
            Depende de un sistema. Y ahora lo tienes en el bolsillo.
          </p>
          <div className="eo-hero__ctas rise rise--3" >
            <a href="#que-incluye" className="btn-primary">Ver qué incluye</a>
            <a href="#contacto-entrenos" className="btn-ghost">Contactar</a>
          </div>
        </div>

        <div className="eo-hero__scroll"><span /></div>
      </section>

      {/* ══ QUÉ INCLUYE ══ */}
      <section className="eo-section" id="que-incluye">
        <div className="container">
          <div className="eo-section-header" data-reveal>
            <p className="eo-label">Todo incluido</p>
            <h2 className="eo-section__title">Que incluye el<br />Metodo One Life</h2>
            <div className="eo-cyan-line" />
            <p className="eo-section__desc">
              No es solo una rutina. Es un sistema completo de transformación con seguimiento real,
              adaptado a ti, desde cualquier lugar del mundo.
            </p>
          </div>

          <div className="eo-features stagger">
            {features.map((f) => (
              <div key={f.title} className="eo-feature"
                data-reveal>
                <span className="eo-feature__icon"><Icon name={f.icon} size={26} /></span>
                <h3 className="eo-feature__title">{f.title}</h3>
                <p className="eo-feature__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VIDEO INTRODUCCIÓN ══ */}
      <section className="eo-section eo-section--intro">
        <div className="container">
          <div className="eo-section-header" data-reveal>
            <p className="eo-label">Conoce el metodo</p>
            <h2 className="eo-section__title">Asi entrenamos</h2>
            <div className="eo-cyan-line" />
          </div>

          <div className="eo-intro-video"
            data-reveal>
            <div className="eo-intro-video__frame">
              <video
                src="/videos/video-intro.mp4"
                controls
                playsInline
                preload="metadata"
                poster="/img/gym-instalaciones.jpeg"
                className="eo-intro-video__player"
              />
            </div>
          </div>

          {/* Contacto Dabuky */}
          <div className="eo-intro-contact" id="contacto-entrenos"
            data-reveal>
            <div className="eo-intro-contact__info">
              <p className="eo-intro-contact__label">Mas informacion</p>
              <h3 className="eo-intro-contact__name">Dabuky</h3>
              <p className="eo-intro-contact__role">Entrenador personal · Metodo One Life</p>
            </div>
            <a href="https://wa.me/34601387263?text=Hola%20Dabuky!%20Quiero%20info%20sobre%20el%20Método%20One%20Life"
              target="_blank" rel="noreferrer" className="eo-intro-contact__btn">
              <Icon name="whatsapp" size={20} />
              WhatsApp · 601 38 72 63
            </a>
          </div>
        </div>
      </section>

      {/* ══ BIOTECH USA ══ */}
      <section className="eo-section eo-section--biotech" id="suplementos">
        <div className="container">
          <div className="eo-section-header" data-reveal>
          <div className="eo-partner-head">
          <img src="/img/biotech.webp" alt="BioTech USA" className="eo-partner-head__logo" />
          <p className="eo-label">Colaborador oficial</p>
          </div>
            <h2 className="eo-section__title">BioTech USA</h2>
            <div className="eo-cyan-line" />
          </div>

          <div className="eo-discount" data-reveal>
            <div className="eo-discount__text">
              <p className="eo-discount__label">Codigo de descuento exclusivo</p>
              <p className="eo-discount__info">
                Usa este código en <strong>biotechusa.es</strong> para obtener un descuento en todos los productos.
                Exclusivo para clientes de One Life One Body.
              </p>
            </div>
            <div className="eo-discount__code-wrap">
              <span className="eo-discount__code">{BIOTECH_CODE}</span>
              <button className="eo-discount__copy"
                onClick={() => {
                  navigator.clipboard.writeText(BIOTECH_CODE);
                  const btn = document.querySelector(".eo-discount__copy") as HTMLElement;
                  if (btn) { btn.textContent = "Copiado"; setTimeout(() => btn.textContent = "Copiar", 2000); }
                }}>Copiar</button>
            </div>
          </div>

          <div className="eo-products stagger">
            {products.map((p) => (
              <div key={p.name} className="eo-product"
                data-reveal>
                <div className="eo-product__img-wrap">
                  <img src={p.image} alt={p.name} className="eo-product__img" loading="lazy" />
                </div>
                <div className="eo-product__info">
                  <span className="eo-product__type">{p.type}</span>
                  <h3 className="eo-product__name">{p.name}</h3>
                  <span className="eo-product__price">{p.price}€</span>
                </div>
                <a href={p.url} target="_blank" rel="noreferrer" className="eo-product__btn">Comprar</a>
              </div>
            ))}
          </div>

          <p className="eo-products__note" data-reveal>
            * Precios orientativos. Aplica el código <strong>{BIOTECH_CODE}</strong> en el checkout para tu descuento.
          </p>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="eo-cta">
        <div className="container eo-cta__inner">
          <div data-reveal>
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
                <Icon name="whatsapp" size={20} />
                Muky · 631 98 63 91
              </a>
              <a href="https://wa.me/34601387263?text=Hola%20Dabuky!%20Quiero%20info%20sobre%20el%20Método%20One%20Life"
                target="_blank" rel="noreferrer" className="eo-cta__wa-btn">
                <Icon name="whatsapp" size={20} />
                Dabuky · 601 38 72 63
              </a>
            </div>
            <div className="eo-cta__buttons">
              <a href="https://www.instagram.com/one.life.one.body.benidorm/" target="_blank" rel="noreferrer" className="btn-ghost">Instagram</a>
              <a href="/" className="btn-ghost"><Icon name="arrow-left" size={15} /> Volver a la web</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="eo-footer">
        <div className="container eo-footer__inner">
          <img src={logoImg} alt="OLOB" className="eo-footer__logo" />
          <p>© {new Date().getFullYear()} One Life One Body · Fitness Center · Benidorm</p>
        </div>
      </footer>
    </div>
  );
}