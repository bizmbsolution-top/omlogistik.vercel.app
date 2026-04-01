"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// =========================
// COMPONENT ISI
// =========================
function DriverContent() {
  const searchParams = useSearchParams();
  const jo = searchParams.get("jo");

  const [status, setStatus] = useState("Menunggu GPS...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("❌ GPS tidak support di HP ini");
      return;
    }

    navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setStatus(`📍 Lokasi: ${lat}, ${lng}`);
        console.log("GPS:", lat, lng);
      },
      (err) => {
        setStatus("❌ GPS tidak diizinkan");
        console.error(err);
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🚛 DRIVER TRACKING</h1>

      <p><b>JO ID:</b> {jo}</p>

      <h3>{status}</h3>

      <p>Aktifkan GPS ya 📍</p>
    </div>
  );
}

// =========================
// WRAPPER SUSPENSE
// =========================
export default function DriverPage() {
  return (
    <Suspense fallback={<div>Loading driver...</div>}>
      <DriverContent />
    </Suspense>
  );
}