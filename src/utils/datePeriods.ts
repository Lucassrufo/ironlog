import { WorkoutRecord } from '../types/models';

export type ProgressPeriod = 'last' | 'week' | 'month' | 'year';

export interface DateRange {
  start: Date;
  end: Date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addPeriodAnchor(date: Date, period: ProgressPeriod, direction: -1 | 1) {
  const next = new Date(date);

  if (period === 'year') {
    next.setFullYear(next.getFullYear() + direction);
    return next;
  }

  if (period === 'month') {
    next.setMonth(next.getMonth() + direction);
    return next;
  }

  const days = period === 'last' ? 1 : 7;
  return addDays(next, days * direction);
}

export function getLocalDateKey(dateOrIso: Date | string) {
  const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPeriodRange(period: ProgressPeriod, anchor: Date): DateRange {
  if (period === 'last') {
    return { start: startOfDay(anchor), end: endOfDay(anchor) };
  }

  if (period === 'week') {
    return { start: startOfDay(addDays(anchor, -6)), end: endOfDay(anchor) };
  }

  if (period === 'month') {
    return {
      start: new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(anchor.getFullYear(), 0, 1, 0, 0, 0, 0),
    end: new Date(anchor.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

export function filterRecordsByRange(records: WorkoutRecord[], range: DateRange) {
  return records.filter((record) => {
    const date = new Date(record.data);
    return date >= range.start && date <= range.end;
  });
}

export function listDaysInRange(range: DateRange) {
  const days: Date[] = [];
  const current = startOfDay(range.start);
  const end = startOfDay(range.end);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}
