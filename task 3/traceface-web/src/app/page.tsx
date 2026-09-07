import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("@/components/ClientApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "#030806",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "linear-gradient(135deg, #34d399, #2dd4bf)",
            marginBottom: 24,
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            TF
          </span>
        </div>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            letterSpacing: "0.2em",
            color: "#34d399",
          }}
        >
          LOADING TRACEFACE...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <ClientApp />;
}
