import { ReactNode, useEffect, useState } from "react";

interface DeviceFrameProps {
  children: ReactNode;
}

/**
 * Full-app iPhone 17 Pro Max device frame.
 * - Logical screen: 440 × 956 pt (6.9" display)
 * - Natural titanium body, thin uniform black bezel, Dynamic Island,
 *   side hardware (Action button, Volume, Power, Camera Control),
 *   and a true-to-iOS home indicator pill.
 *
 * The frame auto-scales to any viewport. On real phone-sized viewports
 * (<600px) it disappears so the app fills the screen.
 */
export const DeviceFrame = ({ children }: DeviceFrameProps) => {
  // Outer device dimensions (titanium edge included)
  const OUTER_W = 462;
  const OUTER_H = 978;
  // Inner display in logical points
  const SCREEN_W = 440;
  const SCREEN_H = 956;

  const [scale, setScale] = useState(1);
  const [showFrame, setShowFrame] = useState(true);

  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const phoneSized = vw < 600;
      setShowFrame(!phoneSized);
      if (!phoneSized) {
        const padding = 32;
        const s = Math.min(
          (vw - padding) / OUTER_W,
          (vh - padding) / OUTER_H
        );
        setScale(Math.min(1, s));
      }
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  if (!showFrame) {
    return <>{children}</>;
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden items-center justify-center flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, hsl(150 60% 8%) 0%, hsl(0 0% 3%) 60%, hsl(0 0% 1%) 100%)",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div className="relative" style={{ width: OUTER_W, height: OUTER_H }}>
          {/* Titanium outer rail (natural titanium, brushed) */}
          <div
            className="absolute inset-0 rounded-[60px]"
            style={{
              background:
                "linear-gradient(135deg, #5a5550 0%, #8a847a 12%, #4a4641 28%, #9a9388 44%, #3e3a36 60%, #807a70 78%, #4a4540 100%)",
              padding: 2,
              boxShadow:
                "0 60px 140px -30px rgba(0,0,0,0.85), 0 25px 50px -15px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.4)",
            }}
          >
            {/* Thin uniform black bezel (matches real iPhone — same on all sides) */}
            <div
              className="w-full h-full rounded-[58px]"
              style={{
                background: "#000",
                padding: 9,
              }}
            >
              {/* Screen */}
              <div
                className="relative rounded-[50px] overflow-hidden bg-background mx-auto"
                style={{ width: SCREEN_W, height: SCREEN_H }}
              >
                {/* Dynamic Island */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-50 rounded-full bg-black"
                  style={{ top: 13, width: 126, height: 37 }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      right: 11,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 9,
                      height: 9,
                      background:
                        "radial-gradient(circle at 30% 30%, #1a3a5a, #050a14)",
                      boxShadow: "inset 0 0 2px rgba(60,140,255,0.3)",
                    }}
                  />
                </div>

                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 pt-4 pointer-events-none">
                  <span className="font-body font-semibold text-foreground text-[16px] tabular-nums">
                    9:41
                  </span>
                  <div className="flex items-center gap-[6px] text-foreground">
                    {/* Signal bars */}
                    <svg width="18" height="12" viewBox="0 0 17 11" fill="currentColor" aria-label="Señal">
                      <rect x="0" y="7" width="3" height="4" rx="0.5" />
                      <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                      <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                      <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                    </svg>
                    {/* Wi-Fi icon */}
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-label="Wi-Fi">
                      <path d="M8 11.2a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z" />
                      <path d="M3.95 6.95a.6.6 0 0 1 0-.85 5.72 5.72 0 0 1 8.1 0 .6.6 0 1 1-.85.85 4.52 4.52 0 0 0-6.4 0 .6.6 0 0 1-.85 0Z" />
                      <path d="M1.65 4.65a.6.6 0 0 1 0-.85 8.98 8.98 0 0 1 12.7 0 .6.6 0 1 1-.85.85 7.78 7.78 0 0 0-11 0 .6.6 0 0 1-.85 0Z" />
                    </svg>
                    {/* Battery */}
                    <div className="relative ml-1 flex items-center" aria-label="Batería">
                      <div
                        className="rounded-[3px] border"
                        style={{
                          width: 26,
                          height: 12,
                          borderColor: "currentColor",
                          opacity: 0.6,
                        }}
                      >
                        <div
                          className="m-[1.5px] rounded-[1.5px] bg-current"
                          style={{ width: 21, height: 7 }}
                        />
                      </div>
                      <div
                        className="bg-current rounded-r-sm"
                        style={{ width: 1.5, height: 5, marginLeft: 1, opacity: 0.6 }}
                      />
                    </div>
                  </div>
                </div>

                {/* App content (scrollable inside the screen) */}
                <div className="absolute inset-0 overflow-y-auto no-scrollbar">
                  {children}
                </div>

                {/* Bottom safe area — keeps app UI clear of the home indicator */}
                <div
                  className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none"
                  style={{
                    height: 34,
                    background:
                      "linear-gradient(to top, hsl(var(--background)) 40%, hsl(var(--background) / 0) 100%)",
                  }}
                />

                {/* Home indicator — true iOS pill */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-50 rounded-full bg-foreground"
                  style={{ bottom: 8, width: 134, height: 5, opacity: 0.92 }}
                />
              </div>
            </div>
          </div>

          {/* Side hardware buttons — iPhone 17 Pro Max */}
          {/* Left: Action button + Volume Up + Volume Down */}
          <div
            className="absolute -left-[2px] top-[128px] w-[2px] h-[32px] rounded-l-sm"
            style={{ background: "linear-gradient(to right, #2a2826, #4a4641)" }}
          />
          <div
            className="absolute -left-[2px] top-[200px] w-[2px] h-[66px] rounded-l-sm"
            style={{ background: "linear-gradient(to right, #2a2826, #4a4641)" }}
          />
          <div
            className="absolute -left-[2px] top-[290px] w-[2px] h-[66px] rounded-l-sm"
            style={{ background: "linear-gradient(to right, #2a2826, #4a4641)" }}
          />
          {/* Right: Power + Camera Control */}
          <div
            className="absolute -right-[2px] top-[230px] w-[2px] h-[110px] rounded-r-sm"
            style={{ background: "linear-gradient(to left, #2a2826, #4a4641)" }}
          />
          <div
            className="absolute -right-[2px] top-[388px] w-[2px] h-[42px] rounded-r-sm"
            style={{ background: "linear-gradient(to left, #2a2826, #4a4641)" }}
          />
        </div>
      </div>
    </div>
  );
};
