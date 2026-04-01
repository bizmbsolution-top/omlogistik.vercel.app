"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    // 1. register auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;

    // 2. insert perusahaan
    const { data: perusahaan, error: errPerusahaan } = await supabase
      .from("profil_perusahaan")
      .insert({
        nama_perusahaan: namaPerusahaan,
        email_admin: email,
        kode_unik: "OM-" + Date.now(),
      })
      .select()
      .single();

    if (errPerusahaan) {
      alert("Gagal buat perusahaan");
      return;
    }

    // 3. insert user
    await supabase.from("profil_pengguna").insert({
      id: userId,
      perusahaan_id: perusahaan.id,
      nama_lengkap: "Admin",
      peran: "OWNER",
    });

    alert("Register berhasil!");
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Register</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Nama Perusahaan"
        value={namaPerusahaan}
        onChange={(e) => setNamaPerusahaan(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-2"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="bg-blue-500 text-white p-2 w-full"
      >
        Register
      </button>
    </div>
  );
}