export function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="orb animate-float"
        style={{
          top: "-10%",
          left: "5%",
          width: "480px",
          height: "480px",
          background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)",
        }}
      />
      <div
        className="orb animate-float"
        style={{
          top: "20%",
          right: "-5%",
          width: "520px",
          height: "520px",
          background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div
        className="orb animate-pulse-glow"
        style={{
          bottom: "-15%",
          left: "30%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)",
        }}
      />
    </div>
  );
}
