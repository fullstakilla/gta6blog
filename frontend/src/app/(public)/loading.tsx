export default function PublicLoading() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.25em",
        color: "var(--color-accent)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-accent)",
            animation: "pulseDot 1.2s ease-in-out infinite",
          }}
        />
        ЗАГРУЖАЕМ…
      </span>
    </div>
  );
}
