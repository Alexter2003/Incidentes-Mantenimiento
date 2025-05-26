import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Equipos",
  description: "Sistema de gestión de equipos, mantenimiento e incidentes",
};

export default function EquiposLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container mx-auto py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Equipos</h1>
        <p className="text-muted-foreground">
          Administre sus equipos, mantenimientos e incidentes
        </p>
      </header>
      {children}
    </div>
  );
}
