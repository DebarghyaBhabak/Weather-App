const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const weatherCard = document.getElementById('weatherCard');
const historyList = document.getElementById('historyList');

const elCityName = document.getElementById('cityName');
const elTemperature = document.getElementById('temperature');
const elCondition = document.getElementById('condition');
const updateAtmosphereDiv = document.getElementById('details'); // used for reference length
const elHumidity = document.getElementById('humidity');
const elCoords = document.getElementById('coords');

const elFeelsLike = document.getElementById('feelsLike');
const elWindSpeed = document.getElementById('windSpeed');
const elPressure = document.getElementById('pressure');
const extendedDataBtn = document.getElementById('extendedDataBtn');
const extendedDetails = document.getElementById('extendedDetails');

const themeBody = document.getElementById('themeBody');
const celestialBody = document.getElementById('celestialBody');
const cloudsLayer = document.querySelector('.clouds-layer');

let weatherMap = null;
let mapMarker = null;
let currentTileLayer = null;

async function fetchWeather(city) {
    weatherCard.classList.add('hidden');
    errorDiv.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok || data.cod !== 200) {
            throw new Error(data.message || data.error || 'City not found');
        }

        // GUI Population
        elCityName.textContent = data.name;
        elTemperature.textContent = `${Math.round(data.main.temp)}°C`;
        elHumidity.textContent = `${data.main.humidity}%`;
        
        let condition = 'Unknown';
        let iconCode = '';
        if(data.weather && data.weather.length > 0) {
            condition = data.weather[0].main;
            iconCode = data.weather[0].icon;  // '01d', '02n', etc...
        }
        elCondition.textContent = condition;
        elCoords.textContent = `${data.coord.lat.toFixed(2)}, ${data.coord.lon.toFixed(2)}`;

        // Process Day/Night and Weather Animations
        updateAtmosphere(iconCode, condition);

        // Populate Extended Data
        if (data.main) {
            elFeelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
            elPressure.textContent = `${data.main.pressure} hPa`;
        }
        if (data.wind) {
            elWindSpeed.textContent = `${data.wind.speed} m/s`;
        }

        // Reset details toggle state for new searches
        extendedDetails.classList.add('hidden');
        extendedDataBtn.classList.remove('open');

        weatherCard.classList.remove('hidden');
        
        // Setup / Update Leaflet Map
        const lat = data.coord ? data.coord.lat : null;
        const lon = data.coord ? data.coord.lon : null;
        if (lat !== null && lon !== null) {
            const isNight = iconCode.includes('n');
            updateMap(lat, lon, isNight);
        }

        await loadHistory();
        
    } catch (err) {
        errorDiv.textContent = err.message || 'Failed to fetch weather';
        errorDiv.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

function updateAtmosphere(iconCode, conditionStr) {
    const isNight = iconCode.includes('n'); /* OpenWeatherMap suffix represents night */
    
    // Day vs Night Background and Celestial object
    if (isNight) {
        themeBody.className = 'theme-night';
        celestialBody.className = 'moon';
    } else {
        themeBody.className = 'theme-day';
        celestialBody.className = 'sun';
    }

    // Clouds logic
    const condition = conditionStr.toLowerCase();
    if (condition.includes('cloud') || condition.includes('rain') || condition.includes('scattered')) {
        cloudsLayer.classList.remove('hidden-clouds');
    } else if (condition.includes('clear')) {
        cloudsLayer.classList.add('hidden-clouds');
    } else {
        cloudsLayer.classList.remove('hidden-clouds'); // Default show
    }
}

function updateMap(lat, lon, isNight) {
    const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const tileUrl = isNight ? darkTiles : lightTiles;

    if (!weatherMap) {
        weatherMap = L.map('map').setView([lat, lon], 12);
        currentTileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(weatherMap);
    } else {
        weatherMap.setView([lat, lon], 12);
        
        // Remove old tile layer and add new one to switch themes smoothly
        if (currentTileLayer) {
            weatherMap.removeLayer(currentTileLayer);
        }
        currentTileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(weatherMap);
    }

    if (mapMarker) {
        mapMarker.setLatLng([lat, lon]);
    } else {
        mapMarker = L.marker([lat, lon]).addTo(weatherMap);
    }
}

async function loadHistory() {
    try {
        historyList.innerHTML = '';
        const response = await fetch('/api/history');
        const historyData = await response.json();
        
        if (historyData.length === 0) {
            historyList.innerHTML = '<div style="opacity:0.6;font-size:0.9rem;text-align:center;">No search history yet.</div>';
            return;
        }

        historyData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div>
                    <div>${item.city} <span class="hist-time">${item.time.split(' ')[1]}</span></div>
                    <div style="font-size:0.8rem;opacity:0.8;text-transform:capitalize">${item.weather}</div>
                </div>
                <div class="hist-temp">${Math.round(item.temp)}°C</div>
            `;
            div.addEventListener('click', () => {
                cityInput.value = item.city;
                fetchWeather(item.city);
            });
            historyList.appendChild(div);
        });
    } catch (err) {
        console.error("Could not load history", err);
    }
}

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim()) {
        fetchWeather(cityInput.value.trim());
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim()) {
        fetchWeather(cityInput.value.trim());
    }
});

// Extended Details Toggle
extendedDataBtn.addEventListener('click', () => {
    extendedDetails.classList.toggle('hidden');
    extendedDataBtn.classList.toggle('open');
});

// Load history immediately
loadHistory();
