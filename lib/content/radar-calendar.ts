const DAY_MS = 86_400_000;
export const RADAR_TIME_ZONE = "Asia/Shanghai";
export function beijingDay(value: Date | string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error("INVALID_RADAR_DATE");
  return new Date(date.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);
}
export function dayStart(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("INVALID_RADAR_DAY");
  const date = new Date(day + "T00:00:00+08:00");
  if (!Number.isFinite(date.getTime()) || beijingDay(date) !== day) throw new Error("INVALID_RADAR_DAY");
  return date;
}
export function previousDay(day: string) { return beijingDay(new Date(dayStart(day).getTime() - DAY_MS)); }
export function nextHistoryDay(items: Array<{ timelineAt: Date | string }>, before: Date) {
  const times = items.map(item => new Date(item.timelineAt).getTime()).filter(at => Number.isFinite(at) && at < before.getTime());
  if (!times.length) return null;
  return beijingDay(new Date(times.reduce((latest, at) => Math.max(latest, at), -Infinity)));
}
export function calendarWindow(now = new Date(), days = 7) {
  const today = beijingDay(now);
  const from = new Date(dayStart(today).getTime() - (days - 1) * DAY_MS);
  return { from, to: now, firstDay: beijingDay(from), today, timeZone: RADAR_TIME_ZONE };
}
export function selectCalendarItems<T extends { eventId: string; timelineAt: Date | string }>(items: T[], window: { from: Date; to: Date }) {
  return [...new Map(items.filter(item => {
    const at = new Date(item.timelineAt).getTime();
    return at >= window.from.getTime() && at < window.to.getTime();
  }).map(item => [item.eventId, item])).values()].sort((a, b) => new Date(b.timelineAt).getTime() - new Date(a.timelineAt).getTime() || b.eventId.localeCompare(a.eventId));
}
