import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

const ANTON = path.join(process.cwd(), "public", "fonts", "Anton-Regular.ttf");

export async function GET() {
  const anton = fs.readFileSync(ANTON);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#030f08",
          color: "#effbf2",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* glows */}
        <div
          style={{
            position: "absolute",
            left: "-10%",
            top: "-35%",
            width: "70%",
            height: "120%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, rgba(52,211,153,0) 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-15%",
            bottom: "-40%",
            width: "75%",
            height: "120%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,197,66,0.28) 0%, rgba(245,197,66,0) 65%)",
          }}
        />
        {/* dotted grid */}
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, display: "flex", flexWrap: "wrap" }}>
          {Array.from({ length: 240 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 50,
                height: 50,
                opacity: i % 7 === 0 ? 0.5 : 0,
                background: "#34d399",
                borderRadius: "50%",
              }}
            />
          ))}
        </div>

        {/* left column */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 90,
            paddingRight: 90,
            width: "62%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 999,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 22,
              paddingRight: 22,
              marginBottom: 34,
              fontSize: 22,
              letterSpacing: 6,
              color: "#a7f3d0",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 18px #34d399",
              }}
            />
            HH GOA 2026 · IDENTITY SYSTEM
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Anton",
              fontSize: 150,
              lineHeight: 1.02,
              letterSpacing: 2,
            }}
          >
            <span>HH GOA</span>
            <span style={{ color: "#34d399" }}>2026</span>
          </div>

          <div
            style={{
              marginTop: 30,
              fontSize: 30,
              letterSpacing: 10,
              fontWeight: 700,
              color: "#effbf2",
              opacity: 0.92,
            }}
          >
            BUILD YOUR IDENTITY.
          </div>

          <div style={{ marginTop: 26, fontSize: 21, letterSpacing: 3, color: "#8fb5a0" }}>
            UPLOAD · CUSTOMIZE · GENERATE · SHARE — #FRAMEINGOA
          </div>
        </div>

        {/* right: card mock */}
        <div
          style={{
            width: "38%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 330,
              height: 470,
              borderRadius: 34,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "linear-gradient(165deg, #0a2214 0%, #07170e 100%)",
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8), 0 0 80px -30px rgba(52,211,153,0.8)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 30,
              paddingBottom: 30,
              paddingLeft: 26,
              paddingRight: 26,
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 14,
                letterSpacing: 3,
                color: "#8fb5a0",
              }}
            >
              <span>HH GOA 2026</span>
              <span>ID — 001</span>
            </div>

            <div
              style={{
                marginTop: 26,
                width: 270,
                height: 190,
                borderRadius: 18,
                background: "linear-gradient(135deg, #86efac 0%, #34d399 50%, #2dd4bf 100%)",
                paddingTop: 3,
                paddingBottom: 3,
                paddingLeft: 3,
                paddingRight: 3,
                display: "flex",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 15,
                  background: "linear-gradient(200deg, #12351f 0%, #0a2013 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: "#1c5c39",
                    border: "3px solid #34d399",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ width: "85%", height: 38, borderRadius: 6, background: "#ecfbf1" }} />
              <div style={{ width: "58%", height: 16, borderRadius: 4, background: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "70%", height: 20, borderRadius: 4, background: "#34d399", marginTop: 8 }} />
            </div>

            <div
              style={{
                marginTop: "auto",
                width: "100%",
                paddingTop: 18,
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 13,
                letterSpacing: 3,
                color: "#5f7a69",
              }}
            >
              <span>GOA / 2026</span>
              <span>#FRAMEINGOA</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Anton", data: anton, weight: 400 }],
    },
  );
}
