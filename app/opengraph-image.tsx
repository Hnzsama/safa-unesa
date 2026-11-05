import { ImageResponse } from "next/og";

export const alt = "SAFA UNESA - Portal Pengaduan Fasilitas Kampus Terpadu";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(216, 174, 71, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(30, 58, 138, 0.35) 0%, transparent 50%)",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "#fafafa",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: "#d8ae47",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "900",
                color: "#0f172a",
              }}
            >
              U
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                SAFA UNESA
              </span>
              <span style={{ fontSize: "16px", color: "#cbcbcb" }}>
                Universitas Negeri Surabaya
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(216, 174, 71, 0.15)",
              border: "1px solid rgba(216, 174, 71, 0.35)",
              color: "#d8ae47",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            <span>●</span>
            <span>Layanan Publik Resmi</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              margin: 0,
              color: "#ffffff",
            }}
          >
            Layanan Pengaduan &amp; Fasilitas Sarpras UNESA
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "900px",
            }}
          >
            Lapor kendala fasilitas kampus secara cepat tanpa login. Pantau progres perbaikan oleh teknisi secara realtime di Kampus Ketintang &amp; Lidah Wetan.
          </p>
        </div>

        {/* Feature Badges Bottom */}
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "18px",
              color: "#e4e4e7",
              fontWeight: "600",
            }}
          >
            ⚡ Tanpa Login Akun
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "18px",
              color: "#e4e4e7",
              fontWeight: "600",
            }}
          >
            📸 Multi Foto Bukti
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "16px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "18px",
              color: "#e4e4e7",
              fontWeight: "600",
            }}
          >
            🔍 Live Tracking Tiket
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
