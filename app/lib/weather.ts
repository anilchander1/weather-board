export type GeoPlace = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
};

export type DailyWeather = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: (number | null)[];
};

export type Forecast = {
  current: CurrentWeather;
  daily: DailyWeather;
};

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<GeoPlace[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("City search failed");
  const data = await res.json();
  return data.results ?? [];
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal,
  });
  if (!res.ok) throw new Error("Weather lookup failed");
  return res.json();
}

export function describeWeather(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Clear sky", icon: "☀️" };
  if (code === 1) return { label: "Mainly clear", icon: "🌤️" };
  if (code === 2) return { label: "Partly cloudy", icon: "⛅" };
  if (code === 3) return { label: "Overcast", icon: "☁️" };
  if (code === 45 || code === 48) return { label: "Foggy", icon: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: "🌦️" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { label: "Rain", icon: "🌧️" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { label: "Snow", icon: "❄️" };
  if (code >= 95) return { label: "Thunderstorm", icon: "⛈️" };
  return { label: "Unknown", icon: "🌡️" };
}

export function formatWeekday(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}
