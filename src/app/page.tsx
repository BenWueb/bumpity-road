import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Calendar from "@/components/Calendar";

const WeatherCard = dynamic(() => import("@/components/WeatherCard"));

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
          <WeatherCard />
          <Calendar />
        </div>
      </div>
    </>
  );
}
