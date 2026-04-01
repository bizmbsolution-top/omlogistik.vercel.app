"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function DriverPage() {
  const params = useParams();
  const id = params?.id as string;

  const [jo, setJo] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const adminPhone = "6285218129978";

  // LOAD DATA
  useEffect(() => {
    if (!id) return;

    fetchData();

    // 🔥 AUTO TRACK GPS TIAP 10 DETIK
    const interval = setInterval(() => {
      sendLocation();
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("job_orders")
      .select(`*, jo_trucking_details (*)`)
      .eq("id", id)
      .single();

    setJo(data);
  };

  // 📍 GET GPS + SAVE
  const sendLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      console.log("GPS:", lat, lng);

      await supabase
        .from("jo_trucking_details")
        .update({
          latitude: lat.toString(),
          longitude: lng.toString(),
          last_update: new Date().toISOString(),
        })
        .eq("jo_id", id);
    });
  };

  // STATUS
  const updateStatus = async (newStatus: string) => {
    await supabase
      .from("jo_trucking_details")
      .update({ status_perjalanan: newStatus })
      .eq("jo_id", id);

    alert("Status berhasil diupdate!");
    window.location.reload();
  };

  // PANIC
  const handlePanic = () => {
    const message = `🚨 PANIC ALERT 🚨
JO: ${jo?.nomor_jo}`;

    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // UPLOAD FOTO
  const handleUpload = async () => {
    if (!file) return alert("Pilih foto!");

    const fileName = `${id}-${Date.now()}.jpg`;

    await supabase.storage
      .from("driver-photos")
      .upload(fileName, file, { upsert: true });

    const publicUrl = supabase.storage
      .from("driver-photos")
      .getPublicUrl(fileName).data.publicUrl;

    await supabase
      .from("jo_trucking_details")
      .update({ foto_url: publicUrl })
      .eq("jo_id", id);

    alert("Upload berhasil!");
  };

  if (!jo) return <div className="p-4">Loading...</div>;

  const detail = jo.jo_trucking_details?.[0];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">

        <h1 className="text-lg font-semibold">Driver Job</h1>

        <div className="bg-white p-4 rounded shadow">
          <p><b>JO:</b> {jo.nomor_jo}</p>
          <p><b>Status:</b> {detail?.status_perjalanan}</p>
          <p><b>Lat:</b> {detail?.latitude || "-"}</p>
          <p><b>Lng:</b> {detail?.longitude || "-"}</p>
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <button onClick={() => updateStatus("DITERIMA")} className="w-full bg-green-500 text-white p-3 rounded">Terima</button>
          <button onClick={() => updateStatus("START")} className="w-full bg-blue-500 text-white p-3 rounded">Mulai</button>
          <button onClick={() => updateStatus("SAMPAI")} className="w-full bg-yellow-500 text-white p-3 rounded">Sampai</button>
          <button onClick={() => updateStatus("SELESAI")} className="w-full bg-black text-white p-3 rounded">Selesai</button>
        </div>

        {/* FOTO */}
        <div className="bg-white p-4 rounded shadow space-y-2">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUpload} className="w-full bg-purple-600 text-white p-3 rounded">
            Upload Foto
          </button>
        </div>

        {/* PANIC */}
        <button onClick={handlePanic} className="w-full bg-red-600 text-white p-4 rounded">
          🚨 PANIC BUTTON
        </button>

      </div>
    </div>
  );
}