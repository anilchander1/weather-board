import WeatherBoard from "./components/weather-board";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Weather Board
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Search any city for current conditions and a 7-day forecast.
          </p>
        </header>
        <WeatherBoard />
      </main>
    </div>
  );
}
