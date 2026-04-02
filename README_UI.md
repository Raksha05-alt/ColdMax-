# ColdMax — Frontend Documentation

This is the mobile-first React application for the **ColdMax** ecosystem. It provides the user interface for both **Customers** (to book and monitor aircon services) and **Technicians** (to manage jobs and earnings).

## Tech Stack

- **Core**: React 18, Vite 6
- **Routing**: React Router 7
- **Styling**: Tailwind CSS 4, Lucide Icons, Framer Motion (for animations)
- **UI Components**: Radix UI (accessible primitives)

---

## Project Structure

```bash
src/
├── app/
│   ├── components/      # UI components (Layout, UI primitives, Figma-exported assets)
│   ├── context/         # React Context API for global state management
│   ├── data/            # Static data and mock assets
│   ├── pages/           # Page components (Customer/Technician specific views)
│   ├── utils/           # Helper functions, service integration (AI matching, health scoring)
│   ├── App.tsx          # Main entry point for the React application
│   └── routes.tsx       # Route definitions for both user roles
├── styles/              # Global CSS and Tailwind configuration
└── main.tsx             # ReactDOM rendering
```

---

## State Management & Synchronization

The application uses the **React Context API** (`src/app/context/`) to manage state across different pages. This ensures that:
- **Booking Progress**: A customer can track their job from "Searching" to "Arriving" without losing data on navigation.
- **Technician Earnings**: The dashboard displays real-time updates for "Today's Earnings" and "Jobs Completed" after a job successfully finishes.
- **Quotation Sync**: If a technician sends an additional quote for repairs, the customer receives the exact amount in real-time on their tracking page.

---

## User Flows

### 👤 Customer Flow
1. **Role Selection**: Enter the app as a customer.
2. **Dashboard**: View aircon units and their current health scores (via ML predictions).
3. **Booking**: Choose a service (Servicing, Chemical Wash, etc.) and pick a date.
4. **Urgent Request**: If a repair is needed, the **AI Technician Matching** system helps find the best-fit pro.
5. **Live Tracking**: Monitor the technician's ETA and status once the job is accepted.

### 🛠️ Technician Flow
1. **Role Selection**: Enter the app as a technician and pick a type (Full-time or Freelance).
2. **Dashboard**: View "Today's Earnings," completed jobs, and currently accepted tasks.
3. **Job View**: Review details of a new service request and accept it.
4. **Completion Flow**: Once at the location, submit work photos, confirm payment method, and complete the job.

---

## Getting Started

### Development
To run the frontend locally:
```bash
npm install
npm run dev
```

### Build
To create a production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

---

## AI Features Integration

- **Health Scoring**: Connects to the FastAPI backend to predict AC health based on temperature, humidity, and vibration sensor data.
- **Technician Matching**: Recommends the best technician based on skill sets and distance using a Random Forest model.
- **Diagnostics**: Displays GPT-powered insights regarding unit health and maintenance needs.
