import { ImageResponse } from "next/og";
import { prisma } from "@/utils/prisma";

export const runtime = "nodejs";

export const alt = "Bumpity Road - The Cabin";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Fetch the header image URL from settings
  let headerImageUrl: string | null = null;
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "headerImage" },
    });
    headerImageUrl = setting?.value ?? null;
  } catch (error) {
    console.error("Error fetching header image:", error);
  }

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
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background Image or Gradient Fallback */}
        {headerImageUrl ? (
          <img
            src={headerImageUrl}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #1a472a 100%)",
            }}
          />
        )}

        {/* Dark overlay for text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Cabin Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 24,
              padding: 20,
            }}
          >
            <svg
              width="100"
              height="100"
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

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 12,
              textShadow: "2px 4px 8px rgba(0,0,0,0.5)",
            }}
          >
            Bumpity Road
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: "#ffffff",
              opacity: 0.9,
              textShadow: "1px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            The Cabin
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
