import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DependencyProvider } from "../src/infrastructure/di/DependencyProvider";
import { ToastContainer } from "../src/adapters/in/components/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS Frontend - Terminal de Venta",
  description: "Sistema de punto de venta con arquitectura hexagonal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DependencyProvider baseUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}>
          <ToastContainer />
          {children}
        </DependencyProvider>
      </body>
    </html>
  );
}
