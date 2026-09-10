import { state } from "./state.js";
import {
  transformCurrentDate,
  getWeatherSvgSrc,
  getWeatherLabel,
} from "./weather.js";

const resultsList = document.querySelector(".search__results");
const searchInput = document.querySelector(".search__input");
const forecastContainer = document.querySelector(".forecast");
const currentMain = document.querySelector(".current__main-section");
const currentMini = document.querySelector(".current__mini-sections");
const hourlyList = document.querySelector(".hourly__list");
const dailyList = document.querySelector(".daily__list");
const recentSearches = document.querySelector(".recent-searches");

const numberOfResults = 5;

function formatResult(result) {
  const address = [result.name, result.admin1, result.country]
    .filter((part) => Boolean(part))
    .join(", ");
  return `
  <li role="option" data-id="${result.id}">
    <div class="flag-img">
      <img src="https://flagsapi.com/${result.country_code}/flat/24.png" alt="">
    </div>
    <span>${address}</span>
  </li>
  `;
}

function formatResultsMessage() {
  const status = state.searchStatus;
  let message = null;

  if (status === "loading")
    message = `<img src="assets/images/icon-loading.svg" alt="Loading results" />`;
  if (status === "empty")
    message = `<p>No places found. Check the spelling.</p>`;
  if (status === "error")
    message = `<p>Couldn't load suggestions. Try again in a moment.</p>`;

  return `<li class="results__message">${message ?? "Unexpected error. Try again."}</li>`;
}

function formatMainSection() {
  const location = state.location;
  const current = state.forecast.current;

  return `
  <h2 class="location">${location.name}, ${location.country}</h2>
  <time class="date" datetime="${current.time}">${transformCurrentDate(current.time)}</time>
  <div class="current__weather-container">
    <div class="weather-icon"><img src="${getWeatherSvgSrc(current.weather_code, { is_day: current.is_day, animated: true })}" alt="${getWeatherLabel(current.weather_code)}"></div>
    <p class="temperature">${Math.round(current.temperature_2m)}&deg;</p>
  </div>
  <p class="apparent">Feels like ${Math.round(current.apparent_temperature)}&deg;</p>
  `;
}

function formatMiniSection(
  title,
  property,
  { round = false, space = false } = {},
) {
  const value = state.forecast.current[property];
  const units = state.forecast.current_units[property];
  const roundedValue = round ? Math.round(value) : value;

  return `
  <div class="${title.toLowerCase()}">
    <h3 class="mini-section-title">${title}</h3>
    <p class="mini-section-value">${roundedValue}${space ? " " : ""}${units}</p>
  </div>
  `;
}

function renderMiniSections() {
  currentMini.innerHTML =
    formatMiniSection("Wind", "wind_speed_10m", { round: true, space: true }) +
    formatMiniSection("Precipitation", "precipitation", { space: true }) +
    formatMiniSection("Humidity", "relative_humidity_2m") +
    formatMiniSection("Pressure", "pressure_msl", { round: true, space: true });
}

function formatNow() {
  const current = state.forecast.current;
  const temp = Math.round(current.temperature_2m);

  return `
  <li class="hourly__card">
  <div class="hourly__weather-icon"><img src="${getWeatherSvgSrc(current.weather_code, { is_day: current.is_day })}" alt="${getWeatherLabel(current.weather_code)}"></div>
  <h3 class="hourly__hour">Now</h3>
  <p class="hourly__temperature">${temp}&deg;</p>
  </li>
  `;
}

function formatHour(timeIndex) {
  const hourly = state.forecast.hourly;
  const hour = new Date(hourly.time[timeIndex]).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
  const temp = Math.round(hourly.temperature_2m[timeIndex]);

  return `
  <li class="hourly__card">
  <div class="hourly__weather-icon"><img src="${getWeatherSvgSrc(hourly.weather_code[timeIndex], { is_day: hourly.is_day[timeIndex] })}" alt="${getWeatherLabel(hourly.weather_code[timeIndex])}"></div>
  <h3 class="hourly__hour">${hour}</h3>
  <p class="hourly__temperature">${temp}&deg;</p>
  </li>
  `;
}

function renderHourly() {
  const currentHours = new Date(state.forecast.current.time).getHours();
  const hourly = state.forecast.hourly;

  const timeIndexCurrent = hourly.time.findIndex(
    (time) => new Date(time).getHours() === currentHours,
  );

  hourlyList.innerHTML =
    formatNow() +
    Array.from({ length: 24 }, (_, index) =>
      formatHour(timeIndexCurrent + 1 + index),
    ).join("");
}

function formatDay(dayIndex) {
  const daily = state.forecast.daily;
  const date = new Date(daily.time[dayIndex]);
  const dayOfTheWeek =
    dayIndex == 0
      ? "Today"
      : dayIndex == 1
        ? "Tomorrow"
        : date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.toLocaleDateString("en-US", { day: "numeric" });

  return `
  <li class="daily__card">
  <div class="daily__date-container">
    <time datetime="" class="daily__date">${month} ${day}</time>
    <h3 class="daily__day">${dayOfTheWeek}</h3>
  </div>
  <div class="daily__weather-icon"><img src="${getWeatherSvgSrc(daily.weather_code[dayIndex])}" alt="${getWeatherLabel(daily.weather_code[dayIndex])}"></div>
  <p class="daily__temperature daily__temperature--max">${Math.round(daily.temperature_2m_max[dayIndex])}&deg;</p>
  <p class="daily__temperature daily__temperature--min">${Math.round(daily.temperature_2m_min[dayIndex])}&deg;</p>
  </li>
  `;
}

function renderDaily() {
  dailyList.innerHTML = Array.from({ length: 7 }, (_, index) =>
    formatDay(index),
  ).join("");
}

function formatLoadingMainSection() {
  return `
  <div class="loading-state" role="status">
    <div class="loading-animation" aria-hidden>
      <div class="loading-animation__circle"></div>
      <div class="loading-animation__circle"></div>
      <div class="loading-animation__circle"></div>
    </div>
    <p class="loading-text">Loading...</p>
  </div>
  `;
}

function formatLoadingMiniSection(title) {
  return `
  <div class="${title.toLowerCase()}}">
    <h3 class="mini-section-title">${title}</h3>
    <p class="mini-section-value">&dash;</p>
  </div>
  `;
}

function renderLoadingState() {
  currentMain.innerHTML = formatLoadingMainSection();
  currentMini.innerHTML =
    formatLoadingMiniSection("Wind") +
    formatLoadingMiniSection("Precipitation") +
    formatLoadingMiniSection("Humidity") +
    formatLoadingMiniSection("Pressure");
  hourlyList.innerHTML = `<li class="hourly__card"></li>`.repeat(25);
  dailyList.innerHTML = ``;
}

export function renderResults() {
  resultsList.role = "listbox";

  const status = state.searchStatus;

  if (status === "idle") {
    resultsList.innerHTML = "";
    searchInput.setAttribute("aria-expanded", "false");
    return;
  }

  if (searchInput !== document.activeElement) return;

  searchInput.setAttribute("aria-expanded", "true");

  if (status === "results") {
    const results = state.results.slice(0, numberOfResults);
    resultsList.innerHTML = results
      .map((result) => formatResult(result))
      .join("");
    return;
  }

  resultsList.role = "presentation";

  resultsList.innerHTML = formatResultsMessage();
}

export function renderForecast() {
  const status = state.forecastStatus;
  forecastContainer.dataset.status = status;

  if (status === "loading") renderLoadingState();

  if (status !== "loaded") return;

  currentMain.innerHTML = formatMainSection();
  renderMiniSections();
  renderHourly();
  renderDaily();
}

export function renderSavedLocations() {
  const saved = state.savedLocations;
  recentSearches.innerHTML = saved
    .map((location) => `<li data-id="${location.id}">${location.name}</li>`)
    .join("");
}
