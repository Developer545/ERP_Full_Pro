import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | ERP Full Pro",
    default: "ERP Full Pro",
  },
  description: "Sistema ERP completo para empresas de El Salvador",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <AntdProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </AntdProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
