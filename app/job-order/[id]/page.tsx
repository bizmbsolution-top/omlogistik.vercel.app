"use client";

export default function TestWA() {

  const handleDispatch = () => {
    // 👉 GANTI NOMOR KAMU (WAJIB)
    const phone = "6285218129978";

    // 👉 LINK TEST DULU (BIAR PASTI MUNCUL)
    const link = "https://my-logistik-app.vercel.app/driver";

    const message = encodeURIComponent(
      "🚛 TEST WA\n\nKlik link ini:\n" + link
    );

    const url = `https://wa.me/${6285218129978}?text=${message}`;

    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>TEST WHATSAPP</h1>

      <button
        onClick={handleDispatch}
        style={{
          background: "green",
          color: "white",
          padding: 20,
          fontSize: 16,
        }}
      >
        🚀 TEST KIRIM WA
      </button>
    </div>
  );
}