"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function JobOrderDetail() {
  const params = useParams();
  const id = params.id as string;

  const [jo, setJo] = useState<any>(null);
  const [fleets, setFleets] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const [selectedFleet, setSelectedFleet] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");

  // =========================
  // LOAD DATA
  // =========================
  const getData = async () => {
    const { data: joData } = await supabase
      .from("job_orders")
      .select("*")
      .eq("id", id)
      .single();

    setJo(joData);

    const { data: fleetData } = await supabase
      .from("data_armada")
      .select("*");

    const { data: driverData } = await supabase
      .from("data_driver")
      .select("*");

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
  // 🚀 DISPATCH + WA
  // =========================
  const handleDispatch = async () => {
    if (!selectedFleet || !selectedDriver || !selectedPhone) {
      alert("Lengkapi semua data!");
      return;
    }

    const phone = formatPhone(selectedPhone);

    // ✅ DOMAIN VERCEL (FIX)
    const baseUrl = "https://omlogistik.vercel.app";

    const driverLink = `${baseUrl}/driver?jo=${id}`;

    // update DB
    await supabase
      .from("job_orders")
      .update({
        nopol_armada: selectedFleet,
        nama_driver: selectedDriver,
        hp_driver: phone,
        status_jo: "DISPATCHED",
      })
      .eq("id", id);

    const message = encodeURIComponent(
      "🚛 Tugas Baru\n\n" +
      "No JO: " + jo?.nomor_jo + "\n\n" +
      "Klik link ini:\n" +
      driverLink
    );

    const waUrl = `https://wa.me/${6285218129978}?text=${message}`;

    window.open(waUrl, "_blank");
  };

  if (!jo) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🚛 Dispatch Job Order</h1>

      <p><b>No JO:</b> {jo?.nomor_jo}</p>
      <p><b>Status:</b> {jo?.status_jo}</p>

      <div style={{ marginTop: 20, maxWidth: 400 }}>

        {/* FLEET */}
        <div style={{ marginBottom: 15 }}>
          <label>Pilih Fleet</label>
          <select
            value={selectedFleet}
            onChange={(e) => setSelectedFleet(e.target.value)}
            style={{ width: "100%", padding: 10 }}
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
        <div style={{ marginBottom: 15 }}>
          <label>Pilih Driver</label>
          <select
            onChange={(e) => {
              const selected = drivers.find(
                (d) => d.nama_driver === e.target.value
              );
              setSelectedDriver(selected?.nama_driver || "");
              setSelectedPhone(selected?.no_hp || "");
            }}
            style={{ width: "100%", padding: 10 }}
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
        <div style={{ marginBottom: 15 }}>
          <label>No HP Driver</label>
          <input
            value={selectedPhone}
            disabled
            style={{ width: "100%", padding: 10 }}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleDispatch}
          style={{
            background: "green",
            color: "white",
            padding: 12,
            width: "100%",
          }}
        >
          🚀 Assign + Kirim WhatsApp
        </button>
      </div>
    </div>
  );
}