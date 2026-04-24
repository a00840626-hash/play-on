import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * iPhone 15 Pro mockup frame.
 * Inner screen is 393 × 852, scaled down for typical viewports.
 */
export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  return (
    <div className="relative" style={{ width: 421, height: 880 }}>
      {/* Titanium outer frame */}
      <div
        className="absolute inset-0 rounded-[60px] device-shadow"
        style={{
          background:
            "linear-gradient(145deg, #2a2a2c 0%, #4a4a4d 25%, #1a1a1c 50%, #5a5a5d 75%, #2a2a2c 100%)",
          padding: 4,
        }}
      >
        {/* Inner bezel */}
        <div
          className="w-full h-full rounded-[58px]"
          style={{
            background: "linear-gradient(145deg, #0a0a0a, #1a1a1a)",
            padding: 10,
          }}
        >
          {/* Screen */}
          <div
            className="relative w-full h-full rounded-[50px] overflow-hidden bg-background"
            style={{ width: 393, height: 852 }}
          >
            {/* Dynamic Island */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-50 rounded-full bg-black"
              style={{ top: 11, width: 124, height: 36 }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 8,
                  height: 8,
                  background:
                    "radial-gradient(circle at 30% 30%, #1a3a5a, #050a14)",
                  boxShadow: "inset 0 0 2px rgba(60,140,255,0.3)",
                }}
              />
            </div>

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-7 pt-3 pointer-events-none">
              <span className="font-body font-semibold text-foreground text-[15px] tabular-nums">
                9:41
              </span>
              <div className="flex items-center gap-1.5 text-foreground">
                {/* Signal */}
                <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
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
                      width: 24,
                      height: 11,
                      borderColor: "currentColor",
                      opacity: 0.55,
                    }}
                  >
                    <div
                      className="m-[1.5px] rounded-[1.5px] bg-current"
                      style={{ width: 18, height: 6 }}
                    />
                  </div>
                  <div
                    className="bg-current rounded-r-sm"
                    style={{ width: 1.5, height: 4, marginLeft: 1, opacity: 0.55 }}
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
              style={{ width: 134, height: 5 }}
            />
          </div>
        </div>
      </div>

      {/* Side buttons */}
      <div className="absolute -left-[3px] top-[120px] w-[3px] h-[32px] rounded-l-sm bg-[#2a2a2c]" />
      <div className="absolute -left-[3px] top-[180px] w-[3px] h-[60px] rounded-l-sm bg-[#3a3a3c]" />
      <div className="absolute -left-[3px] top-[260px] w-[3px] h-[60px] rounded-l-sm bg-[#3a3a3c]" />
      <div className="absolute -right-[3px] top-[200px] w-[3px] h-[100px] rounded-r-sm bg-[#3a3a3c]" />
    </div>
  );
};
