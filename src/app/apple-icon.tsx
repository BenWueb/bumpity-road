import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 3L2 15h4v12h20V15h4L16 3z" fill="#8B4513" />
          <path
            d="M16 3L2 15h4v12h20V15h4L16 3z"
            stroke="#5D3A1A"
            strokeWidth="1.5"
            fill="none"
          />
          <rect x="8" y="15" width="16" height="12" fill="#DEB887" />
          <rect x="13" y="19" width="6" height="8" rx="0.5" fill="#5D3A1A" />
          <circle cx="17.5" cy="23" r="0.8" fill="#FFD700" />
          <rect
            x="9.5"
            y="17"
            width="3"
            height="3"
            rx="0.3"
            fill="#87CEEB"
            stroke="#5D3A1A"
            strokeWidth="0.5"
          />
          <rect
            x="19.5"
            y="17"
            width="3"
            height="3"
            rx="0.3"
            fill="#87CEEB"
            stroke="#5D3A1A"
            strokeWidth="0.5"
          />
          <rect x="21" y="6" width="4" height="7" fill="#8B0000" />
          <rect x="20.5" y="5" width="5" height="1.5" fill="#A52A2A" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}

