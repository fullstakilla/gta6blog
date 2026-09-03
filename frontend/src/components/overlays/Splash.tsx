"use client";

interface SplashProps {
  lines: number;
}

export function Splash({ lines }: SplashProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 300ms ease-out",
      }}
    >
      <div
        style={{
          width: "min(520px, 84vw)",
          border: "1px solid rgba(212,255,0,0.25)",
          background: "#050505",
          padding: "28px 26px 30px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.25em",
            color: "var(--color-muted)",
            marginBottom: 18,
          }}
        >
          CRT TERMINAL · GTA6_BLOG
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 2.1,
            color: "var(--color-accent)",
            display: "grid",
          }}
        >
          {lines >= 1 && <span>&gt; BOOTING GTA6_BLOG...</span>}
          {lines >= 2 && <span>&gt; LOADING VICE CITY...</span>}
          {lines >= 3 && (
            <span>
              &gt; READY.
              <span
                style={{
                  animation: "caret 900ms step-end infinite",
                  marginLeft: 6,
                }}
              >
                _
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
