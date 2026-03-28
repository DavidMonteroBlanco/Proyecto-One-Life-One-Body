import type { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="olob-app">
      <div className="olob-bg" />
      <main className="olob-main">
        <div className="olob-container">{children}</div>
      </main>
    </div>
  );
}
