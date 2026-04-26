import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * iPhone 17 Pro Max mockup frame.
 * Inner screen is 440 × 956 (logical points), titanium body with Dynamic Island.
 */
export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  // Outer device dimensions (screen + bezels + frame)
  const OUTER_W = 472;
  const OUTER_H = 990;
  const SCREEN_W = 440;
  const SCREEN_H = 956;

  return (
    <div className="relative" style={{ width: OUTER_W, height: OUTER_H }}>
      {/* Titanium outer frame (Pro Max — slightly warmer titanium) */}
      <div
        className="absolute inset-0 rounded-[68px] device-shadow"
        style={{
          background:
            "linear-gradient(145deg, #2e2d2b 0%, #58544f 22%, #1c1b19 48%, #6a655e 76%, #2e2d2b 100%)",
          padding: 4,
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
            {/* Dynamic Island (slightly larger on Pro Max) */}
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
                {/* Signal */}
                <svg width="18" height="12" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="7" width="3" height="4" rx="0.5" />
                  <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                  <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                  <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                </svg>
                {/* 5G */}
                <span className="font-body font-semibold text-[12px] leading-none">5G</span>
                {/* Battery */}
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

            {/* Scrollable content */}
            <div className="absolute inset-0 overflow-y-auto no-scrollbar">
              {children}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 rounded-full bg-foreground/90"
              style={{ width: 144, height: 5 }}
            />
          </div>
        </div>
      </div>

      {/* Side buttons — iPhone 17 Pro Max layout (Action btn + Volume / Power + Camera Control) */}
      {/* Left side */}
      <div className="absolute -left-[3px] top-[130px] w-[3px] h-[34px] rounded-l-sm bg-[#2a2a2c]" />
      <div className="absolute -left-[3px] top-[200px] w-[3px] h-[68px] rounded-l-sm bg-[#3a3a3c]" />
      <div className="absolute -left-[3px] top-[290px] w-[3px] h-[68px] rounded-l-sm bg-[#3a3a3c]" />
      {/* Right side: power + camera control */}
      <div className="absolute -right-[3px] top-[230px] w-[3px] h-[110px] rounded-r-sm bg-[#3a3a3c]" />
      <div className="absolute -right-[3px] top-[380px] w-[3px] h-[44px] rounded-r-sm bg-[#3a3a3c]" />
    </div>
  );
};
