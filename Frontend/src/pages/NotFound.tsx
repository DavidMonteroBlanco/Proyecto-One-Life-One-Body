// src/pages/NotFound.tsx

import ErrorPage from "./ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Página no encontrada"
      text="La página que buscas no existe o ha sido movida."
      actions={[
        { to: "/", label: "Ir al inicio", variant: "primary" },
        { to: "/dashboard", label: "Mi panel", variant: "ghost" },
      ]}
    />
  );
}
