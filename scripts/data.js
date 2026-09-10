export async function fetchUserIP() {
  try {
    const response = await fetch("https://ipinfo.io/json");
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error: " + error);
    return;
  }
}

export async function fetchUserLocation(userIP) {
  try {
    const response = await fetch(
      `https://api-bdc.net/data/ip-geolocation?ip=${userIP}&localityLanguage=en&key=bdc_acb013cc9c9f4fe0bd5e871f4f17ee7f`,
    );
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("Error: " + error);
    return;
  }
}

export async function fetchResults(input) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=10&language=en&format=json`,
    );
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error: " + error);
    return;
  }
}

export async function fetchForecast(
  location,
  wind,
  temperature,
  precipitation,
) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code,is_day&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,apparent_temperature,wind_speed_10m,wind_direction_10m,pressure_msl&timezone=auto&wind_speed_unit=${wind}&temperature_unit=${temperature}&precipitation_unit=${precipitation}`,
    );
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error: " + error);
    return;
  }
}
