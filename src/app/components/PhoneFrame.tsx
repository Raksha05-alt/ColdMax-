import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  showStatusBar?: boolean;
  showNotch?: boolean;
  time?: string;
  batteryLevel?: number;
}

export function PhoneFrame({
  children,
  showStatusBar = true,
  showNotch = true,
  time = "9:41",
  batteryLevel = 100,
}: PhoneFrameProps) {
  return (
    <div className="relative w-full h-full">
      {/* Status Bar */}
      {showStatusBar && (
        <div className="absolute top-0 left-0 right-0 z-[9998] bg-gradient-to-b from-black/20 to-transparent px-6 pt-2 pb-8 pointer-events-none">
          <div className="flex items-center justify-between text-white text-xs font-semibold drop-shadow-sm">
            <span>{time}</span>
            <div className="flex items-center gap-1.5">
              {/* Signal strength */}
              <div className="flex gap-0.5 items-end">
                <div className="w-0.5 h-1.5 bg-white rounded-full" />
                <div className="w-0.5 h-2 bg-white rounded-full" />
                <div className="w-0.5 h-2.5 bg-white rounded-full" />
                <div className="w-0.5 h-3 bg-white rounded-full" />
              </div>
              {/* WiFi */}
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
              </svg>
              {/* Battery */}
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">{batteryLevel}%</span>
                <div className="w-5 h-2.5 border border-white rounded-sm relative">
                  <div
                    className="absolute inset-0.5 bg-white rounded-sm"
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
                <div className="w-0.5 h-1 bg-white rounded-r-sm" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Island / Notch */}
      {showNotch && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-[9999] w-32 h-8 bg-black rounded-b-[20px] pointer-events-none shadow-lg">
          {/* Camera and sensors */}
          <div className="flex items-center justify-center gap-3 h-full px-4">
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <div className="w-2 h-2 bg-slate-900 rounded-full" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full h-full">{children}</div>
    </div>
  );
}

// Alternative: Minimal status bar overlay (for lighter touch)
export function StatusBarOverlay({ time = "9:41" }: { time?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] bg-black/0 px-6 pt-2 pb-1 pointer-events-none">
      <div className="flex items-center justify-between text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <span>{time}</span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5 items-end">
            <div className="w-0.5 h-1.5 bg-white rounded-full" />
            <div className="w-0.5 h-2 bg-white rounded-full" />
            <div className="w-0.5 h-2.5 bg-white rounded-full" />
            <div className="w-0.5 h-3 bg-white rounded-full" />
          </div>
          <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
