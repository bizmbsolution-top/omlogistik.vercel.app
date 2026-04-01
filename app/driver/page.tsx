"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function DriverContent() {
  const searchParams = useSearchParams();
  const jo = searchParams.get("jo");

  const [status, setStatus] = useState("Menunggu GPS...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("GPS tidak support");
      return;
    }

    navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setStatus(`📍 Lokasi: ${lat}, ${lng}`);
      },
      () => {
        setStatus("❌ GPS tidak diizinkan");
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🚛 DRIVER TRACKING</h1>

      <p><b>JO:</b> {jo}</p>

      <h3>{status}</h3>
    </div>
  );
}

export default function DriverPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriverContent />
    </Suspense>
  );
}