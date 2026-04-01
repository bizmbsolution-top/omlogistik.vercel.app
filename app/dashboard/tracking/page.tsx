"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabaseClient";

import "leaflet/dist/leaflet.css";

// =========================
// DYNAMIC IMPORT (WAJIB NEXTJS)
// =========================
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

export default function TrackingPage() {
  const [data, setData] = useState<any[]>([]);
  const [L, setL] = useState<any>(null);

  // =========================
  // FIX ICON LEAFLET (ANTI 404)
  // =========================
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      const Llib = leaflet.default;

      delete (Llib.Icon.Default.prototype as any)._getIconUrl;

      Llib.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });

      setL(Llib);
    });
  }, []);

  // =========================
  // LOAD DATA
  // =========================
  const getData = async () => {
    const { data, error } = await supabase
      .from("jo_trucking_details")
      .select("*");

    if (error) {
      console.log("ERROR:", error);
    }

    console.log("DATA:", data);
    setData(data || []);
  };

  // =========================
  // REALTIME SUBSCRIBE
  // =========================
  useEffect(() => {
    getData();

    const channel = supabase
      .channel("tracking-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jo_trucking_details",
        },
        (payload) => {
          console.log("REALTIME EVENT:", payload);
          getData(); // reload data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =========================
  // STATUS EMOJI
  // =========================
  const getStatusEmoji = (status: string) => {
    if (status === "DITERIMA") return "🔵";
    if (status === "START") return "🟢";
    if (status === "SAMPAI") return "🟠";
    if (status === "SELESAI") return "⚫";
    if (status === "PANIC") return "🔴";
    return "🔵";
  };

  // ⛔ tunggu leaflet siap
  if (!L) return <p>Loading map...</p>;

  return (
    <div style={{ height: "100vh" }}>
      <MapContainer
        center={[-6.1785, 106.6300]}
        zoom={12}
        style={{ height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 🔴 MARKER DUMMY (WAJIB MUNCUL) */}
        <Marker position={[-6.1785, 106.6300]}>
          <Popup>DUMMY MARKER OK</Popup>
        </Marker>

        {/* 🔵 MARKER DATABASE */}
        {data.map((item, index) => {
          const lat = Number(item.latitude);
          const lon = Number(item.longitude);

          console.log("COORD:", lat, lon);

          if (!lat || !lon) return null;

          return (
            <Marker key={index} position={[lat, lon]}>
              <Popup>
                <div>
                  <p><b>JO ID:</b> {item.jo_id}</p>
                  <p>
                    <b>Status:</b>{" "}
                    {getStatusEmoji(item.status_perjalanan)}{" "}
                    {item.status_perjalanan}
                  </p>
                  <p><b>Lat:</b> {lat}</p>
                  <p><b>Lng:</b> {lon}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}