# AutoVerse - Virtual Car Showroom

A simple, educational web application that integrates real-time weather data, exchange rate information, and dealer location services. Built with a simplified architecture for learning purposes.

## Project Overview

This project demonstrates a simple integration of third-party APIs with a clean, minimal design. The application provides:

- Real-time Weather Data: Current weather conditions for selected cities
- Exchange Rate Information: Real-time currency exchange rates
- Dealer Locator: Find up to 5 nearby car dealerships based on location

## Features

### Core API Integration
1. Weather API (OpenWeather) - Required
   - Server-side integration
   - Returns temperature, weather description, coordinates, feels-like temperature, wind speed, country code, and rain volume
   - Search by city name or coordinates

2. Exchange Rate API (ExchangeRate-API.com)
   - Real-time currency exchange rates for multiple currencies
   - Supports major currencies (USD, EUR, GBP, JPY, CAD, AUD, etc.)
   - View latest rates for selected base currency

3. Dealer Locator API (2GIS)
   - Locate up to 5 nearby car dealerships by coordinates
   - Returns dealership name, address, and distance
   - List view only (no map)

## Architecture

### Simplified Structure
All backend code is consolidated in a single file for simplicity:

```
server.js          # All backend code (services, routes, controllers)
frontend/
├── index.html     # Main HTML file
├── styles.css     # Minimal styling
└── app.js         # Client-side JavaScript
```

This simplified architecture is ideal for educational projects and makes the codebase easier to understand and maintain.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- API keys for:
  - OpenWeather API (required)
  - ExchangeRate API (optional)
  - 2GIS API (optional, for dealer locator)

### Installation

1. Clone or navigate to the project directory
   ```bash
   cd "AutoVerse Project"
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   
   Create a `.env` file in the root directory:
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   EXCHANGERATE_API_KEY=your_exchangerate_api_key_here
   DEALER_API_KEY=your_2gis_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. Get API Keys
   
   - OpenWeather API: Sign up at [OpenWeatherMap](https://openweathermap.org/api) (Free tier available)
   - ExchangeRate API: Sign up at [ExchangeRate-API](https://www.exchangerate-api.com/) (Free tier available)
   - 2GIS API: Sign up at [2GIS Developer Portal](https://dev.2gis.com/) (Free tier available, primarily for CIS countries)

5. Start the server
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

6. Access the application
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Weather API

#### Get Weather by City
```
GET /api/weather/city?city=New York
```

Response:
```json
{
  "success": true,
  "data": {
    "temperature": 22,
    "description": "clear sky",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "feelsLike": 21,
    "windSpeed": 3.5,
    "countryCode": "US",
    "rainVolume": null,
    "city": "New York",
    "icon": "01d"
  }
}
```

#### Get Weather by Coordinates
```
GET /api/weather/coordinates?lat=40.7128&lon=-74.0060
```

### Exchange Rate API

#### Get Latest Exchange Rates
```
GET /api/exchange/latest?base=USD
```

Query Parameters:
- `base` (optional): Base currency code (default: USD). Examples: USD, EUR, GBP, JPY

Response:
```json
{
  "success": true,
  "data": {
    "baseCurrency": "USD",
    "date": "2024-01-15T10:30:00Z",
    "rates": {
      "EUR": 0.92,
      "GBP": 0.79,
      "JPY": 149.50,
      "CAD": 1.35,
      "AUD": 1.52
    },
    "source": "exchangerate-api.com"
  }
}
```

### Dealer Locator API

#### Get Dealers by Coordinates
```
GET /api/dealers/coordinates?lat=40.7128&lon=-74.0060&radius=10
```

Query Parameters:
- `lat` (required): Latitude
- `lon` (required): Longitude
- `radius` (optional): Search radius in km (default: 10)

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "Premium Auto Center",
      "address": "1234 Main Street",
      "distance": "2.5",
      "coordinates": {
        "latitude": 40.7150,
        "longitude": -74.0080
      },
      "workingHours": {
        "monday": "9:00 AM - 7:00 PM"
      },
      "id": "123456"
    }
  ],
  "count": 1
}
```

Note: Returns up to 5 dealerships sorted by distance. Only shows dealerships related to cars/autos.

### Health Check
```
GET /api/health
```

## Design

### Minimalist Approach
- Ultra-simplified design - No gradients, complex shadows, or animations
- Clean, flat design with basic borders and simple colors
- Fast loading and minimal CSS (~250 lines)
- Responsive layout for mobile and desktop
- Simple blue color scheme (#2563eb)

### User Experience
- Simple, intuitive interface
- Loading states for async operations
- Clear error messages
- List view for dealer locations (no map)

## Security Considerations

- API keys stored in environment variables (never committed to version control)
- CORS enabled for cross-origin requests
- Input validation on all API endpoints
- Error messages don't expose sensitive information
- Server-side validation of all user inputs

## Dependencies

### Production Dependencies
- express: Web framework for Node.js
- axios: HTTP client for API requests
- cors: Cross-Origin Resource Sharing middleware
- dotenv: Environment variable management

### Development Dependencies
- nodemon: Auto-restart server during development

## Testing

### Manual Testing
1. Start the server: `npm start`
2. Open browser: `http://localhost:3000`
3. Test weather API with different cities or use your location
4. Check exchange rates for different base currencies
5. Find up to 5 nearby dealers using your location (requires 2GIS API key)

### API Testing (curl)
```bash
# Weather by city
curl "http://localhost:3000/api/weather/city?city=London"

# Exchange rates
curl "http://localhost:3000/api/exchange/latest?base=USD"

# Dealers by coordinates
curl "http://localhost:3000/api/dealers/coordinates?lat=40.7128&lon=-74.0060"
```

## License

MIT License - feel free to use this project for learning and development purposes.

## Author

AutoVerse Project

## Acknowledgments

- OpenWeatherMap for weather data API
- ExchangeRate-API for currency data
- 2GIS for dealer location data
- Font Awesome for icons
- Express.js community for excellent documentation

---

Note: This project is designed for educational purposes. The simplified architecture (all backend code in one file) and minimal design make it easy to understand and modify for learning web development concepts.

## Recent Changes

- Simplified Architecture: All backend code consolidated into `server.js` (removed separate routes/controllers/services folders)
- Simplified Map Implementation: Removed map functionality completely, dealers now shown in list view only
- Minimal Design: Removed complex CSS, gradients, animations - now ultra-simple and fast
- Removed Features: Currency converter removed for simplicity
- Dealer Info: Simplified to show only name, address, and distance (removed phone and working hours)
- Limited Results: Dealer search now returns maximum 5 results
