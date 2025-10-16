import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DugaWeld - Сварочное оборудование для профессионалов",
  description: "Интернет-магазин сварочного оборудования. Лучшие бренды, выгодные цены, доставка по всей стране. Сварочные аппараты, принадлежности, газосварочное оборудование.",
  keywords: "сварочное оборудование, сварочные аппараты, электроды, газосварка, сварка, инструменты",
  icons: {
    icon: [
      { url: '/favicon.ico?v=4', sizes: 'any' },
      { url: '/favicon.svg?v=4', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico?v=4',
    apple: '/favicon.svg?v=4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico?v=4" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=4" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
