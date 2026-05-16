export default function NeuralNetworkBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Soft gradient orbs */}
      <div
        className="absolute -top-32 left-[8%] w-[520px] h-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,94,61,0.08) 0%, transparent 68%)" }}
      />
      <div
        className="absolute -top-16 right-[12%] w-[480px] h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(147,183,255,0.07) 0%, transparent 68%)" }}
      />
      <div
        className="absolute bottom-0 left-[40%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(147,183,255,0.04) 0%, transparent 68%)" }}
      />

      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(147,183,255,0.10)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Fade edges so content reads cleanly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6,9,26,0.55) 0%, rgba(6,9,26,0.1) 35%, rgba(6,9,26,0.1) 65%, rgba(6,9,26,0.85) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(6,9,26,0.5) 0%, transparent 20%, transparent 80%, rgba(6,9,26,0.5) 100%)",
        }}
      />
    </div>
  )
}
