const apiKey = "b9b3fd82a7fe85088f6d5caac01ba1dd";
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric`;
const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?appid=${apiKey}&limit=5`;
const apiUrlForecast = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric`;

let isCelsius = true;

function convertTemperature(tempInCelsius) {
    if (isCelsius) {
        return Math.round(tempInCelsius) + "°C";
    } else {
        return Math.round((tempInCelsius * 9/5) + 32) + "°F";
    }
}

async function getWeatherData(city) {
    const response = await fetch(`${apiUrl}&q=${city}`);
    const data = await response.json();
    console.log(data);

    if (data.cod !== 200) {
        alert("City not found");
        return;
    }
    
    updateWeatherUI(data);
    getForecastData(city);
}

function updateWeatherUI(data) {
    const temperature = convertTemperature(data.main.temp);
    const windSpeed = data.wind.speed + " km/h";
    const humidity = data.main.humidity + "%";
    const weatherCondition = data.weather[0].main;
    const cityName = data.name;
    const iconCode = data.weather[0].icon;

    document.querySelector(".temperature").textContent = temperature;
    document.querySelector(".wind .indicator").textContent = windSpeed;
    document.querySelector(".humidity .indicator").textContent = humidity;
    document.querySelector(".conditions").textContent = weatherCondition;
    document.querySelector(".location").textContent = cityName;

    document.querySelector(".weather img").src = `https://openweathermap.org/img/wn/${iconCode}.png`;
}

async function getForecastData(city) {
    const response = await fetch(`${apiUrlForecast}&q=${city}`);
    const data = await response.json();
    console.log(data); 

    if (data.cod !== "200") {
        alert("Forecast data not found");
        return;
    }

    updateForecastUI(data);
}

function updateForecastUI(data) {
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    const forecastElements = document.querySelectorAll(".weather-forecast .days > div");

    dailyForecasts.forEach((forecast, index) => {
        if (index < forecastElements.length) {
            const date = new Date(forecast.dt * 1000);
            const dayName = date.toLocaleDateString("en-US", { weekday: 'short' });
            const tempMax = convertTemperature(forecast.main.temp_max);
            const tempMin = convertTemperature(forecast.main.temp_min);
            const weatherCondition = forecast.weather[0].main;
            const iconCode = forecast.weather[0].icon;

            forecastElements[index].querySelector(".nomination").textContent = dayName;
            forecastElements[index].querySelector(".conditions").textContent = weatherCondition;
            forecastElements[index].querySelector(".max").textContent = tempMax;
            forecastElements[index].querySelector(".min").textContent = tempMin;
            forecastElements[index].querySelector(".icon img").src = `https://openweathermap.org/img/wn/${iconCode}.png`;
        }
    });
}

async function getCitySuggestions(query) {
    if (query.length < 2) return;

    const response = await fetch(`${geoApiUrl}&q=${query}`);
    const cities = await response.json();
    console.log(cities); 

    updateCitySuggestions(cities);
}

function updateCitySuggestions(cities) {
    const suggestionsBox = document.querySelector(".suggestions");
    suggestionsBox.innerHTML = "";

    cities.forEach(city => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.textContent = `${city.name}, ${city.country}`;
        suggestion.addEventListener("click", () => {
            document.getElementById("city-input").value = city.name;
            getWeatherData(city.name);
            suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(suggestion);
    });

    suggestionsBox.style.display = "block";
}

document.getElementById("switch-measure").addEventListener("click", () => {
    isCelsius = !isCelsius;
    const currentCity = document.getElementById("city-input").value;
    if (currentCity) {
        getWeatherData(currentCity);
    } else {
        alert("Please enter a city to switch the temperature unit.");
    }
});

document.getElementById("city-input").addEventListener("input", (event) => {
    const query = event.target.value;
    getCitySuggestions(query);
});

document.addEventListener("click", (event) => {
    const inputField = document.getElementById("city-input");
    const suggestionsBox = document.querySelector(".suggestions");
    if (!inputField.contains(event.target) && !suggestionsBox.contains(event.target)) {
        suggestionsBox.style.display = "none";
    }
});

document.querySelector(".button button").addEventListener("click", () => {
    const city = document.getElementById("city-input").value;
    if (city) {
        getWeatherData(city);
        document.querySelector(".suggestions").style.display = "none";
    }
});

document.getElementById("geo-input").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const city = await getCityByCoordinates(latitude, longitude);
            getWeatherData(city);
        }, (error) => {
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

async function getCityByCoordinates(latitude, longitude) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data.name; 
}

window.addEventListener("load", () => {
    getWeatherData("Almaty");
});
