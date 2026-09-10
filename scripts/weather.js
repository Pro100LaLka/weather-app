const WEATHER_CODES = {
  0: { label: "Clear", icon: "clear" }, // clear-day / clear-night
  1: { label: "Mainly clear", icon: "mostly-clear" },
  2: { label: "Partly cloudy", icon: "partly-cloudy" }, // partly-cloudy-day / -night
  3: { label: "Overcast", icon: "overcast" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Heavy drizzle", icon: "drizzle" },
  56: { label: "Light freezing drizzle", icon: "drizzle" },
  57: { label: "Heavy freezing drizzle", icon: "snow" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Light freezing rain", icon: "snow" },
  67: { label: "Heavy freezing rain", icon: "snow" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Light showers", icon: "rain" },
  81: { label: "Showers", icon: "rain" },
  82: { label: "Heavy showers", icon: "rain" },
  85: { label: "Light snow showers", icon: "snow" },
  86: { label: "Heavy snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "thunderstorms" },
  96: { label: "Thunderstorm with sligh hail", icon: "thunderstorms-drizzle" },
  99: { label: "Thunderstorm with heavy hail", icon: "thunderstorms-rain" },
};

export function transformCurrentDate(dateStr) {
  const date = new Date(dateStr);
  const dayOfTheWeek = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${dayOfTheWeek}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getWeatherSvgSrc(
  weather_code,
  { is_day = true, animated = false } = {},
) {
  let weatherIcon = (WEATHER_CODES[weather_code] ?? WEATHER_CODES[3]).icon;
  if ([0, 1, 2].includes(weather_code))
    weatherIcon += `-${is_day ? "day" : "night"}`;
  return `./assets/weather-icons/${weatherIcon}${animated ? "" : "-static"}.svg`;
}

export function getWeatherLabel(weather_code) {
  return (WEATHER_CODES[weather_code] ?? WEATHER_CODES[3]).label;
}
