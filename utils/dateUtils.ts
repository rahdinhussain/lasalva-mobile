import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  differenceInMinutes,
  setHours,
  setMinutes,
  getDay,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = parseDateInput(date);
  return d ? format(d, formatStr) : '';
}

export function formatTime(date: string | Date): string {
  const d = parseDateInput(date);
  return d ? format(d, 'h:mm a') : '';
}

export function formatTimeRange(start: string | Date, end: string | Date): string {
  const startTime = formatTime(start);
  const endTime = formatTime(end);
  if (!startTime || !endTime) return '';
  return `${startTime} - ${endTime}`;
}

export function formatDateRange(start: Date, end: Date): string {
  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');
  
  if (startMonth === endMonth) {
    return `${format(start, 'MMM d')} — ${format(end, 'd')}`;
  }
  return `${format(start, 'MMM d')} — ${format(end, 'MMM d')}`;
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  return { start, end };
}

export function getWeekDays(date: Date): Date[] {
  const { start } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function navigateWeek(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
}

export function isSameDayCheck(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function isTodayCheck(date: Date): boolean {
  return isToday(date);
}

export function getDurationInMinutes(start: string | Date, end: string | Date): number {
  const startDate = parseDateInput(start);
  const endDate = parseDateInput(end);
  if (!startDate || !endDate) return 0;
  return differenceInMinutes(endDate, startDate);
}

const DEFAULT_TIMEZONE = 'UTC';

export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

export function resolveTimeZone(timeZone?: string | null): string {
  return timeZone || getDeviceTimeZone() || DEFAULT_TIMEZONE;
}

function parseDateInput(date: string | Date | null | undefined): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }

  if (typeof date !== 'string') return null;

  const direct = parseISO(date);
  if (isValid(direct)) return direct;

  if (date.includes(' ')) {
    const normalized = parseISO(date.replace(' ', 'T'));
    if (isValid(normalized)) return normalized;
  }

  const fallback = new Date(date);
  return isValid(fallback) ? fallback : null;
}

export function toTimeZoneDate(date: string | Date, timeZone?: string | null): Date {
  const tz = resolveTimeZone(timeZone);
  const d = parseDateInput(date);
  if (!d) return new Date(NaN);
  return toZonedTime(d, tz);
}

export function formatInTimeZoneSafe(
  date: string | Date,
  timeZone?: string | null,
  formatStr: string = 'h:mm a'
): string {
  const tz = resolveTimeZone(timeZone);
  const d = parseDateInput(date);
  if (!d) return '';
  return formatInTimeZone(d, tz, formatStr);
}

export function formatDateInTimeZone(
  date: string | Date,
  timeZone?: string | null,
  formatStr: string = 'MMM d, yyyy'
): string {
  return formatInTimeZoneSafe(date, timeZone, formatStr);
}

export function formatTimeRangeInTimeZone(
  start: string | Date,
  end: string | Date,
  timeZone?: string | null
): string {
  return `${formatInTimeZoneSafe(start, timeZone, 'h:mm a')} - ${formatInTimeZoneSafe(
    end,
    timeZone,
    'h:mm a'
  )}`;
}

export function getDateKeyInTimeZone(date: string | Date, timeZone?: string | null): string {
  return formatInTimeZoneSafe(date, timeZone, 'yyyy-MM-dd');
}

/** Hours (0-23) and minutes (0-59) in the given timezone. Use this for grid position instead of .getHours()/.getMinutes() on toTimeZoneDate. */
export function getHoursMinutesInTimeZone(
  date: string | Date,
  timeZone?: string | null
): { hours: number; minutes: number } {
  const tz = resolveTimeZone(timeZone);
  const d = parseDateInput(date);
  if (!d) return { hours: 0, minutes: 0 };
  const hours = parseInt(formatInTimeZone(d, tz, 'H'), 10);
  const minutes = parseInt(formatInTimeZone(d, tz, 'm'), 10);
  return { hours: Number.isNaN(hours) ? 0 : hours, minutes: Number.isNaN(minutes) ? 0 : minutes };
}

export function getNowInTimeZone(timeZone?: string | null): Date {
  return toTimeZoneDate(new Date(), timeZone);
}

export function getTimeSlotPosition(time: string | Date, startHour: number = 6): number {
  const d = parseDateInput(time);
  if (!d) return 0;
  const hours = d.getHours();
  const minutes = d.getMinutes();
  return (hours - startHour) * 60 + minutes;
}

export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

export function formatTimeString(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function createTimeDate(date: Date, timeStr: string): Date {
  const { hours, minutes } = parseTimeString(timeStr);
  return setMinutes(setHours(date, hours), minutes);
}

export function getDayOfWeek(date: Date): number {
  return getDay(date);
}

export function generateTimeSlots(startHour: number = 6, endHour: number = 22, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      slots.push(formatTimeString(hour, min));
    }
  }
  return slots;
}

// Get week bounds (Monday to Sunday) for API requests
export function getWeekBounds(date: Date): { startDate: string; endDate: string } {
  const { start, end } = getWeekRange(date);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

// Format a date to YYYY-MM-DD
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Parse a YYYY-MM-DD string to Date
export function fromDateString(dateStr: string): Date {
  return parseISO(dateStr);
}

// Format time string (HH:MM or HH:MM:SS) to display format (e.g., "9:00 AM")
export function formatTimeToDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get ISO day of week (Monday=0, Sunday=6) from Date
export function getISODayOfWeek(date: Date): number {
  const day = getDay(date);
  // Convert from JS (Sunday=0) to ISO (Monday=0)
  return day === 0 ? 6 : day - 1;
}

// Month View helpers
export function getMonthRange(date: Date): { start: Date; end: Date } {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

// Returns 42 days (6 weeks) for a month grid, including padding days from adjacent months
export function getMonthGridDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

// API range for month view — covers the full 6-week grid
export function getMonthGridRange(date: Date): { start: Date; end: Date } {
  const days = getMonthGridDays(date);
  return { start: days[0], end: endOfDay(days[41]) };
}

export function navigateMonth(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
}

export function navigateDay(date: Date, direction: 'prev' | 'next'): Date {
  return direction === 'next' ? addDays(date, 1) : subDays(date, 1);
}

export function getDayRange(date: Date): { start: Date; end: Date } {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function isSameMonthCheck(date1: Date, date2: Date): boolean {
  return isSameMonth(date1, date2);
}
