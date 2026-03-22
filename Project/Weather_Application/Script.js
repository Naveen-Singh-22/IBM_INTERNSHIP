// Weather API configuration
const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

const searchForm = document.getElementById("search");
const cityInput = document.getElementById("cityInput");
const temperatureDiv = document.getElementById("temperature");
const humidityDiv = document.getElementById("humidity");
const windDiv = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");

const weatherDescription = document.getElementById("weatherDescription");
const forecastDiv = document.getElementById("forecast");


searchForm.addEventListener("submit", function (e) {
	e.preventDefault();
	const city = cityInput.value.trim();
	if (city) {
		getWeather(city);
		getForecast(city);
	}
});

async function getWeather(city) {
	temperatureDiv.textContent = "Temperature: --°C";
	humidityDiv.textContent = "Humidity: --%";
	windDiv.textContent = "Wind Speed: -- m/s";
	weatherIcon.style.display = "none";
	weatherDescription.textContent = "";
	try {
		const response = await fetch(`${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
		if (!response.ok) throw new Error("City not found");
		const data = await response.json();
		temperatureDiv.textContent = `Temperature: ${data.main.temp}°C`;
		humidityDiv.textContent = `Humidity: ${data.main.humidity}%`;
		windDiv.textContent = `Wind Speed: ${data.wind.speed} m/s`;
		weatherDescription.textContent = data.weather[0].description;
		weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
		weatherIcon.style.display = "inline-block";
	} catch (error) {
		weatherDescription.textContent = error.message;
	}
}

async function getForecast(city) {
	forecastDiv.innerHTML = "";
	try {
		const response = await fetch(`${forecastUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
		if (!response.ok) throw new Error("Forecast not found");
		const data = await response.json();
		// OpenWeatherMap provides forecast every 3 hours; pick one per day (e.g., 12:00)
		const daily = {};
		data.list.forEach(item => {
			const date = item.dt_txt.split(" ")[0];
			const hour = item.dt_txt.split(" ")[1];
			if (hour === "12:00:00") {
				daily[date] = item;
			}
		});
		let count = 0;
		for (const date in daily) {
			if (count >= 5) break;
			const item = daily[date];
			const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
			const temp = item.main.temp;
			const desc = item.weather[0].description;
			const html = `
				<div class="forecast-day">
					<div class="forecast-date">${date}</div>
					<img src="${iconUrl}" alt="icon" />
					<div class="forecast-temp">${temp}°C</div>
					<div class="forecast-desc">${desc}</div>
				</div>
			`;
			forecastDiv.innerHTML += html;
			count++;
		}
		if (count === 0) {
			forecastDiv.innerHTML = "No forecast data available.";
		}
	} catch (error) {
		forecastDiv.innerHTML = error.message;
	}
}
