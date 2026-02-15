import type { Metadata } from "next";
import "./globals.css";
import { OfflineBanner } from "@/components/common/feedback/OfflineBanner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ServiceWorkerProvider } from "@/components/providers/ServiceWorkerProvider";
import { SyncProvider } from "@/components/providers/SyncProvider";
import { Toaster } from "@/components/ui/sonner";
import { Agentation } from "agentation";

export const metadata: Metadata = {
  title: "Grid Electric Services",
  description: "Damage Assessment Platform for Utility Contractors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ServiceWorkerProvider>
            <SyncProvider>
              <OfflineBanner />
              {children}
              {process.env.NODE_ENV === "development" && <Agentation />}
              <Toaster />
            </SyncProvider>
          </ServiceWorkerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
