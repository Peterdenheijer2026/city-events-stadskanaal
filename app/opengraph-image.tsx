import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "City Events Stadskanaal – Knoalsternacht & Koningsdag";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 4rem",
            background: "linear-gradient(145deg, rgba(255, 107, 0, 0.25) 0%, rgba(10, 10, 10, 0.85) 100%)",
            border: "3px solid rgba(255, 107, 0, 0.5)",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "white",
                letterSpacing: "0.02em",
                textTransform: "lowercase",
              }}
            >
              city events
            </span>
            <span
              style={{
                fontSize: 38,
                fontWeight: 600,
                color: "#ffb74d",
                letterSpacing: "0.08em",
                textTransform: "lowercase",
              }}
            >
              stadskanaal
            </span>
          </div>
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              alignItems: "baseline",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.95)" }}>
              Knoalsternacht / Koningsdag
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "white",
              }}
            >
              2026
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
