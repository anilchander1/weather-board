"use client";

import { useEffect, useState } from "react";
import {
  describeWeather,
  fetchForecast,
  formatWeekday,
  searchPlaces,
  type Forecast,
  type GeoPlace,
} from "../lib/weather";

const DEFAULT_PLACE: GeoPlace = {
  id: 1275339,
  name: "Mumbai",
  latitude: 19.076,
  longitude: 72.8777,
  country: "India",
};

function placeLabel(place: GeoPlace): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

function WeatherView({ place }: { place: GeoPlace }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchForecast(place.latitude, place.longitude, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setForecast(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Could not load weather. Try again.");
      });
    return () => controller.abort();
  }, [place]);

  const current = forecast?.current;
  const daily = forecast?.daily;

  if (error) {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
        {error}
      </p>
    );
  }

  if (!current) {
    return (
      <div className="h-48 animate-pulse rounded-3xl bg-zinc-200/70 dark:bg-zinc-800" />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {placeLabel(place)}
            </p>
            <p className="mt-2 text-6xl font-semibold tracking-tight">
              {Math.round(current.temperature_2m)}°C
            </p>
            <p className="mt-1 text-lg">
              {describeWeather(current.weather_code).label}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Feels like {Math.round(current.apparent_temperature)}°C
            </p>
          </div>
          <span className="text-6xl" aria-hidden>
            {describeWeather(current.weather_code).icon}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-black/5 pt-4 text-sm dark:border-white/10">
          <p className="text-zinc-500 dark:text-zinc-400">
            Humidity:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {Math.round(current.relative_humidity_2m)}%
            </span>
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Wind:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {Math.round(current.wind_speed_10m)} km/h
            </span>
          </p>
        </div>
      </section>

      {daily && (
        <section>
          <h2 className="mb-3 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            7-day forecast
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {daily.time.map((date, index) => {
              const description = describeWeather(daily.weather_code[index]);
              const precipitation = daily.precipitation_probability_max[index];
              return (
                <div
                  key={date}
                  className="flex min-w-[92px] flex-1 flex-col items-center gap-1 rounded-2xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
                >
                  <p className="text-sm font-medium">{formatWeekday(date)}</p>
                  <span className="text-2xl" aria-hidden>
                    {description.icon}
                  </span>
                  <p className="text-sm font-semibold">
                    {Math.round(daily.temperature_2m_max[index])}°
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {Math.round(daily.temperature_2m_min[index])}°
                  </p>
                  {precipitation != null && precipitation > 0 && (
                    <p className="text-xs text-blue-500">{precipitation}% 💧</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default function WeatherBoard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    query: string;
    places: GeoPlace[];
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [place, setPlace] = useState<GeoPlace>(DEFAULT_PLACE);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      searchPlaces(trimmed, controller.signal)
        .then((found) => {
          if (!controller.signal.aborted)
            setResults({ query: trimmed, places: found });
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setResults({ query: trimmed, places: [] });
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const trimmed = query.trim();
  const activeResults =
    results && results.query === trimmed ? results.places : null;
  const showDropdown =
    trimmed.length >= 2 &&
    (searching || (activeResults !== null && activeResults.length > 0));

  function selectPlace(selected: GeoPlace) {
    setPlace(selected);
    setQuery("");
    setResults(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city…"
          aria-label="Search a city"
          className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-base shadow-sm outline-none placeholder:text-zinc-400 focus:border-blue-400 dark:border-white/10 dark:bg-zinc-900 dark:placeholder:text-zinc-600"
        />
        {showDropdown && (
          <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            {searching && (
              <li className="px-4 py-3 text-sm text-zinc-500">Searching…</li>
            )}
            {!searching && activeResults !== null && activeResults.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500">
                No cities found
              </li>
            )}
            {activeResults?.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => selectPlace(candidate)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {placeLabel(candidate)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <WeatherView
        key={`${place.id}-${place.latitude}-${place.longitude}`}
        place={place}
      />

      <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
        Data by{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-500"
        >
          Open-Meteo
        </a>
      </p>
    </div>
  );
}
