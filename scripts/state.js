export const state = {
  savedLocations: [],
  searchStatus: "idle",
  results: null,
  location: null,
  forecastStatus: "idle",
  forecast: null,
  selectedUnits: {
    temperature: "celsius",
    wind: "kmh",
    precipitation: "mm",
  },
  getResultById: function (id) {
    if (!this.results) return null;
    return this.results.find((result) => result.id === Number(id));
  },
  getSavedLocationById: function (id) {
    if (!this.savedLocations) return null;
    return this.savedLocations.find((location) => location.id === Number(id));
  },
};
