"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function AssignJOPage() {
  const params = useParams();
  const id = params.id;

  const [jo, setJo] = useState<any>(null);
  const [fleets, setFleets] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [profil, setProfil] = useState<any>(null);

  const [selectedFleet, setSelectedFleet] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");

  // =========================
  // LOAD DATA
  // =========================
  const getData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ambil profil (tenant)
    const { data: profilData } = await supabase
      .from("profil_pengguna")
      .select("*")
      .eq("id", user?.id)
      .single();

    setProfil(profilData);

    // ambil JO
    const { data: joData } = await supabase
      .from("job_orders")
      .select("*")
      .eq("id", id)
      .single();

    setJo(joData);

    // ambil fleet
    const { data: fleetData } = await supabase
      .from("data_armada")
      .select("*")
      .eq("perusahaan_id", profilData.perusahaan_id);

    // ambil driver
    const { data: driverData } = await supabase
      .from("data_driver")
      .select("*")
      .eq("perusahaan_id", profilData.perusahaan_id);

    setFleets(fleetData || []);
    setDrivers(driverData || []);
  };

  useEffect(() => {
    if (id) getData();
  }, [id]);

  // =========================
  // FORMAT NOMOR HP
  // =========================
  const formatPhone = (phone: string) => {
    if (!phone) return "";

    let result = phone.replace(/\D/g, "");

    if (result.startsWith("0")) {
      result = "62" + result.slice(1);
    }

    if (result.startsWith("8")) {
      result = "62" + result;
    }

    return result;
  };

  // =========================
  // ASSIGN + KIRIM WA
  // =========================
  const handleDispatch = async () => {
    if (!selectedFleet || !selectedDriver || !selectedPhone) {
      alert("Lengkapi semua data!");
      return;
    }

    const phone = formatPhone(selectedPhone);

    // 🔥 GANTI IP SESUAI LAPTOP KAMU
    const driverLink = `http://192.168.1.40:3000/driver?jo=${b7656270-d4e0-4ac4-a29f-7e5ab4face79}`;

    // update database
    await supabase
      .from("job_orders")
      .update({
        nopol_armada: selectedFleet,
        nama_driver: selectedDriver,
        hp_driver: phone,
        driver_link: driverLink,
        status_jo: "DISPATCHED",
      })
      .eq("id", id);

    // pesan WA
    const message = encodeURIComponent(
      `🚛 *Tugas Baru*\n\nAnda mendapat Job Order.\n\nKlik link ini:\n${driverLink}`
    );

    const waUrl = `https://wa.me/${6285218129978}?text=${message}`;

    // buka WA
    window.open(waUrl, "_blank");
  };

  if (!jo) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🚛 Dispatch Job Order</h1>

      <p><b>No JO:</b> {jo.nomor_jo}</p>
      <p><b>Status:</b> {jo.status_jo}</p>

      <div style={containerStyle}>

        {/* FLEET */}
        <div>
          <label>Pilih Fleet</label>
          <select
            value={selectedFleet}
            onChange={(e) => setSelectedFleet(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Pilih Fleet --</option>
            {fleets.map((f) => (
              <option key={f.id} value={f.nopol}>
                {f.nopol} - {f.jenis_truk}
              </option>
            ))}
          </select>
        </div>

        {/* DRIVER */}
        <div>
          <label>Pilih Driver</label>
          <select
            onChange={(e) => {
              const selected = drivers.find(
                (d) => d.nama_driver === e.target.value
              );
              setSelectedDriver(selected?.nama_driver || "");
              setSelectedPhone(selected?.no_hp || "");
            }}
            style={inputStyle}
          >
            <option value="">-- Pilih Driver --</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.nama_driver}>
                {d.nama_driver}
              </option>
            ))}
          </select>
        </div>

        {/* HP */}
        <div>
          <label>No HP Driver</label>
          <input value={selectedPhone} disabled style={inputStyle} />
        </div>

        {/* BUTTON */}
        <button onClick={handleDispatch} style={buttonStyle}>
          🚀 Assign + Kirim WhatsApp
        </button>
      </div>
    </div>
  );
}

// STYLE
const containerStyle = {
  marginTop: 20,
  maxWidth: 400,
  display: "flex",
  flexDirection: "column" as const,
  gap: 15,
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const buttonStyle = {
  background: "green",
  color: "white",
  padding: "12px",
  borderRadius: 5,
  fontWeight: "bold",
};