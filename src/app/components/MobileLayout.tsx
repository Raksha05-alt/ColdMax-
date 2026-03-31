import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, ThermometerSnowflake, History, User, Briefcase } from "lucide-react";
import { clsx } from "clsx";

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isCustomer = location.pathname.startsWith('/customer');
  const isTech = location.pathname.startsWith('/tech');
  const isLogin = location.pathname === '/' || location.pathname.startsWith('/login') || location.pathname.startsWith('/onboarding');

  const customerTabs = [
    { name: "Home", path: "/customer/home", icon: Home },
    { name: "My Units", path: "/customer/units", icon: ThermometerSnowflake },
    { name: "History", path: "/customer/history", icon: History },
    { name: "Profile", path: "/customer/profile", icon: User },
  ];

  const techTabs = [
    { name: "Dashboard", path: "/tech/dashboard", icon: Briefcase },
    { name: "History", path: "/tech/history", icon: History },
    { name: "Profile", path: "/tech/profile", icon: User },
  ];

  const activeTabs = isCustomer ? customerTabs : isTech ? techTabs : [];
  
  const hideTabBar = isLogin || ["/customer/urgent", "/customer/booking", "/customer/tracking", "/customer/upcoming", "/customer/subscriptions"].includes(location.pathname) || location.pathname.startsWith("/customer/health");

  const isCustomerHome = location.pathname === "/customer/home";

  const isDarkStatusBar = 
    location.pathname === "/" ||
    location.pathname.startsWith("/login/technician") ||
    location.pathname.startsWith("/customer/health") ||
    location.pathname === "/customer/home";

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="relative w-full max-w-[400px] h-screen sm:h-[850px] sm:max-h-[90vh] bg-white sm:rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-neutral-200/50 flex flex-col">
        {/* Fake Phone Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-transparent z-50 flex items-center justify-between px-6 pointer-events-none">
          <span className={clsx(
            "text-xs font-semibold",
            isDarkStatusBar ? "text-white" : "text-neutral-800"
          )}>9:41</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <div className={clsx("w-4 h-3 rounded-sm", isDarkStatusBar ? "bg-white" : "bg-neutral-800")} />
            <div className={clsx("w-3 h-3 rounded-full", isDarkStatusBar ? "bg-white" : "bg-neutral-800")} />
            <div className={clsx("w-5 h-2.5 border rounded-[2px]", isDarkStatusBar ? "bg-white border-white" : "bg-neutral-800 border-neutral-800")} />
          </div>
        </div>

        {/* Dynamic Island / Notch fake */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-full z-50 pointer-events-none" />

        {/* Main Content Area */}
        <div className={clsx(
          "flex-1 pt-14 relative z-10",
          hideTabBar ? "" : "pb-20",
          isCustomerHome ? "overflow-hidden bg-blue-700" : "overflow-y-auto overflow-x-hidden bg-slate-50"
        )} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className={clsx(
            "flex flex-col",
            isCustomerHome ? "h-full" : "min-h-full"
          )}>
            <Outlet />
          </div>
        </div>

        {/* Bottom Navigation */}
        {!hideTabBar && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-40 pt-2 pb-4 px-4 flex justify-around items-center">
            {activeTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center gap-1 cursor-pointer flex-1"
                >
                  <div className={clsx(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive ? "bg-blue-50" : "hover:bg-slate-100"
                  )}>
                    <Icon className={clsx(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-blue-600" : "text-slate-500"
                    )} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={clsx(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-blue-600" : "text-slate-500"
                  )}>
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
