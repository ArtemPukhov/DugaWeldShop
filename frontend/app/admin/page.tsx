"use client";

import Link from "next/link";
import { hasToken } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTopBar from "@/components/AdminTopBar";

export default function AdminHomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div>
      <AdminTopBar />
      <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Админ-панель</h1>
      <div className="space-y-3">
        <Link className="text-blue-600 underline" href="/admin/categories">
          Управление категориями
        </Link>
        <br />
        <Link className="text-blue-600 underline" href="/admin/products">
          Управление товарами
        </Link>
      </div>
      </div>
    </div>
  );
}


