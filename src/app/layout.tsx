import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

export const metadata: Metadata = {
  title: "DeepGuard AI",
  description: "Forensic intelligence platform designed to detect deepfakes and AI-generated media with high certainty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const enableRemoteScripts = process.env.NEXT_PUBLIC_ENABLE_REMOTE_SCRIPTS === "true";
  const safeTargetOrigin =
    process.env.NEXT_PUBLIC_ROUTE_MESSAGE_TARGET_ORIGIN || "https://deepguard-ai-pi.vercel.app";
  return (
    <html lang="en">
      <body className="antialiased">
        {enableRemoteScripts && (
          <Script
            id="orchids-browser-logs"
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
            strategy="afterInteractive"
            data-orchids-project-id="6c3364f5-94ad-49db-8735-b7496573e16e"
          />
        )}
        <ErrorReporter />
        {enableRemoteScripts && (
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin={safeTargetOrigin}
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="false"
            data-custom-data='{"appName": "DeepGuard AI", "version": "1.0.0"}'
          />
        )}
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
