# SafeRide Frontend

**📱 Frontend Documentation** | [📦 Backend README](../saferide_api/README.md) | [📋 Project Status](../PROJECT_STATUS.md)

---

Frontend application for SafeRide API - a carpooling/ridesharing system with real-time participant tracking.

## Technologies

- **React 18** - UI library
- **TypeScript** - type safety
- **Vite** - bundler and dev server
- **React Router** - routing
- **Axios** - HTTP client
- **Tailwind CSS** - styling
- **date-fns** - date handling
- **@react-google-maps/api** - Google Maps integration

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/).

## Running

### Development mode
```bash
npm run dev
```

Application will start at http://localhost:3000 (or next available port)

### Production build
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/
│   ├── client.ts      # API client methods
│   └── types.ts       # TypeScript interfaces
├── components/
│   └── ParticipantsMap.tsx  # Google Maps component
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── pages/
│   ├── Dashboard.tsx        # Main dashboard with rides
│   ├── RideDetails.tsx      # Ride info + participants map
│   ├── CreateRide.tsx       # Create new ride
│   ├── EditRide.tsx         # Edit existing ride
│   ├── Login.tsx            # Login page
│   └── Register.tsx         # Registration page
├── App.tsx       # Main component with routing
└── main.tsx      # Entry point
```

## API

Frontend works with backend through proxy at `/api/*`, which redirects to `http://localhost:8000`.

Make sure backend is running on port 8000.

## Features

### Authentication
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Protected routes

### Rides Management
- ✅ Create rides with title, description, and start time
- ✅ Edit own rides (title, description, start time, active status)
- ✅ Delete own rides
- ✅ View all available rides
- ✅ Filter rides by participation status

### Participation
- ✅ Join rides by code
- ✅ Leave rides
- ✅ Update geolocation in real-time
- ✅ View all ride participants
- ✅ Participant count display on dashboard cards

### Map Visualization 🗺️
- ✅ **Live Tracking**: Integrates `@react-google-maps/api` to show all ride participants in real-time.
- ✅ **Socket.IO Integration**: Instant marker updates without page refresh.
- ✅ **Smart Clustering**: Markers update positions smoothly given Socket events.
- ✅ **Optimized for React 18**: Uses `MarkerF` for stable rendering.

### Development Tools (Simulation) 🛠️
To facilitate testing without moving physically:
- **Simulate Move**: A button on the Ride Details page to "teleport" your marker to a random location near Munich or the group center.
- **Gather All**: A powerful debug tool that moves *all* participants to your current location (simulating a group meetup).
- **Default Location**: Map defaults to Munich (48.13, 11.58) if no GPS data is present.

### UI/UX 🎨
- ✅ Modern design with Tailwind CSS
- ✅ Responsive layout with rounded-xl cards
- ✅ Clean blue/purple color scheme
- ✅ Dashboard with three sections: My Rides, Participating In, Available Rides
- ✅ Active "Pulse" indicators for live users
