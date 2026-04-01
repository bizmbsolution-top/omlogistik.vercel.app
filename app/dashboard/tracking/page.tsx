"use client";

import { useEffect, useState } from "react";

export default function TrackingPage() {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // 🔥 FIX ERROR TYPESCRIPT
    // @ts-ignore
    import("leaflet").then((leaflet: any) => {
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L || map) return;

    const mapInstance = L.map("map").setView([-6.2, 106.8], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapInstance);

    const marker = L.marker([-6.2, 106.8]).addTo(mapInstance);
    marker.bindPopup("🚛 Tracking Driver").openPopup();

    setMap(mapInstance);
  }, [mounted, L]);

  if (!mounted) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📍 Tracking Driver</h1>

      <div
        id="map"
        style={{
          height: "500px",
          width: "100%",
          marginTop: 20,
        }}
      />
    </div>
  );
}