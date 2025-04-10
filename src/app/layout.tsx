import type { Metadata } from "next";
import StyledComponentsRegistry from '@/lib/registry';
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "YouTube Multi-Watcher",
  description: "Watch multiple YouTube streams simultaneously",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <StyledComponentsRegistry>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </StyledComponentsRegistry>
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
