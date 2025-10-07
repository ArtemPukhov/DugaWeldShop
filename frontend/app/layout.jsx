import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico?v=4" sizes="any" />
        <link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=4" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
