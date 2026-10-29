// src/pages/ErrorPage.tsx
//
// Base compartida por las pantallas de error (404 y 403).

import { Link } from "react-router-dom";
import "./ErrorPage.css";

type Action = { to: string; label: string; variant: "primary" | "ghost" };

type Props = {
  code: string;
  title: string;
  text: string;
  actions: Action[];
  /** Tiñe el código de rojo en lugar del cian de marca. */
  denied?: boolean;
};

export default function ErrorPage({ code, title, text, actions, denied = false }: Props) {
  return (
    <div className={`error-page ${denied ? "error-page--denied" : ""}`}>
      <span className="error-page__code">{code}</span>
      <h1 className="error-page__title">{title}</h1>
      <p className="error-page__text">{text}</p>
      <div className="error-page__actions">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className={a.variant === "primary" ? "btn-primary" : "btn-ghost"}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
