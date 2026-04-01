"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    } else {
      setUser(user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">OMLOGISTIK</h2>

        <nav className="space-y-2">
          <Link href="/dashboard">Dashboard</Link>
          <br />
          <Link href="/dashboard/work-order">Work Order</Link>
          <br />
          <Link href="/dashboard/tracking">Tracking</Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}