/**
 * Test data utilities for Cold Max app
 * Use these to test real-time synchronization between customer and technician sides
 */

export const clearAllRequests = () => {
  localStorage.removeItem("coldmax_service_requests");
  window.location.reload();
};

export const addSampleRequest = () => {
  const request = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerId: "cust_002",
    customerName: "John Tan",
    location: "45 Marina Bay St",
    issue: "Filter Replacement",
    issueType: "filter_replacement",
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    distance: "5.1 km",
    payout: "$45",
    priority: "normal" as const,
    status: "pending" as const,
    createdAt: Date.now(),
  };

  const stored = localStorage.getItem("coldmax_service_requests");
  const requests = stored ? JSON.parse(stored) : [];
  requests.unshift(request);
  localStorage.setItem("coldmax_service_requests", JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent("requests-updated", { detail: requests }));
};

// Expose to window for easy testing in browser console
if (typeof window !== "undefined") {
  (window as any).coldMaxTestUtils = {
    clearAllRequests,
    addSampleRequest,
  };
}
