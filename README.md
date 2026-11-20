# IoT Dashboard - Frontend

React frontend for the IoT Device Dashboard. Shows live sensor data, devices,
alerts, and historical charts. Built with Vite.

## Tech Stack

- React (with Vite)
- React Router for page navigation
- Axios for API calls
- socket.io-client for live updates
- Recharts for the charts

## Pages

- Login - login, register, and forgot password (all in one screen)
- Dashboard - overview of all devices with their live readings
- Devices - device list with search, filter, and add/edit/delete (admin only)
- Device Detail - live chart + gauge for one device, plus a compare-sensors chart
- Alerts - triggered alerts, with acknowledge / delete (admin only)
- Alert Rules - create and edit threshold rules (admin only)
- History - query past readings by date range and export them to CSV
- Settings - your profile and logout
- 404 - shown for any route that doesn't exist

## Folder structure

```
src/
├── api/            # axios instance + api calls (auth, devices, sensors, alerts)
├── components/
│   ├── DeviceTable.jsx  # the big device list table (used by the Devices page)
│   ├── charts/     # LineChart, GaugeChart
│   ├── cards/      # MetricCard, DeviceCard, AlertCard
│   ├── common/     # Button, Modal, Badge, Spinner, Skeleton, EmptyState
│   └── layout/     # Sidebar, PageWrapper
├── context/        # AuthContext (login state) + SocketContext (the socket)
├── hooks/          # useSocket, useDevices, useSensorStream
├── pages/          # one file per page
├── routes/         # AppRoutes + ProtectedRoute
└── App.jsx
```

## Setup

1. Install Node.js 20.19+ dependencies and create the local environment file:

   ```bash
   npm ci
   cp .env.example .env
   ```

2. Set the local API and Socket.IO URLs in `.env`:

   ```bash
   VITE_API_URL=http://localhost:5001/api
   VITE_SOCKET_URL=http://localhost:5001
   ```

Vite only exposes variables prefixed with `VITE_`. Never put credentials in frontend environment variables.

## How to run

Make sure the backend is running first (on port 5001), then start the frontend:

```
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Notes

- You have to be logged in to see anything except the login page (handled by ProtectedRoute).
- Admins can add / edit / delete things. Viewers can only look at the data.
- Live values only appear when the backend, the MQTT broker, and the simulator are all running.

## Build for production

```
npm run build
```

The output goes into the `dist/` folder.
