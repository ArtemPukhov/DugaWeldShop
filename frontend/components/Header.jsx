"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">DugaWeld</h1>
      <nav className="space-x-6">
        <Link href="/" className="hover:text-yellow-400">Главная</Link>
        <Link href="/catalog" className="hover:text-yellow-400">Каталог</Link>
        <Link href="/about" className="hover:text-yellow-400">О компании</Link>
        <Link href="/contacts" className="hover:text-yellow-400">Контакты</Link>
      </nav>
      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
        Корзина
      </Button>
    </header>
  );
}
