"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [perusahaan, setPerusahaan] = useState<any>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    // ambil user login
    const { data } = await supabase.auth.getUser();

    if (!data.user) return;

    setUser(data.user);

    // ambil profil pengguna
    const { data: profil } = await supabase
      .from("profil_pengguna")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profil) return;

    // ambil perusahaan
    const { data: perusahaanData } = await supabase
      .from("profil_perusahaan")
      .select("*")
      .eq("id", profil.perusahaan_id)
      .single();

    setPerusahaan(perusahaanData);
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Dashboard</h1>

      {perusahaan && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <p className="font-bold">
            Perusahaan: {perusahaan.nama_perusahaan}
          </p>
          <p>Email: {perusahaan.email_admin}</p>
        </div>
      )}

      {user && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}