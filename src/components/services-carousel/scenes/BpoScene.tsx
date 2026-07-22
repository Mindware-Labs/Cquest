"use client";

/* BPO's throughput field: a marching lattice frames the reading column while
   data streams run in safe bands at the very top and bottom — volume made
   visible, never across the text. */
export default function BpoScene() {
  return (
    <>
      {/* Volume, ordered: the marching lattice frames the field (its
          mask keeps the whole reading column dot-free). */}
      <div className="cq-v2-lattice" />
      {/* Data streams confined to safe bands at the very top and
          bottom — throughput made visible, never across the text. */}
      <span className="cq-v2-stream top-[7%]" />
      <span
        className="cq-v2-stream top-[13%]"
        style={{ animationDelay: "-7s", animationDuration: "15s" }}
      />
      <span
        className="cq-v2-stream top-[84%]"
        style={{ animationDelay: "-3s", animationDuration: "10s" }}
      />
      <span
        className="cq-v2-stream top-[89%]"
        style={{ animationDelay: "-9s", animationDuration: "13s" }}
      />
      <span
        className="cq-v2-orb left-[-10rem] bottom-[-10rem] h-[30rem] w-[30rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc) 26%, transparent)",
          animation: "cq-float-c 23s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        }}
      />
      <span
        className="cq-v2-orb right-[-8rem] top-[-9rem] h-[26rem] w-[26rem]"
        style={{
          backgroundColor: "color-mix(in srgb, var(--svc-glow) 18%, transparent)",
          animation: "cq-float-a 26s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse",
        }}
      />
    </>
  );
}
