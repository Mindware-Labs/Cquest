import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

export function renderOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "linear-gradient(135deg, #0a1116 0%, #163846 55%, #3f738d 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 10, height: 44, background: "#74c3d5", borderRadius: 3 }} />
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: 2, color: "#74c3d5" }}>
            CENTER QUEST
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#ffffff",
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 28,
            lineHeight: 1.4,
            color: "#d6d1ca",
            maxWidth: 920,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
