import type { Metadata } from "next";
import StyledComponentsRegistry from '@/lib/registry';
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "YouTube Multi-Watcher",
  description: "Watch multiple YouTube streams simultaneously",
};
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';

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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
