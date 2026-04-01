"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function DriverPage() {
  const searchParams = useSearchParams();
  const jo_id = searchParams.get("jo");

  const [status, setStatus] = useState("Menunggu GPS...");

  useEffect(() => {
    if (!jo_id) {
      setStatus("JO tidak ditemukan");
      return;
    }

    // minta GPS dari HP
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setStatus(`📍 Lokasi terkirim: ${lat}, ${lng}`);

          console.log("Kirim lokasi:", lat, lng);

          // kirim ke Supabase
          await supabase
            .from("jo_trucking_details")
            .update({
              latitude: lat.toString(),
              longitude: lng.toString(),
            })
            .eq("job_order_id", jo_id);
        },
        (error) => {
          setStatus("❌ GPS ditolak / error");
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    } else {
      setStatus("Browser tidak support GPS");
    }
  }, [jo_id]);

  return (
    <div style={{ padding: 30 }}>
      <h1>🚛 DRIVER TRACKING</h1>

      <p><b>JO ID:</b> {jo_id}</p>

      <h3>{status}</h3>

      <p>Pastikan GPS aktif ya 📍</p>
    </div>
  );
}