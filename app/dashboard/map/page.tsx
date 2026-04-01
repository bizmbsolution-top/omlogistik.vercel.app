"use client";

import { useEffect, useState } from "react";

export default function MapPage() {
  const [mounted, setMounted] = useState(false);
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // load leaflet (fix error typescript)
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

    // marker awal
    const marker = L.marker([-6.2, 106.8]).addTo(mapInstance);
    marker.bindPopup("🚛 Lokasi Driver").openPopup();

    setMap(mapInstance);
  }, [mounted, L]);

  if (!mounted) return <div>Loading map...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>🗺️ Tracking Map</h1>

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