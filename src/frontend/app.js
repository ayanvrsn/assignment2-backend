// API Base URL
const API_BASE_URL = '/api';

// Weather API Functions
async function getWeatherByCity(city) {
    try {
        showLoading('weatherDisplay');
        const response = await fetch(`${API_BASE_URL}/weather/city?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (data.success) {
            displayWeather(data.data);
        } else {
            showError('weatherDisplay', data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        showError('weatherDisplay', error.message);
    }
}

async function getWeatherByCoordinates(lat, lon) {
    try {
        showLoading('weatherDisplay');
        const response = await fetch(`${API_BASE_URL}/weather/coordinates?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        
        if (data.success) {
            displayWeather(data.data);
        } else {
            showError('weatherDisplay', data.message || 'Failed to fetch weather data');
        }
    } catch (error) {
        showError('weatherDisplay', error.message);
    }
}

function displayWeather(weatherData) {
    const display = document.getElementById('weatherDisplay');
    const iconUrl = `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`;
    
    display.innerHTML = `
        <div class="weather-card">
            <h3>${weatherData.city}, ${weatherData.countryCode}</h3>
            <div class="temperature">${weatherData.temperature}°C</div>
            <div class="weather-info">
                <div class="weather-info-item">
                    <span><i class="fas fa-info-circle"></i> Description:</span>
                    <span>${capitalizeFirst(weatherData.description)}</span>
                </div>
                <div class="weather-info-item">
                    <span><i class="fas fa-thermometer-half"></i> Feels Like:</span>
                    <span>${weatherData.feelsLike}°C</span>
                </div>
                <div class="weather-info-item">
                    <span><i class="fas fa-wind"></i> Wind Speed:</span>
                    <span>${weatherData.windSpeed} m/s</span>
                </div>
                <div class="weather-info-item">
                    <span><i class="fas fa-map-marker-alt"></i> Coordinates:</span>
                    <span>${weatherData.coordinates.latitude.toFixed(4)}, ${weatherData.coordinates.longitude.toFixed(4)}</span>
                </div>
                ${weatherData.rainVolume ? `
                <div class="weather-info-item">
                    <span><i class="fas fa-cloud-rain"></i> Rain (3h):</span>
                    <span>${weatherData.rainVolume} mm</span>
                </div>
                ` : ''}
            </div>
            <img src="${iconUrl}" alt="Weather icon" style="position: absolute; top: 1rem; right: 1rem; width: 80px; height: 80px;">
        </div>
    `;
}

// Exchange Rate API Functions
async function getLatestRates(baseCurrency = 'USD') {
    try {
        showLoading('ratesDisplay');
        const response = await fetch(`${API_BASE_URL}/exchange/latest?base=${baseCurrency}`);
        const data = await response.json();
        
        if (data.success) {
            displayRates(data.data);
        } else {
            showError('ratesDisplay', data.message || 'Failed to fetch exchange rates');
        }
    } catch (error) {
        showError('ratesDisplay', error.message);
    }
}

function displayRates(ratesData) {
    const display = document.getElementById('ratesDisplay');
    const date = new Date(ratesData.date).toLocaleDateString();
    
    // Get top currencies to display
    const topCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
    const rates = ratesData.rates || {};
    
    // Filter and sort rates
    const displayRates = Object.entries(rates)
        .filter(([currency]) => topCurrencies.includes(currency))
        .sort(([a], [b]) => topCurrencies.indexOf(a) - topCurrencies.indexOf(b));
    
    display.innerHTML = `
        <div class="rates-card">
            <div class="rates-header">
                <h3>Base Currency: ${ratesData.baseCurrency}</h3>
                <p class="rates-date"><i class="fas fa-calendar"></i> Last updated: ${date}</p>
            </div>
            <div class="rates-grid">
                ${displayRates.map(([currency, rate]) => `
                    <div class="rate-item">
                        <div class="rate-currency">${currency}</div>
                        <div class="rate-value">${typeof rate === 'number' ? rate.toFixed(4) : rate}</div>
                    </div>
                `).join('')}
            </div>
            <p class="rates-source"><i class="fas fa-info-circle"></i> Source: ${ratesData.source || 'API'}</p>
        </div>
    `;
}

// Dealer API Functions
async function findDealersByCoordinates(lat, lon) {
    try {
        showLoading('dealersList');
        
        const response = await fetch(`${API_BASE_URL}/dealers/coordinates?lat=${lat}&lon=${lon}&radius=10`);
        const data = await response.json();
        
        if (data.success) {
            displayDealers(data.data);
        } else {
            showError('dealersList', data.message || 'Failed to fetch dealer data');
        }
    } catch (error) {
        showError('dealersList', error.message);
    }
}

function displayDealers(dealers) {
    const display = document.getElementById('dealersList');
    
    if (dealers.length === 0) {
        display.innerHTML = '<div class="error">No dealers found in this area.</div>';
        return;
    }
    
    display.innerHTML = dealers.map(dealer => `
        <div class="dealer-card">
            <h3>${dealer.name}</h3>
            <div class="dealer-info">
                <div><i class="fas fa-map-marker-alt"></i> ${dealer.address}</div>
                <div class="dealer-distance">${dealer.distance} km away</div>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading...</p></div>';
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoordinates(lat, lon);
            },
            (error) => {
                showError('weatherDisplay', 'Unable to retrieve your location. Please enter a city name.');
            }
        );
    } else {
        showError('weatherDisplay', 'Geolocation is not supported by your browser.');
    }
}

// event listeners
document.addEventListener('DOMContentLoaded', () => {
    // weather controls
    document.getElementById('getWeatherBtn').addEventListener('click', () => {
        const city = document.getElementById('cityInput').value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            showError('weatherDisplay', 'Please enter a city name');
        }
    });
    
    document.getElementById('useLocationBtn').addEventListener('click', () => {
        getCurrentLocation();
    });
    
    // exchange rate controls
    document.getElementById('getRatesBtn').addEventListener('click', () => {
        const baseCurrency = document.getElementById('baseCurrency').value;
        getLatestRates(baseCurrency);
    });
    
    // dealer controls - location-based only
    document.getElementById('findNearbyBtn').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    findDealersByCoordinates(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    showError('dealersList', 'Unable to retrieve your location. Please enable location services in your browser settings.');
                }
            );
        } else {
            showError('dealersList', 'Geolocation is not supported by your browser.');
        }
    });
    
    // load initial data
    getLatestRates('USD');
    getWeatherByCity('New York');
});

