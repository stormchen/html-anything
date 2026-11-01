import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
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
            width: 392,
            height: 392,
            borderRadius: 999,
            border: "14px solid #15140f",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 232,
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
