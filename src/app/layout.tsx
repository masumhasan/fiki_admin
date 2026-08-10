import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIKI Transit Admin Portal",
  description: "The admin portal for FIKI Transit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-full font-sans antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
