import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function getResolvedTimeZone(timeZone?: string | null) {
  return timeZone || getBrowserTimeZone();
}

function formatMonthForTimeZone(date: Date, timeZone?: string | null) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: getResolvedTimeZone(timeZone),
  }).format(date);
}

export function formatLocalDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatZonedDate(
  dateInput: string | Date,
  options: Intl.DateTimeFormatOptions,
  locales?: string | string[],
  timeZone?: string | null,
) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  return new Intl.DateTimeFormat(locales, {
    ...options,
    timeZone: getResolvedTimeZone(timeZone),
  }).format(date);
}

export function formatUtcDate(
  dateInput: string | Date,
  options: Intl.DateTimeFormatOptions,
  locales?: string | string[],
  timeZone?: string | null,
) {
  return formatZonedDate(dateInput, options, locales, timeZone);
}

export function formatZonedTime(
  dateInput: string | Date,
  {
    locales = "en-US",
    spacedMeridiem = true,
    timeZone,
  }: {
    locales?: string | string[];
    spacedMeridiem?: boolean;
    timeZone?: string | null;
  } = {},
) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const formattedTime = new Intl.DateTimeFormat(locales, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: getResolvedTimeZone(timeZone),
  }).format(date);

  return spacedMeridiem
    ? formattedTime
    : formattedTime.replace(/\s(?=[AP]M$)/, "");
}

export function formatZonedTimeRange(
  startDateInput: string | Date,
  endDateInput: string | Date,
  options?: {
    locales?: string | string[];
    spacedMeridiem?: boolean;
    timeZone?: string | null;
  },
) {
  return `${formatZonedTime(startDateInput, options)} - ${formatZonedTime(endDateInput, options)}`;
}

export function getZonedAppointmentDateTime(
  scheduledStartAtUtc?: string | null,
  scheduledEndAtUtc?: string | null,
  timeZone?: string | null,
) {
  if (!scheduledStartAtUtc || !scheduledEndAtUtc) {
    return { date: { day: 0, month: "N/A" }, time: "N/A" };
  }

  const startDate = new Date(scheduledStartAtUtc);
  const endDate = new Date(scheduledEndAtUtc);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { date: { day: 0, month: "N/A" }, time: "N/A" };
  }

  const resolvedTimeZone = getResolvedTimeZone(timeZone);

  return {
    date: {
      day: parseInt(
        new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          timeZone: resolvedTimeZone,
        }).format(startDate),
      ),
      month: formatMonthForTimeZone(startDate, resolvedTimeZone),
    },
    time: formatZonedTimeRange(scheduledStartAtUtc, scheduledEndAtUtc, {
      spacedMeridiem: false,
      timeZone: resolvedTimeZone,
    }),
  };
}

// ─── Video session error handling ──────────────────────────────────────────

export function isScheduledTimeError(
  error: unknown,
): error is { response: { data: { response_code: string } } } {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = error.response.data as Record<string, unknown>;
    const message = (data.message as string) || "";
    const code = data.response_code as string;
    return message.includes("scheduled time") || code === "006";
  }
  return false;
}

export function extractScheduledTimeFromError(error: unknown): Date | null {
  if (!error || typeof error !== "object") return null;

  const errorObj = error as Record<string, unknown>;
  const message =
    (errorObj.response as Record<string, unknown>)?.data &&
    typeof (errorObj.response as Record<string, unknown>).data === "object"
      ? (
          (errorObj.response as Record<string, unknown>).data as Record<
            string,
            unknown
          >
        ).message
      : errorObj.message;

  const errorMessage = typeof message === "string" ? message : "";
  // Match ISO datetime format like "2026-04-19T21:00:00.000Z"
  const match = errorMessage.match(
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)/,
  );
  if (match?.[1]) {
    return new Date(match[1]);
  }
  return null;
}

export function formatScheduledTimeMessage(scheduledTime: Date): string {
  return scheduledTime.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
