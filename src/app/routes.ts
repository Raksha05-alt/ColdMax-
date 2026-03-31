import { createBrowserRouter } from "react-router";
import RootProviders from "./components/RootProviders";
import MobileLayout from "./components/MobileLayout";
import RoleSelection from "./pages/RoleSelection";
import CustomerLogin from "./pages/CustomerLogin";
import TechnicianLogin from "./pages/TechnicianLogin";
import Onboarding from "./pages/Onboarding";
import CustomerHome from "./pages/customer/Home";
import Units from "./pages/customer/Units";
import HealthMonitor from "./pages/customer/HealthMonitor";
import Booking from "./pages/customer/Booking";
import UrgentRequest from "./pages/customer/UrgentRequest";
import JobTracking from "./pages/customer/JobTracking";
import History from "./pages/customer/History";
import UpcomingSchedule from "./pages/customer/UpcomingSchedule";
import Profile from "./pages/customer/Profile";
import Subscriptions from "./pages/customer/Subscriptions";
import TechDashboard from "./pages/tech/Dashboard";
import TechProfile from "./pages/tech/TechProfile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootProviders,
    children: [
      {
        Component: MobileLayout,
        children: [
          { index: true, Component: RoleSelection },
          { path: "onboarding", Component: Onboarding },
          { path: "login/customer", Component: CustomerLogin },
          { path: "login/technician", Component: TechnicianLogin },
          { path: "customer/home", Component: CustomerHome },
          { path: "customer/units", Component: Units },
          { path: "customer/health", Component: HealthMonitor },
          { path: "customer/health/:unitId", Component: HealthMonitor },
          { path: "customer/booking", Component: Booking },
          { path: "customer/urgent", Component: UrgentRequest },
          { path: "customer/tracking", Component: JobTracking },
          { path: "customer/history", Component: History },
          { path: "customer/upcoming", Component: UpcomingSchedule },
          { path: "customer/profile", Component: Profile },
          { path: "customer/subscriptions", Component: Subscriptions },
          { path: "tech/dashboard", Component: TechDashboard },
          { path: "tech/history", Component: History },
          { path: "tech/profile", Component: TechProfile },
        ],
      },
    ],
  },
]);
