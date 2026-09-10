import { state } from "./state.js";
import {
  fetchUserIP,
  fetchUserLocation,
  fetchResults,
  fetchForecast,
} from "./data.js";
import {
  renderResults,
  renderForecast,
  renderSavedLocations,
} from "./render.js";

const unitsElement = document.querySelector(".units");
const unitsSwitchBtn = document.querySelector(".units__switch");
const unitsDropdown = document.querySelector(".units__dropdown");
const searchInput = document.querySelector(".search__input");
const resultList = document.querySelector(".search__results");
const recentSearches = document.querySelector(".recent-searches");
const retryBtn = document.querySelector(".retry-btn");

const inputTimeoutTime = 300;
let inputTimeout = null;

// -------------------- storage --------------------
function saveUnits() {
  localStorage.setItem("units", JSON.stringify(state.selectedUnits));
}

function loadSavedUnits() {
  const saved = JSON.parse(localStorage.getItem("units"));
  if (!saved) return;
  state.selectedUnits = saved;
  Object.entries(state.selectedUnits).forEach(([category, unit]) => {
    const input = unitsDropdown.querySelector(
      `input[name="${category}"][value="${unit}"]`,
    );
    input.checked = true;
  });
}

function saveLocation() {
  const saved = JSON.parse(localStorage.getItem("recent-searches")) ?? [];

  const existingLocationIndex = saved.findIndex(
    (location) => location.id === state.location.id,
  );

  if (existingLocationIndex !== -1) {
    saved.splice(existingLocationIndex, 1);
  } else if (saved.length === 3) saved.pop();

  saved.unshift(state.location);
  localStorage.setItem("recent-searches", JSON.stringify(saved));
}

function loadSavedLocations() {
  const saved = JSON.parse(localStorage.getItem("recent-searches")) ?? [];
  state.savedLocations = saved;
  renderSavedLocations();
}

// -------------------- actions --------------------
function handleUnitChange(target) {
  state.selectedUnits[target.name] = target.value;
}

function handleUnitsSwitchClick(toMetric) {
  const systemToSwitchTo = toMetric ? "metric" : "imperial";
  unitsDropdown
    .querySelectorAll(`[data-system="${systemToSwitchTo}"]`)
    .forEach((input) => {
      input.checked = true;
      handleUnitChange(input);
    });
  saveUnits();
}

async function handleInput() {
  clearTimeout(inputTimeout);
  await new Promise(
    (resolve) => (inputTimeout = setTimeout(resolve, inputTimeoutTime)),
  );

  let data = null;
  const value = searchInput.value;

  if (value.length < 3) {
    state.results = null;
    state.searchStatus = "idle";
    renderResults();
    return;
  }

  state.searchStatus = "loading";
  renderResults();
  data = await fetchResults(value);

  if (!data) {
    state.searchStatus = "error";
  } else if (!data.results) {
    state.searchStatus = "empty";
  } else {
    state.searchStatus = "results";
    state.results = data.results;
  }

  renderResults();
}

function blurResults() {
  state.results = null;
  state.searchStatus = "idle";
  clearTimeout(inputTimeout);
  renderResults();
}

async function loadForecast() {
  searchInput.value = "";
  blurResults();

  state.forecastStatus = "loading";
  renderForecast();

  const { wind, temperature, precipitation } = state.selectedUnits;
  const data = await fetchForecast(
    state.location,
    wind,
    temperature,
    precipitation,
  );

  if (!data) {
    console.error("Error: no forecast data received");
    state.forecastStatus = "error";
    renderForecast();
    return;
  }

  state.forecast = data;
  state.forecastStatus = "loaded";
  renderForecast();
}

function handleLocationClick(target, { fromRecent = false } = {}) {
  const id = target.closest("li")?.dataset.id;
  if (!id) return;

  state.location = fromRecent
    ? state.getSavedLocationById(id)
    : state.getResultById(id);
  saveLocation();
  loadSavedLocations();
  loadForecast();
}

// -------------------- events --------------------
unitsDropdown.addEventListener("change", (e) => {
  if (e.target.dataset?.system) {
    handleUnitChange(e.target);
    saveUnits();
  }
});

unitsSwitchBtn.addEventListener("click", (e) => {
  handleUnitsSwitchClick(e.target.classList.contains("to-metric"));
});

searchInput.addEventListener("input", handleInput);

searchInput.addEventListener("focus", handleInput);

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search")) blurResults();
  if (!e.target.closest(".units") && unitsElement.open)
    unitsElement.open = false;
});

resultList.addEventListener("click", (e) => handleLocationClick(e.target));

recentSearches.addEventListener("click", (e) =>
  handleLocationClick(e.target, { fromRecent: true }),
);

retryBtn.addEventListener("click", loadForecast);

// -------------------- init --------------------
loadSavedUnits();

loadSavedLocations();

async function loadUserLocationForecast() {
  const userIP = await fetchUserIP();
  if (!userIP?.ip) return;
  const userLocation = await fetchUserLocation(userIP.ip);
  if (
    !userLocation?.location?.city ||
    !userLocation?.location?.latitude ||
    !userLocation?.location?.longitude ||
    !userLocation?.country?.name
  )
    return;
  state.location = {
    name: userLocation.location.city,
    latitude: userLocation.location.latitude,
    longitude: userLocation.location.longitude,
    country: userLocation.country.name,
  };
  loadForecast();
}

loadUserLocationForecast();
