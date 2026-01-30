// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

const getLatestMonday = (baseDate: Date): Date => {
  const dayOfWeek = baseDate.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = new Date(baseDate);
  latestMonday.setDate(baseDate.getDate() - daysSinceMonday);
  return latestMonday;
};

const dayMap: { [key: string]: number } = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date; day?: string }[],
  referenceDate: Date = new Date()
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday(referenceDate);

  return lessons.map((lesson) => {
    // Priority: use the explicit 'day' enum if available, otherwise fallback to Date.getDay()
    let lessonDayOfWeek: number;
    if (lesson.day && dayMap[lesson.day.toUpperCase()] !== undefined) {
      lessonDayOfWeek = dayMap[lesson.day.toUpperCase()];
    } else {
      lessonDayOfWeek = lesson.start.getDay();
    }

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);
    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);

    // We must use getTime components to avoid TZ shifts when re-setting hours on a new date object on server.
    // However, setHours on a Date object with the same hours/minutes as original is generally safe
    // IF we are careful.
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};
