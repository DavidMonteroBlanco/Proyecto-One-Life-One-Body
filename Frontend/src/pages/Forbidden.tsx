// src/pages/Forbidden.tsx

import ErrorPage from "./ErrorPage";

export default function Forbidden() {
  return (
    <ErrorPage
      denied
      code="403"
      title="Acceso denegado"
      text="No tienes permisos para acceder a esta sección. Si crees que es un error, contacta con tu entrenador."
      actions={[
        { to: "/dashboard", label: "Mi panel", variant: "primary" },
        { to: "/", label: "Ir al inicio", variant: "ghost" },
      ]}
    />
  );
}
