# Place Finder

A production-ready full-stack web application for discovering places using Google Maps Platform. Search hospitals, parks, restaurants, hotels, and more — view results on an interactive map with directions, filters, favorites, and search history.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, React Router, Axios, Lucide Icons |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Auth | JWT (Bearer token + HTTP-only cookie) |
| Maps | Google Maps JavaScript API, Places API, Geocoding API, Directions API |

## Project Structure

```
finder/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB schemas (User, Favorite, SearchHistory)
│   ├── routes/          # REST API routes
│   ├── utils/           # JWT helpers
│   ├── server.js        # Express entry point
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth & theme providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API & Google Maps services
│   │   ├── utils/       # Helper functions
│   │   └── constants/   # App constants
│   └── .env.example
└── README.md
```

## Features

- Search places by keyword and location
- Browser geolocation for current position
- Interactive Google Map with place markers
- Place details: name, address, rating, photos, phone, website, hours
- Get Directions with distance and travel time
- Filters: distance, rating, Open Now, category
- Google Places Autocomplete for location input
- Save favorites (requires login)
- Recent search history (requires login)
- Light/dark mode toggle
- Fully responsive design

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Google Cloud Project** with these APIs enabled:
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Directions API

## Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable the APIs listed above
3. Create an API key under **APIs & Services → Credentials**
4. Restrict the key (recommended):
   - Application restrictions: HTTP referrers (`http://localhost:5173/*`)
   - API restrictions: Maps JavaScript API, Places API, Geocoding API, Directions API

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your Google Maps API key
```

### 2. Configure environment variables

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/place-finder
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env**
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Ensure MongoDB is running locally, or update `MONGODB_URI` to your Atlas connection string.

### 4. Run the application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user (protected) |

### Favorites (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | List all favorites |
| POST | `/api/favorites` | Add favorite |
| GET | `/api/favorites/check/:placeId` | Check if favorited |
| DELETE | `/api/favorites/:placeId` | Remove favorite |

### Search History (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get recent searches |
| POST | `/api/history` | Save search |
| DELETE | `/api/history` | Clear all history |
| DELETE | `/api/history/:id` | Delete one entry |

## Production Build

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend
cd backend
npm start
```

For production, set `NODE_ENV=production`, use strong `JWT_SECRET`, enable HTTPS, and restrict your Google API key to your domain.

## License

MIT
