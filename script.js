// API Key - Replace with your own OpenWeatherMap API key
const API_KEY = 'YOUR_API_KEY_HERE';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const forecastDays = document.getElementById('forecast-days');

// Fetch current weather data
async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error.message);
        return null;
    }
}

// Fetch forecast data
async function fetchForecastData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Update UI with weather data
function updateWeatherUI(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
}

// Update UI with forecast data
function updateForecastUI(data) {
    // Clear previous forecast
    forecastDays.innerHTML = '';
    
    // We'll show one forecast per day (every 24 hours)
    // OpenWeatherMap provides forecast every 3 hours, so we take every 8th item
    for (let i = 7; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-day';
        forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <p>${Math.round(forecast.main.temp)}°C</p>
            <p>${forecast.weather[0].description}</p>
        `;
        
        forecastDays.appendChild(forecastItem);
    }
}

// Get weather by city name
async function getWeatherByCity() {
    const city = cityInput.value.trim();
    if (!city) return;
    
    const weatherData = await fetchWeatherData(city);
    if (weatherData) {
        updateWeatherUI(weatherData);
        
        const forecastData = await fetchForecastData(city);
        if (forecastData) {
            updateForecastUI(forecastData);
        }
    }
}

// Get weather by current location
async function getWeatherByLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Get city name from coordinates
                const response = await fetch(
                    `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
                );
                
                if (!response.ok) {
                    throw new Error('Location data not available');
                }
                
                const locationData = await response.json();
                const city = locationData[0].name;
                cityInput.value = city;
                
                // Get weather for this location
                const weatherData = await fetchWeatherData(city);
                if (weatherData) {
                    updateWeatherUI(weatherData);
                    
                    const forecastData = await fetchForecastData(city);
                    if (forecastData) {
                        updateForecastUI(forecastData);
                    }
                }
            } catch (error) {
                alert(error.message);
            }
        },
        (error) => {
            alert(`Error getting location: ${error.message}`);
        }
    );
}

// Event Listeners
searchBtn.addEventListener('click', getWeatherByCity);
locationBtn.addEventListener('click', getWeatherByLocation);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeatherByCity();
    }
});

// Initialize with default city
window.addEventListener('load', () => {
    cityInput.value = 'London';
    getWeatherByCity();
});