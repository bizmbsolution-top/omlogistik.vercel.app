"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [L, setL] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // pastikan hanya render di client
  useEffect(() => {
    setMounted(true);

    import("leaflet").then((leaflet) => {
      setL(leaflet);
    });
  }, []);

  // fetch data
  useEffect(() => {
    fetchDrivers();

    const interval = setInterval(fetchDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from("jo_trucking_details")
      .select("*");

    if (data) setDrivers(data);
  };

  // icon warna
  const getIcon = (status: string) => {
    if (!L) return undefined;

    let color = "blue";

    if (status === "START" || status === "MULAI") color = "green";
    else if (status === "SAMPAI") color = "orange";
    else if (status === "SELESAI") color = "black";
    else if (status === "PANIC") color = "red";

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  // ⛔ jangan render sebelum mounted
  if (!mounted) return null;

  return (
    <div className="w-full h-screen">
      <MapContainer
        key={mounted ? "map-ready" : "map-loading"} // 🔥 FIX REUSE ERROR
        center={[-6.2, 106.8]}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {drivers.map((d, i) => {
          const lat = parseFloat(d.latitude);
          const lng = parseFloat(d.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={i}
              position={[lat, lng]}
              icon={getIcon(d.status_perjalanan)}
            >
              <Popup>
                🚚 Driver <br />
                Status: {d.status_perjalanan}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}