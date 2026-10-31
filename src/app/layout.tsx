import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroVision AI - Autonomous Plant Pathology & Telemetry Monitoring",
  description: "Dual AI (CNN vs Multimodal Vision LLM) Plant Disease Diagnosis & Environmental Anomaly Detection System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#090e17] text-slate-100" suppressHydrationWarning>{children}</body>
    </html>
  );
}
