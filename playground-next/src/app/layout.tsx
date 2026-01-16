"use client";

import { TangentProvider } from "tangent-core";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <TangentProvider endpoint="/api/tangent/update">
          <div
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
              minHeight: "100vh",
              color: "#fff",
            }}
          >
            {children}
          </div>
        </TangentProvider>
      </body>
    </html>
  );
}
