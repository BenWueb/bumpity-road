import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import WeatherCard from "@/components/WeatherCard";
import { Suspense } from "react";

export default function Home() {
  const data = [
    {
      title: "SOP",
      desc: "Everything you need to know about the cabin",
      btn: "View SOP",
    },
    {
      title: "Calendar",
      desc: "View the cabin calendar",
      btn: "View Calendar",
    },
    {
      title: "Guest Book",
      desc: "View the guest book",
      btn: "View Guest Book",
    },
    {
      title: "",
      desc: "",
      btn: "",
    },
  ];

  return (
    <>
      <div className="p-8 flex flex-col gap-8">
        <Header />
        <div className="flex gap-8">
          <Suspense fallback={<div>Loading weather...</div>}>
            <WeatherCard />
          </Suspense>
        </div>
        <Suspense fallback={<div>Loading weather...</div>}>
          <Calendar />
        </Suspense>
      </div>
    </>
  );
}
