document.addEventListener("DOMContentLoaded", function() {
	//api key
	const apiKey = "your_api_key";
	//retrieve HTML searchbar,search btn, auto detect btn,unit select dropdown
	const searchInput = document.getElementById("locationInput");
	const searchButton = document.getElementById("searchButton");
	const autoDetectButton = document.getElementById("autoDetectButton");
	const unitSelect = document.getElementById("unitSelect");
	//retrieve current day main Weather info HTML element 
	const datetime = document.getElementById("t_dt");
	const cityName = document.getElementById("t_cityname");
	const temperature = document.getElementById("t_wdesc");
	const description = document.getElementById("t_wtemp");
	const timage = document.getElementById("t_wimg");
	//retrieve current day  weather info html element
	const realFeel = document.getElementById("oreal_feel");
	const windSpeed = document.getElementById("owind_speed");
	const rainChance = document.getElementById("orain_chance");
	const humidity = document.getElementById("ouv_humidity");
	const dewpoint = document.getElementById("o_dewpoint");
	const uvindex = document.getElementById("o_uvindex");
	const pressure = document.getElementById("o_pressure");
	const visibility = document.getElementById("o_visibility");
	const sunrise = document.getElementById("o_sunrise");
	const sunset = document.getElementById("o_sunset");
	const maxtemp = document.getElementById("o_maxtemp");
	const mintemp = document.getElementById("o_mintemp");
	//retrieve current day Air Quality Index html element 
	const aindex = document.getElementById("cd_airfc-index");
	const aco = document.getElementById("cd_airfc-coIndex");
	const ao3 = document.getElementById("cd_airfc-o3Index");
	const apm25 = document.getElementById("cd_airfc-pm25Index");
	const aso2 = document.getElementById("cd_airfc-so2Index");
	const ano2 = document.getElementById("cd_airfc-no2Index");
	const anh3 = document.getElementById("cd_airfc-nh3Index");
	//retrieve ground and sea level html element
	const seaLevel = document.getElementById("sea_level");
	const groundLevel = document.getElementById("ground_level");
	//retrieve next few hour html element
	const hourlyfcD = document.getElementById("t_hfcD");
	//retrieve next few day html element
	const netxfdD = document.getElementById("t_nfdfcD");

	const errorModal = document.getElementById("errorModal");

	// Fetch Mumbai's weather by default
	fetchWeatherData("Mumbai");
	fetchHourlyForecast("Mumbai");
	fetchnextDaysForecast("Mumbai");


	// Add event listener for input field keyup event
	searchInput.addEventListener("keyup", (event) => {
		if (event.key === "Enter") {
			const query = searchInput.value;
			if (query) {
                fetchHourlyForecast(query);
                fetchnextDaysForecast(query);
				fetchWeatherData(query);
			} else {
				showErrorModal("Please enter a city or zip code.");
			}
		}
	});

	//Add event listener for search button 
	searchButton.addEventListener("click", () => {
		const query = searchInput.value;
		if (query) {
			fetchWeatherData(query);
            fetchHourlyForecast(query);
            fetchnextDaysForecast(query);
		} else {
			showErrorModal("Please enter a city or zip code.");
		}
	});

	//Add event listener location detection for auto detect location button
	autoDetectButton.addEventListener("click", () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				previousQuery = `(${latitude},${longitude})`;
				fetchWeatherData(latitude, longitude); // Pass unit as the third argument
                fetchHourlyForecast(latitude, longitude);
                fetchnextDaysForecast(latitude, longitude);
			}, (error) => {
				if (error.code === error.PERMISSION_DENIED) {
					showErrorModal("User denied access to their location.");
				} else {
					showErrorModal("Unable to detect your location.");
				}
			});
		} else {
			showErrorModal("Geolocation is not supported by your browser.");
		}
	});
	// Add event listener for unit selection changes dropdown
	unitSelect.addEventListener("change", () => {
		const currentUnit = unitSelect.value;
		const city = cityName.textContent.split(",")[0]; // Get the city name from the displayed content
		fetchWeatherData(city, currentUnit);
        fetchHourlyForecast(city, currentUnit);
        fetchnextDaysForecast(city, currentUnit);
	});


	function fetchWeatherData(cityOrLatitude, longitude) {
		
		const unit = unitSelect.value;
		let apiUrl;
		if (isNaN(cityOrLatitude)) {
			// City name or zip code was provided
			apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrLatitude}&appid=${apiKey}&units=${unit}`;
		} else {
			// Latitude and longitude were provided
			apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityOrLatitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`;
		}


		fetch(apiUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error("City not found or invalid.");
				}
				return response.json();
			})
			.then((data) => {
				// start code for current day main weather info
				const cityAndCountry = `${data.name}, ${data.sys.country}`;
				cityName.textContent = cityAndCountry;
				const tempp = data.main.temp
				temperature.textContent = `${Math.round(tempp)}°${unit === 'imperial' ? 'F' : 'C'}`;
				description.textContent = data.weather[0].description;
				// Fetch and display current time and date
				const currentTime = new Date();
				const timeOptions = {
					hour: 'numeric',
					minute: 'numeric',
					hour12: true
				};
				const dateOptions = {
					month: 'short',
					day: 'numeric'
				};
				const formattedTime = currentTime.toLocaleString('en-US', timeOptions);
				const formattedDate = currentTime.toLocaleString('en-US', dateOptions);
				datetime.textContent = `${formattedTime},   ${formattedDate}`;
				const { id } = data.weather[0];
				// using custom weather icon according to the id which api gives to us
				if (id == 800) {
					timage.src = "assets/img/clear.svg";
				} else if (id >= 200 && id <= 232) {
					timage.src = "assets/img/storm.svg";
				} else if (id >= 600 && id <= 622) {
					timage.src = "assets/img/snow.svg";
				} else if (id >= 701 && id <= 781) {
					timage.src = "assets/img/haze.svg";
				} else if (id >= 801 && id <= 804) {
					timage.src = "assets/img/cloud.svg";
				} else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
					timage.src = "assets/img/rain.svg";
				}
				// End code for current day main weather info


				// start code for current day other weather info for see more div
                rainChance.textContent = `${data.clouds.all}%`;
                windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
				const feelslike =  data.main.feels_like
                realFeel.textContent = `${Math.round(feelslike)}°${unit === 'imperial' ? 'F' : 'C'}`;
				humidity.textContent = `${data.main.humidity}%`;
				pressure.textContent = `${data.main.pressure} hPa`;
				// Calculate and display the dew point
				const temperaturee = data.main.temp;
				const relativeHumidity = data.main.humidity;
				const A = 17.27;
                const B = 237.7;
				const alpha = ((A * temperaturee) / (B + temperaturee)) + Math.log(relativeHumidity / 100.0);
				const dewPointt = (B * alpha) / (A - alpha);
				dewpoint.textContent = `${Math.round(dewPointt)}°${unit === 'imperial' ? 'F' : 'C'}`;
                visibility.textContent = `${data.visibility / 1000} km`;
				const uvIndexApiUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat={latitude}&lon={longitude}`;
				//fetch UV index data using latitude and longitude from the previous response
				const latitude = data.coord.lat;
				const longitude = data.coord.lon;
				fetch(uvIndexApiUrl.replace('{latitude}', latitude).replace('{longitude}', longitude))
					.then(response => response.json())
					.then(uvData => {
						const uvIndexx = uvData.value;
						uvindex.textContent = `${Math.round(uvIndexx)}`;
					})
					.catch(error => {
						console.error('Error fetching UV index data:', error);
					});
			   const sunriseTime = new Date(data.sys.sunrise * 1000);
               const sunsetTime = new Date(data.sys.sunset * 1000);
			   const maxTemperature = data.main.temp_max;
               const minTemperature = data.main.temp_min;
			   sunrise.textContent = formatTime(sunriseTime);
               sunset.textContent = formatTime(sunsetTime);
			   maxtemp.textContent = `${Math.round(maxTemperature)}°${unit === 'imperial' ? 'F' : 'C'}`;
               mintemp.textContent = `${Math.round(minTemperature)}°${unit === 'imperial' ? 'F' : 'C'}`;
			   // End code for current day other weather info for see more div

			   //start code  for sea and ground level Atmospheric pressure
			   if (data.main.sea_level && data.main.grnd_level) {
				const seaLevelValue = data.main.sea_level;
				const groundLevelValue = data.main.grnd_level;
				seaLevel.textContent = `${Math.round(seaLevelValue)} hPa`;
				groundLevel.textContent = `${Math.round(groundLevelValue)} hPa`;
			  } else {
				// Handle the case when sea level and ground level data is not available
				seaLevel.textContent = "N/A";
				groundLevel.textContent = "N/A";
			  }
			   //End code  for sea and ground level Atmospheric pressure


			// start code for current day air quality info
            const airQualityApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`;
            fetch(airQualityApiUrl)
                .then((response) => response.json())
                .then((airQualityData) => {

					const airQuality = airQualityData.list[0];
					const aqi = airQuality.main.aqi;
					let aqiDescription;
                    // Map AQI values to descriptions
                    switch (aqi) {
                        case 1:
                            aqiDescription = "Good";
                            break;
                        case 2:
                            aqiDescription = "Fair";
                            break;
                        case 3:
                            aqiDescription = "Moderate";
                            break;
                        case 4:
                            aqiDescription = "Poor";
                            break;
                        case 5:
                            aqiDescription = "Very Poor";
                            break;
                        default:
                            aqiDescription = "Unknown";
                            break;
                    }
                    
                    aindex.textContent = aqiDescription;
                    aco.textContent = `${Math.round(airQuality.components.co)}`;
                    ao3.textContent = `${Math.round(airQuality.components.o3)}`;
                    apm25.textContent = `${Math.round(airQuality.components.pm2_5)}`;
                    aso2.textContent = `${Math.round(airQuality.components.so2)}`;
                    ano2.textContent = `${Math.round(airQuality.components.no2)}`;
                    anh3.textContent = `${Math.round(airQuality.components.nh3)}`;
                })
                .catch((error) => {
                    console.error('Error fetching air quality data:', error);
                });
				// End code for current day air quality info

				clearErrorModal();
			})
			.catch((error) => {
				showErrorModal(error.message);
			});
	}


	function formatTime(date) {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const formattedHours = hours % 12 || 12;
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `${formattedHours}:${formattedMinutes} ${ampm}`;
	}

	

    function fetchHourlyForecast(cityOrLatitude, longitude) {
		const unit = unitSelect.value;
		let apiUrl;
		if (isNaN(cityOrLatitude)) {
			// City name or zip code was provided
			apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityOrLatitude}&appid=${apiKey}&units=${unit}`;
		} else {
			// Latitude and longitude were provided
			apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityOrLatitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`;
		}
	
		fetch(apiUrl)
			.then((response) => response.json())
			.then((data) => {
				const forecastList = data.list;
				// Clear previous data before adding new data
				hourlyfcD.innerHTML = '';
	
				// Get the current date in the user's timezone
				const now = new Date();
				const timezoneOffset = now.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
				const currentDate = new Date(now.getTime() - timezoneOffset);
				// Map icon IDs to custom icons
				const iconMap = {
					'01d': 'assets/img/clear.svg',
					'01n': 'assets/img/clear.svg',
					'02d': 'assets/img/cloud.svg',
					'02n': 'assets/img/cloud.svg',
					'03d': 'assets/img/cloud.svg',
					'03n': 'assets/img/cloud.svg',
					'04d': 'assets/img/cloud.svg',
					'04n': 'assets/img/cloud.svg',
					'09d': 'assets/img/rain.svg',
					'09n': 'assets/img/rain.svg',
					'10d': 'assets/img/rain.svg',
					'10n': 'assets/img/rain.svg',
					'11d': 'assets/img/storm.svg',
					'11n': 'assets/img/storm.svg',
					'13d': 'assets/img/snow.svg',
					'13n': 'assets/img/snow.svg',
					'50d': 'assets/img/haze.svg',
					'50n': 'assets/img/haze.svg',
				};
				// Iterate through the hourly forecast data
				forecastList.slice(0, 8).forEach((hourlyData) => { // Display next 8 hours
					const timestampUTC = new Date(hourlyData.dt_txt);
					const timestampLocal = new Date(timestampUTC - timezoneOffset);
					// Format time as AM/PM
					const options = { hour: 'numeric', minute: '2-digit', hour12: true };
					const formattedTime = timestampLocal.toLocaleString('en-US', options);
					const tempp = hourlyData.main.temp
				    const temperature = `${Math.round(tempp)}°${unit === 'imperial' ? 'F' : 'C'}`;
					const iconId = hourlyData.weather[0].icon; // Weather icon ID
	
					const hourlyHTML = `
						<div class="cd_sh-fc">
							<span>${formattedTime}</span>
							<img src="http://openweathermap.org/img/wn/${iconId}.png" alt="${hourlyData.weather[0].description}">
							<p>${temperature}</p>
						</div>
					`;
					hourlyfcD.innerHTML += hourlyHTML;
				});
			})
			.catch((error) => {
				showErrorModal(error.message);
			});
	}
	
    
    function fetchnextDaysForecast(cityOrLatitude, longitude) {
        const unit = unitSelect.value;
        let apiUrl;
        if (isNaN(cityOrLatitude)) {
            // City name or zip code was provided
            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityOrLatitude}&appid=${apiKey}&units=${unit}`;
        } else {
            // Latitude and longitude were provided
            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityOrLatitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`;
        }
    
        fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
			netxfdD.innerHTML="";

			const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));
            const currentDate = new Date(); // Get the current date
            const forecastHTML = dailyForecasts.map(forecast => {
            const date = new Date(forecast.dt * 1000);
            const isToday = date.getDate() === currentDate.getDate(); // Check if the forecast date is today
            const day = isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
            const icon = forecast.weather[0].icon;
            const description = forecast.weather[0].description;
            const tempp = forecast.main.temp;
            const temperature = `${Math.round(tempp)}°${unit === 'imperial' ? 'F' : 'C'}`;

					const nfdfcHTML = `
					<div class="nfd_fc-SDdiv">
						<div class="nfd_fc-SDdivinfo">
						   <span>${day}</span>
						   <img src="https://openweathermap.org/img/w/${icon}.png" alt="fc_img" />
						</div>
						<div class="nfd_fc-SDdivinfo">
						   <p>${description}</p>
						   <span>${temperature}</span>
						</div>
					</div>
						`;
						netxfdD.innerHTML += nfdfcHTML;
            });
        })
        .catch((error) => {
            showErrorModal(error.message);
        });
}



// start function for display error message in modal
	function showErrorModal(message) {
		errorModal.textContent = message;
		errorModal.style.display = "block";
		setTimeout(clearErrorModal, 5000);
	}

	function clearErrorModal() {
		errorModal.textContent = "";
		errorModal.style.display = "none";
	}
	// End function for display error message in modal



	// start code for displaying div one by one
	const seeMoreButton = document.getElementById('seeMore');
        const goBackButton = document.getElementById('goBack');
        const divs = document.querySelectorAll('.cd_other-fcDetailsDiv');
        let currentDivIndex = 0;

        seeMoreButton.addEventListener('click', () => {
            if (currentDivIndex < divs.length - 1) {
                divs[currentDivIndex].classList.remove('active');
                currentDivIndex++;
                divs[currentDivIndex].classList.add('active');
                goBackButton.style.display = 'inline';
            }
            if (currentDivIndex === divs.length - 1) {
                seeMoreButton.style.display = 'none';
            }
        });

        goBackButton.addEventListener('click', () => {
            if (currentDivIndex > 0) {
                divs[currentDivIndex].classList.remove('active');
                currentDivIndex--;
                divs[currentDivIndex].classList.add('active');
                seeMoreButton.style.display = 'inline';
            }
            if (currentDivIndex === 0) {
                goBackButton.style.display = 'none';
            }
        });
		// End code for displaying div one by one



	


});