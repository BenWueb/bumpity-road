import { Sun } from "lucide-react";

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  name: string;
  cod: number;
  message?: string;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

export default async function WeatherCard() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return <div>Error: API key is missing</div>;
  }

  try {
    const [weatherRes, locationRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=46.987414&lon=-94.2226322&units=imperial&appid=${apiKey}`,
        { cache: "force-cache" }
      ),
      fetch(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=46.987414&lon=-94.2226322&appid=${apiKey}`,
        { cache: "force-cache" }
      ),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }
    if (!locationRes.ok) {
      throw new Error(`Location API error: ${locationRes.status}`);
    }

    const weatherData: WeatherData = await weatherRes.json();
    const locationData: LocationData[] = await locationRes.json();

    return (
      <div className="bg-slate-100 p-4 rounded-lg shadow-md flex flex-col gap-2 text-lg">
        <div className="flex justify-center items-center gap-2">
          <Sun className="size-12" />
          <div className="flex flex-col">
            <header>{locationData[0]?.name ?? "Unknown"}</header>
            <div className="text-xs capitalize">
              {weatherData.weather[0]?.description ?? ""}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div>{weatherData.main.temp ?? "--"} °F</div>
          <div>{weatherData.main.feels_like ?? "--"} °F</div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return <div>Failed to fetch weather data. Please try again later.</div>;
  }
}
