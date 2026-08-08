"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";
import FormModal from "./FormModal";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const localizer = momentLocalizer(moment);

type LessonEvent = {
  id?: number;
  title: string;
  start: string | Date;
  end: string | Date;
  day?: string;
  subject?: any;
  class?: any;
  teacher?: any;
  rawLesson?: any;
};

const BigCalendar = ({
  data,
  role,
  currentUserId,
  relatedData,
}: {
  data: LessonEvent[];
  role?: string;
  currentUserId?: string;
  relatedData?: any;
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<LessonEvent | null>(null);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleOnNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  const schedule = useMemo(() => {
    const lessonsWithDates = data.map((d) => ({
      ...d,
      start: moment.utc(d.start).toDate(),
      end: moment.utc(d.end).toDate(),
    }));
    return adjustScheduleToCurrentWeek(lessonsWithDates, date);
  }, [data, date]);

  const canEdit = (role === "admin" || role === "teacher") && selectedEvent?.rawLesson;

  return (
    <div className="relative h-full">
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
        onSelectEvent={handleSelectEvent}
        min={new Date(new Date().setHours(7, 0, 0, 0))}
        max={new Date(new Date().setHours(21, 0, 0, 0))}
      />

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>

            <div className="flex items-center justify-between mb-4 pr-6">
              <h2 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h2>
              {canEdit && (
                <div className="flex items-center gap-2">
                  <FormModal
                    table="lesson"
                    type="update"
                    data={selectedEvent.rawLesson}
                    relatedData={relatedData}
                  />
                  <FormModal
                    table="lesson"
                    type="delete"
                    id={selectedEvent.id}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm text-gray-600 border-t border-b border-gray-100 py-4 my-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500">Subject:</span>
                <span className="font-medium text-gray-800">{selectedEvent.subject?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500">Class:</span>
                <span className="font-medium text-gray-800">{selectedEvent.class?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500">Teacher:</span>
                <span className="font-medium text-gray-800">
                  {selectedEvent.teacher
                    ? `${selectedEvent.teacher.name} ${selectedEvent.teacher.surname}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500">Time:</span>
                <span className="font-medium text-gray-800">
                  {moment(selectedEvent.start).format("h:mm A")} - {moment(selectedEvent.end).format("h:mm A")}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BigCalendar;
