require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));


// weather service
class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  }

  async getWeatherByCity(city) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      const rain = data.rain && data.rain['3h'] ? data.rain['3h'] : null;

      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        coordinates: {
          latitude: data.coord.lat,
          longitude: data.coord.lon
        },
        feelsLike: Math.round(data.main.feels_like),
        windSpeed: data.wind?.speed || 0,
        countryCode: data.sys.country,
        rainVolume: rain,
        city: data.name,
        icon: data.weather[0].icon
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  async getWeatherByCoordinates(lat, lon) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      const rain = data.rain && data.rain['3h'] ? data.rain['3h'] : null;

      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        coordinates: {
          latitude: data.coord.lat,
          longitude: data.coord.lon
        },
        feelsLike: Math.round(data.main.feels_like),
        windSpeed: data.wind?.speed || 0,
        countryCode: data.sys.country,
        rainVolume: rain,
        city: data.name,
        icon: data.weather[0].icon
      };
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }
}

//exchange rate service
class ExchangeRateService {
  constructor() {
    this.apiKey = process.env.EXCHANGERATE_API_KEY;
    this.baseUrl = 'https://v6.exchangerate-api.com/v6';
  }

  async getLatestRates(baseCurrency = 'USD') {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/latest/${baseCurrency}`);
      const data = response.data;

      return {
        baseCurrency: data.base_code || baseCurrency,
        date: data.time_last_update_utc || new Date().toISOString(),
        rates: data.conversion_rates || data.rates,
        source: 'exchangerate-api.com'
      };
    } catch (error) {
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
  }

  async convertCurrency(from, to, amount) {
    try {
      const response = await axios.get(`${this.baseUrl}/${this.apiKey}/pair/${from}/${to}/${amount}`);
      const data = response.data;

      return {
        from: from,
        to: to,
        amount: amount,
        convertedAmount: data.conversion_result || (amount * data.conversion_rate),
        rate: data.conversion_rate,
        date: data.time_last_update_utc || new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to convert currency: ${error.message}`);
    }
  }
}

//dealer service
class DealerService {
  constructor() {
    this.apiKey = process.env.DEALER_API_KEY || process.env.DGIS_API_KEY;
    this.baseUrl = 'https://catalog.api.2gis.com';
    this.searchUrl = `${this.baseUrl}/3.0/items`;
    this.geocodeUrl = `${this.baseUrl}/3.0/geo/search`;
  }

  async getDealersByCity(city) {
    try {
      const cityCoords = await this.geocodeCity(city);
      const dealers = await this.searchDealers(cityCoords.lat, cityCoords.lon, 10);
      return dealers || [];
    } catch (error) {
      throw new Error(`Failed to fetch dealers: ${error.message}`);
    }
  }

  async getDealersByCoordinates(lat, lon, radius = 10) {
    try {
      const dealers = await this.searchDealers(lat, lon, radius);
      return dealers || [];
    } catch (error) {
      throw new Error(`Failed to fetch dealers: ${error.message}`);
    }
  }

  async geocodeCity(city) {
    const response = await axios.get(this.geocodeUrl, {
      params: {
        q: city,
        key: this.apiKey,
        type: 'city',
        fields: 'items.point'
      }
    });

    const firstResult = response.data.result.items[0];
    return {
      lat: firstResult.point.lat,
      lon: firstResult.point.lon
    };
  }

  async searchDealers(lat, lon, radius) {
    const response = await axios.get(this.searchUrl, {
      params: {
        key: this.apiKey,
        q: 'автосалон',
        point: `${lon},${lat}`,
        radius: radius * 1000,
        type: 'branch',
        fields: 'items.point,items.name,items.address_name,items.rubrics,items.contacts,items.schedule',
        page_size: 10
      }
    });

    let items = [];
    if (response.data.result && response.data.result.items) {
      items = response.data.result.items;
    } else if (response.data.items) {
      items = response.data.items;
    }

    return this.formatDealers(items, lat, lon);
  }

  formatDealers(items, userLat, userLon) {
    return items
      .filter(item => {
        const name = (item.name || '').toLowerCase();
        const rubrics = (item.rubrics || []).map(r => (r.name || '').toLowerCase()).join(' ');
        return name.includes('авто') || name.includes('car') || name.includes('auto') || 
               rubrics.includes('авто') || rubrics.includes('car') || rubrics.includes('auto');
      })
      .map(item => {
        const point = item.point || {};
        const lat = point.lat || 0;
        const lon = point.lon || 0;
        const distance = this.calculateDistance(userLat, userLon, lat, lon);

        const contacts = item.contacts || [];
        const phone = contacts.find(c => c.type === 'phone')?.value || contacts[0]?.value || 'Phone not available';

        return {
          name: item.name || 'Car Dealership',
          address: item.address_name || 'Address not available',
          distance: distance.toFixed(1),
          workingHours: { monday: '9:00 AM - 7:00 PM' }, // Simplified
          coordinates: {
            latitude: lat,
            longitude: lon
          },
          phone: phone,
          id: item.id || null
        };
      })
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// initialize services
const weatherService = new WeatherService();
const exchangeRateService = new ExchangeRateService();
const dealerService = new DealerService();

// weather routes
app.get('/api/weather/city', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        error: 'City parameter is required',
        message: 'Please provide a city name in the query parameter'
      });
    }

    const weatherData = await weatherService.getWeatherByCity(city);
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

app.get('/api/weather/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weatherData = await weatherService.getWeatherByCoordinates(parseFloat(lat), parseFloat(lon));
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

// exchange rate routes
app.get('/api/exchange/latest', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await exchangeRateService.getLatestRates(base.toUpperCase());
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates',
      message: error.message
    });
  }
});

app.get('/api/exchange/convert', async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    const conversion = await exchangeRateService.convertCurrency(from.toUpperCase(), to.toUpperCase(), parseFloat(amount));
    res.json({
      success: true,
      data: conversion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to convert currency',
      message: error.message
    });
  }
});

// dealer routes
app.get('/api/dealers/city', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        error: 'City parameter is required',
        message: 'Please provide a city name in the query parameter'
      });
    }

    const dealers = await dealerService.getDealersByCity(city);
    res.json({
      success: true,
      data: dealers,
      count: dealers.length
    });
  } catch (error) {
    console.error('Dealer controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dealer data',
      message: error.message
    });
  }
});

app.get('/api/dealers/coordinates', async (req, res) => {
  try {
    const { lat, lon, radius = 10 } = req.query;
    const dealers = await dealerService.getDealersByCoordinates(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    res.json({
      success: true,
      data: dealers,
      count: dealers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dealer data',
      message: error.message
    });
  }
});

// health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// start server

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
