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

async function WeatherCard() {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  try {
    const res: Response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=46.987414&lon=-94.2226322&units=imperial&appid=${apiKey}`
    );
    const weatherData: WeatherData = await res.json();
    const location = await fetch(
      `http://api.openweathermap.org/geo/1.0/reverse?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${apiKey}`
    );
    const locationData: LocationData[] = await location.json();

    return (
      <>
        <div className="bg-slate-100 p-4 rounded-lg shadow-md flex flex-col gap-2 text-lg flex-1">
          <div className="flex justify-center items-center gap-2">
            <Sun className="size-12" />
            <div className="flex flex-col">
              <header>{locationData[0].name}</header>
              <div className="text-xs capitalize">
                {" "}
                {weatherData.weather[0].description}{" "}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div> {weatherData.main.temp} °F</div>
            <div>{weatherData.main.feels_like} °F</div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.log(error);
  }
}
export default WeatherCard;
