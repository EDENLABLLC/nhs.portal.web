import React from "react";

const WEEK_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const TodayWorkingHours = ({ workingHours }) => {
  const today = new Date();
  const day = WEEK_DAYS[today.getDay()];
  const timeRanges = workingHours[day];

  const isOpen = checkOpen(today, timeRanges);

  return (
    <div className="today-working-hours">
      <div className="today-working-hours__status">
        {isOpen ? "Відчинено" : "Зачинено"}
        {": "}
      </div>
      <div className="today-working-hours__hours">
        {timeRanges.map(([from, till], index) => (
          <div key={index}>
            <span className="working-hours__hour working-hours__hour-from">
              {from}
            </span>
            {" — "}
            <span className="working-hours__hour working-hours__hour-till">
              {till}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayWorkingHours;

const checkOpen = (date, timeRanges) =>
  timeRanges.some(([from, till]) => {
    const [fromHours, fromMinutes] = from.split(".").map(s => parseInt(s, 10));
    const [tillHours, tillMinutes] = till.split(".").map(s => parseInt(s, 10));
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return (
      (hours > fromHours || (hours === fromHours && minutes > fromMinutes)) &&
      (hours < tillHours || (hours === tillHours && minutes < tillMinutes))
    );
  });
