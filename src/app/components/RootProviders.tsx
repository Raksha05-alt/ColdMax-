import { Outlet } from "react-router";
import { RequestProvider } from "../context/RequestContext";
import { LocationProvider } from "../context/LocationContext";
import { BookingProvider } from "../context/BookingContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { UnitsProvider } from "../context/UnitsContext";

export default function RootProviders() {
  return (
    <UnitsProvider>
      <SubscriptionProvider>
        <RequestProvider>
          <LocationProvider>
            <BookingProvider>
              <Outlet />
            </BookingProvider>
          </LocationProvider>
        </RequestProvider>
      </SubscriptionProvider>
    </UnitsProvider>
  );
}
