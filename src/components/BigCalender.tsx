"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import { useMemo } from "react";

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: string | Date; end: string | Date; day?: string }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [date, setDate] = useState<Date>(new Date());

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleOnNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const schedule = useMemo(() => {
    // Transform raw data to Date objects. 
    // We use moment.utc().local() to ensure strings like "2025-12-20T02:30:00" 
    // are treated as UTC if they lack a zone, then converted to the user's local time.
    const lessonsWithDates = data.map((d) => ({
      ...d,
      start: moment.utc(d.start).toDate(),
      end: moment.utc(d.end).toDate(),
    }));
    return adjustScheduleToCurrentWeek(lessonsWithDates, date);
  }, [data, date]);

  return (
    <Calendar
      localizer={localizer}
      events={schedule}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      date={date}
      onNavigate={handleOnNavigate}
      style={{ height: "98%" }}
      onView={handleOnChangeView}
      min={new Date(new Date().setHours(7, 0, 0, 0))}
      max={new Date(new Date().setHours(21, 0, 0, 0))}
    />
  );
};

export default BigCalendar;
