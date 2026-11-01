import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f7",
        }}
      >
        <div
          style={{
            width: 138,
            height: 138,
            borderRadius: 999,
            border: "5px solid #15140f",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 82,
            color: "#15140f",
          }}
        >
          H
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
