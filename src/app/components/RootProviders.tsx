import { Outlet } from "react-router";
import { RequestProvider } from "../context/RequestContext";
import { LocationProvider } from "../context/LocationContext";
import { BookingProvider } from "../context/BookingContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";

export default function RootProviders() {
  return (
    <SubscriptionProvider>
      <RequestProvider>
        <LocationProvider>
          <BookingProvider>
            <Outlet />
          </BookingProvider>
        </LocationProvider>
      </RequestProvider>
    </SubscriptionProvider>
  );
}
