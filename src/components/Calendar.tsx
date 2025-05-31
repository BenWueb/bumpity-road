const Calendar = () => {
  return (
    <div className="flex-1">
      <iframe
        src={`https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FLos_Angeles&showPrint=0&showTitle=0&showNav=0&mode=AGENDA&showTz=0&showCalendars=0&src=${process.env.GOOGLE_CALENDAR_ID}&color=%23AD1457`}
        className="h-[400px] w-full rounded-xl"
      ></iframe>
    </div>
  );
};

export default Calendar;
