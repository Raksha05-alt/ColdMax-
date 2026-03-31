import { createBrowserRouter } from "react-router";
import MobileLayout from "./components/MobileLayout";
import RootProviders from "./components/RootProviders";
import RoleSelection from "./pages/RoleSelection";
import CustomerLogin from "./pages/CustomerLogin";
import TechnicianLogin from "./pages/TechnicianLogin";
import TechnicianTypeSelection from "./pages/TechnicianTypeSelection";
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
import SubscriptionGate from "./pages/customer/SubscriptionGate";
import TechDashboard from "./pages/tech/Dashboard";
import TechProfile from "./pages/tech/TechProfile";
import JobPhotoSubmission from "./pages/tech/JobPhotoSubmission";
import JobCompleteSuccess from "./pages/tech/JobCompleteSuccess";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootProviders />,
    children: [
      {
        element: <MobileLayout />,
        children: [
          { index: true, element: <RoleSelection /> },
          // { path: "onboarding", element: <Onboarding /> },
          { path: "login/customer", element: <CustomerLogin /> },
          { path: "login/technician", element: <TechnicianLogin /> },
          { path: "login/technician/type", element: <TechnicianTypeSelection /> },
          { path: "customer/home", element: <CustomerHome /> },
          { path: "customer/units", element: <Units /> },
          { path: "customer/health", element: <HealthMonitor /> },
          { path: "customer/health/:unitId", element: <HealthMonitor /> },
          { path: "customer/booking", element: <Booking /> },
          { path: "customer/urgent", element: <UrgentRequest /> },
          { path: "customer/tracking", element: <JobTracking /> },
          { path: "customer/history", element: <History /> },
          { path: "customer/upcoming", element: <UpcomingSchedule /> },
          { path: "customer/profile", element: <Profile /> },
          { path: "customer/subscriptions", element: <Subscriptions /> },
          { path: "customer/subscription-gate", element: <SubscriptionGate /> },
          { path: "tech/dashboard", element: <TechDashboard /> },
          { path: "tech/history", element: <History /> },
          { path: "tech/profile", element: <TechProfile /> },
          { path: "tech/job-photo-submission", element: <JobPhotoSubmission /> },
          { path: "tech/job-complete-success", element: <JobCompleteSuccess /> },
        ],
      },
    ],
  },
]);