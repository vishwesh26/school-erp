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

export const formatGrade = (level: number | string | undefined | null): string => {
  if (level === undefined || level === null || level === "") return "";
  const str = level.toString().trim();
  const num = parseInt(str, 10);

  if (num === -2 || str === "-2" || str.toLowerCase() === "nursery") return "Nursery";
  if (num === -1 || str === "-1" || str.toLowerCase() === "junior kg" || str.toLowerCase() === "jr kg") return "Junior KG";
  if (num === 0 || str === "0" || str.toLowerCase() === "senior kg" || str.toLowerCase() === "sr kg") return "Senior KG";

  if (!isNaN(num) && num > 0) return `Grade ${num}`;
  return str;
};

export const formatClassName = (name: string | undefined | null): string => {
  if (!name) return "";
  const trimmed = name.trim();

  // If already formatted like "Nursery A", "Junior KG B", "Senior KG C"
  if (/^(nursery|junior kg|senior kg|jr kg|sr kg)/i.test(trimmed)) {
    return trimmed
      .replace(/^jr kg/i, "Junior KG")
      .replace(/^sr kg/i, "Senior KG")
      .replace(/^nursery/i, "Nursery");
  }

  // Handle -2A, -2B, -2
  if (trimmed.startsWith("-2")) {
    const div = trimmed.replace("-2", "").trim();
    return div ? `Nursery ${div}` : "Nursery";
  }

  // Handle -1A, -1B, -1
  if (trimmed.startsWith("-1")) {
    const div = trimmed.replace("-1", "").trim();
    return div ? `Junior KG ${div}` : "Junior KG";
  }

  // Handle 0A, 0B, 0
  if (trimmed.startsWith("0")) {
    const div = trimmed.replace(/^0+/, "").trim();
    return div ? `Senior KG ${div}` : "Senior KG";
  }

  // Handle NurseryA (no space), JuniorKGA, SeniorKGA
  if (/^nursery[a-z]$/i.test(trimmed)) {
    return `Nursery ${trimmed.slice(-1).toUpperCase()}`;
  }
  if (/^juniorkg[a-z]$/i.test(trimmed)) {
    return `Junior KG ${trimmed.slice(-1).toUpperCase()}`;
  }
  if (/^seniorkg[a-z]$/i.test(trimmed)) {
    return `Senior KG ${trimmed.slice(-1).toUpperCase()}`;
  }

  return trimmed;
};

export const formatDate = (val: any, locale: string = "en-GB"): string => {
  if (!val) return "-";
  try {
    const d = typeof val === "string" || typeof val === "number" ? new Date(val) : val instanceof Date ? val : new Date(val);
    if (!d || isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(locale).format(d);
  } catch {
    return "-";
  }
};

export const formatDateISO = (val: any): string => {
  if (!val) return "";
  try {
    const d = typeof val === "string" || typeof val === "number" ? new Date(val) : val instanceof Date ? val : new Date(val);
    if (!d || isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const formatTime = (
  val: any,
  locale: string = "en-GB",
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false }
): string => {
  if (!val) return "-";
  try {
    const d = typeof val === "string" || typeof val === "number" ? new Date(val) : val instanceof Date ? val : new Date(val);
    if (!d || isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString(locale, options);
  } catch {
    return "-";
  }
};

