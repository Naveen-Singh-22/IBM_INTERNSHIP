// Weather API configuration
const apiKey = "bfb9f09babc79670fd862f7a1c140776"; // Replace with your OpenWeatherMap API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";


const searchForm = document.getElementById("search");
const cityInput = document.getElementById("cityInput");
const dropdownForm = document.getElementById("dropdownSearch");
const cityDropdown = document.getElementById("cityDropdown");

// New elements for detailed UI
const mainTemp = document.getElementById("mainTemp");
const feelsLike = document.getElementById("feelsLike");
const mainCondition = document.getElementById("mainCondition");
const weatherIcon = document.getElementById("weatherIcon");
const windDiv = document.getElementById("wind");
const humidityDiv = document.getElementById("humidity");
const visibilityDiv = document.getElementById("visibility");
const pressureDiv = document.getElementById("pressure");
const currentDateTime = document.getElementById("currentDateTime");
const hourlyForecastDiv = document.getElementById("hourlyForecast");
const dailyForecastDiv = document.getElementById("dailyForecast");

// Search by city name input
searchForm.addEventListener("submit", function (e) {
	e.preventDefault();
	const city = cityInput.value.trim();
	if (city) {
		getWeather(city);
		getForecast(city);
	}
});

// Search by dropdown
if (dropdownForm && cityDropdown) {
	dropdownForm.addEventListener("submit", function (e) {
		e.preventDefault();
		const city = cityDropdown.value;
		if (city) {
			getWeather(city);
			getForecast(city);
		}
	});
}


async function getWeather(city) {
	// Reset UI
	mainTemp.textContent = "--°C";
	feelsLike.textContent = "Feels like --°C";
	mainCondition.textContent = "--";
	weatherIcon.style.display = "none";
	windDiv.textContent = "--";
	humidityDiv.textContent = "--";
	visibilityDiv.textContent = "--";
	pressureDiv.textContent = "--";
	currentDateTime.textContent = "--";
	try {
		const response = await fetch(`${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
		if (!response.ok) throw new Error("City not found");
		const data = await response.json();
		// Date/time
		const now = new Date((data.dt + data.timezone) * 1000);
		currentDateTime.textContent = now.toISOString().replace('T', ' ').substring(0, 16);
		// Main weather
		mainTemp.textContent = `${Math.round(data.main.temp * 10) / 10}°C`;
		feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like * 10) / 10}°C`;
		mainCondition.textContent = data.weather[0].main;
		weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
		weatherIcon.style.display = "inline-block";
		// Details
		windDiv.textContent = `${data.wind.speed} KM/H`;
		humidityDiv.textContent = `${data.main.humidity} %`;
		visibilityDiv.textContent = data.visibility ? `${Math.round(data.visibility / 1000)} km` : '--';
		pressureDiv.textContent = `${data.main.pressure} mb`;
	} catch (error) {
		mainCondition.textContent = error.message;
	}
}

async function getForecast(city) {
	hourlyForecastDiv.innerHTML = "";
	dailyForecastDiv.innerHTML = "";
	try {
		const response = await fetch(`${forecastUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
		if (!response.ok) throw new Error("Forecast not found");
		const data = await response.json();
		// --- Hourly Forecast (next 9 hours) ---
		for (let i = 0; i < 9 && i < data.list.length; i++) {
			const item = data.list[i];
			const date = new Date(item.dt * 1000);
			const hour = date.getHours();
			const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
			const temp = `${Math.round(item.main.temp * 10) / 10}°C`;
			const hf = document.createElement('div');
			hf.className = 'hourly-forecast-item';
			hf.innerHTML = `<div>${hour} o'clock</div><img src="${iconUrl}" alt="icon"><div class="hf-temp">${temp}</div>`;
			hourlyForecastDiv.appendChild(hf);
		}
		// --- 7-Day Forecast ---
		// Group by date, pick the highest temp for each day
		const daily = {};
		data.list.forEach(item => {
			const date = item.dt_txt.split(" ")[0];
			if (!daily[date]) daily[date] = [];
			daily[date].push(item);
		});
		let count = 0;
		for (const date in daily) {
			if (count >= 7) break;
			const dayItems = daily[date];
			// Find max and min temp, and use the first weather description/icon
			let maxTemp = -100, minTemp = 100, icon = '', desc = '';
			dayItems.forEach(item => {
				if (item.main.temp > maxTemp) maxTemp = item.main.temp;
				if (item.main.temp < minTemp) minTemp = item.main.temp;
				if (!icon) icon = item.weather[0].icon;
				if (!desc) desc = item.weather[0].description;
			});
			const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
			const df = document.createElement('div');
			df.className = 'daily-forecast-item';
			df.innerHTML = `<div class="df-date">${date}</div><div class="df-condition"><img src="${iconUrl}" alt="icon"><span>${desc}</span></div><div class="df-temps">${Math.round(maxTemp * 10) / 10}°C <span style="color:#888;font-weight:400;">${Math.round(minTemp * 10) / 10}°C</span></div>`;
			dailyForecastDiv.appendChild(df);
			count++;
		}
	} catch (error) {
		hourlyForecastDiv.innerHTML = `<div style="color:#b00020;">${error.message}</div>`;
		dailyForecastDiv.innerHTML = `<div style="color:#b00020;">${error.message}</div>`;
	}
}
