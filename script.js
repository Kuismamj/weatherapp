const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");

const API_key = "cc2c718db9ac8699ec4fa15735eb3e6b"; //api key for openweathermap api
const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName,lat,lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        // filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
               return uniqueForecastDays.push(forecastDate);
            }
        });
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem,index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",html);
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend",html);
            }
            
        });
        
    }).catch((error) => {
        console.log(error)
        alert("An error occured while fetching the coordinates!")
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // get user entered city name and remove extra spaces
    if(cityName==="") return; // if cityName is empty return it
    const GEOCODING_API_URL =`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;
    
    // get entered city coordinates (latitude, longitude and name) from the api
    fetch(GEOCODING_API_URL).then(res => res.json ()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}!`);
        const {lat,lon,name} = data [0];
        getWeatherDetails(name,lat,lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates!")
    })
}
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude} = position.coords;
            const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            fetch(GEOCODING_API_URL).then(response => response.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name,latitude,longitude);
            }).catch(()=>{
                alert("An error occured while fetching the city name!")
            });
        },
        error => {
            if(error.code=== error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }else{
                alert("Geolocation request error. Please reset location permission.");
            }
        }

    )
}
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
