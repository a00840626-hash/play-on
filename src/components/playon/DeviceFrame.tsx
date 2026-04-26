import { ReactNode, useEffect, useState } from "react";

interface DeviceFrameProps {
  children: ReactNode;
}

/**
 * Full-app iPhone 17 Pro Max device frame.
 * - Logical screen: 440 × 956 pt (6.9" display)
 * - Physical reference: 1320 × 2868 px @ 3x
 * - Titanium bezel, Dynamic Island, Camera Control button
 * - Auto-scales to fit any viewport while preserving aspect ratio.
 *
 * On very small viewports (typical phones in the wild) the frame is hidden
 * and content renders fullscreen so the app stays usable on real devices.
 */
export const DeviceFrame = ({ children }: DeviceFrameProps) => {
  const OUTER_W = 472;
  const OUTER_H = 990;
  const SCREEN_W = 440;
  const SCREEN_H = 956;

  const [scale, setScale] = useState(1);
  const [showFrame, setShowFrame] = useState(true);

  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // On real phone-sized viewports, skip the frame so the app fills the screen.
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
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
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
          {/* Titanium outer frame */}
          <div
            className="absolute inset-0 rounded-[68px] device-shadow"
            style={{
              background:
                "linear-gradient(145deg, #2e2d2b 0%, #58544f 22%, #1c1b19 48%, #6a655e 76%, #2e2d2b 100%)",
              padding: 4,
              boxShadow:
                "0 50px 120px -20px rgba(0,0,0,0.8), 0 20px 40px -10px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* Inner bezel */}
            <div
              className="w-full h-full rounded-[66px]"
              style={{
                background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
                padding: 12,
              }}
            >
              {/* Screen */}
              <div
                className="relative rounded-[54px] overflow-hidden bg-background mx-auto"
                style={{ width: SCREEN_W, height: SCREEN_H }}
              >
                {/* Dynamic Island */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-50 rounded-full bg-black"
                  style={{ top: 13, width: 132, height: 38 }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      right: 10,
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
                  <div className="flex items-center gap-1.5 text-foreground">
                    <svg width="18" height="12" viewBox="0 0 17 11" fill="currentColor">
                      <rect x="0" y="7" width="3" height="4" rx="0.5" />
                      <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                      <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                      <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                    </svg>
                    <span className="font-body font-semibold text-[12px] leading-none">5G</span>
                    <div className="relative ml-0.5 flex items-center">
                      <div
                        className="rounded-[3px] border"
                        style={{
                          width: 26,
                          height: 12,
                          borderColor: "currentColor",
                          opacity: 0.55,
                        }}
                      >
                        <div
                          className="m-[1.5px] rounded-[1.5px] bg-current"
                          style={{ width: 20, height: 7 }}
                        />
                      </div>
                      <div
                        className="bg-current rounded-r-sm"
                        style={{ width: 1.5, height: 5, marginLeft: 1, opacity: 0.55 }}
                      />
                    </div>
                  </div>
                </div>

                {/* App content (scrollable inside the screen) */}
                <div className="absolute inset-0 overflow-y-auto no-scrollbar">
                  {children}
                </div>

                {/* Home indicator */}
                <div
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 rounded-full bg-foreground/90"
                  style={{ width: 144, height: 5 }}
                />
              </div>
            </div>
          </div>

          {/* Side hardware buttons — iPhone 17 Pro Max */}
          {/* Left: Action button + Volume Up + Volume Down */}
          <div className="absolute -left-[3px] top-[130px] w-[3px] h-[34px] rounded-l-sm bg-[#2a2a2c]" />
          <div className="absolute -left-[3px] top-[200px] w-[3px] h-[68px] rounded-l-sm bg-[#3a3a3c]" />
          <div className="absolute -left-[3px] top-[290px] w-[3px] h-[68px] rounded-l-sm bg-[#3a3a3c]" />
          {/* Right: Power + Camera Control */}
          <div className="absolute -right-[3px] top-[230px] w-[3px] h-[110px] rounded-r-sm bg-[#3a3a3c]" />
          <div className="absolute -right-[3px] top-[380px] w-[3px] h-[44px] rounded-r-sm bg-[#3a3a3c]" />
        </div>
      </div>
    </div>
  );
};
