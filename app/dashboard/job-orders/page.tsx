"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobOrdersPage() {
  const [data, setData] = useState<any[]>([]);

  // =========================
  // LOAD DATA
  // =========================
  const getData = async () => {
    const { data, error } = await supabase
      .from("job_orders")
      .select("*")
      .order("dibuat_pada", { ascending: false });

    if (error) {
      console.log("ERROR:", error);
    }

    setData(data || []);
  };

  useEffect(() => {
    getData();
  }, []);

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
  // COPY LINK
  // =========================
  const copyLink = (link: string) => {
    if (!link) {
      alert("Link belum tersedia");
      return;
    }

    navigator.clipboard.writeText(link);
    alert("Link driver berhasil di-copy");
  };

  // =========================
  // KIRIM WHATSAPP (FINAL FIX)
  // =========================
  const sendWhatsApp = (phone: string, link: string) => {
    if (!phone || !link) {
      alert("Nomor atau link kosong");
      return;
    }

    const cleanPhone = formatPhone(phone);

    const message = encodeURIComponent(
      `Halo Driver,\n\nSilakan klik link berikut untuk mulai tracking:\n${link}`
    );

    const url = `https://wa.me/${cleanPhone}?text=${message}`;

    // 🔥 FIX FINAL (ANTI BLOCK)
    window.location.href = url;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🚛 Job Orders</h1>

      <table border={1} cellPadding={10} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>No JO</th>
            <th>Driver</th>
            <th>No HP</th>
            <th>Link</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.nomor_jo}</td>
              <td>{item.nama_driver}</td>
              <td>{item.hp_driver}</td>

              <td>
                {item.driver_link ? (
                  <span style={{ fontSize: 12 }}>
                    {item.driver_link}
                  </span>
                ) : (
                  "-"
                )}
              </td>

              <td style={{ display: "flex", gap: 5 }}>
                {/* COPY LINK */}
                <button
                  onClick={() => copyLink(item.driver_link)}
                  style={{
                    background: "blue",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: 5,
                  }}
                >
                  Copy Link
                </button>

                {/* KIRIM WA */}
                <button
                  onClick={() =>
                    sendWhatsApp(item.hp_driver, item.driver_link)
                  }
                  style={{
                    background: "green",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: 5,
                  }}
                >
                  Kirim WA
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}