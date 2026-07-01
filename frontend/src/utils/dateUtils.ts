const LUNAR_BASE_YEAR = 1900;
const LUNAR_BASE_DATE = new Date(1900, 0, 31);

const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63,
];

export interface CalendarEvent {
  id: string;
  name: string;
  label: string;
  date: Date;
  type: 'birthday' | 'mothers_day' | 'fathers_day' | 'custom';
  relativeId?: string;
  note?: string;
}

export interface CustomReminderInput {
  id: string | number;
  title: string;
  date: string;
  relative_id?: number | null;
  note?: string | null;
  is_enabled?: boolean;
}

function parseDateOnly(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function sameMonthDay(a: Date, b: Date) {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function leapMonth(lunarYear: number): number {
  return LUNAR_INFO[lunarYear - LUNAR_BASE_YEAR] & 0xf;
}

function leapDays(lunarYear: number): number {
  if (!leapMonth(lunarYear)) return 0;
  return (LUNAR_INFO[lunarYear - LUNAR_BASE_YEAR] & 0x10000) ? 30 : 29;
}

function monthDays(lunarYear: number, lunarMonth: number): number {
  return (LUNAR_INFO[lunarYear - LUNAR_BASE_YEAR] & (0x10000 >> lunarMonth)) ? 30 : 29;
}

function lunarYearDays(lunarYear: number): number {
  let days = 348;
  for (let mask = 0x8000; mask > 0x8; mask >>= 1) {
    if (LUNAR_INFO[lunarYear - LUNAR_BASE_YEAR] & mask) days += 1;
  }
  return days + leapDays(lunarYear);
}

function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number): Date | null {
  const maxYear = LUNAR_BASE_YEAR + LUNAR_INFO.length - 1;
  if (lunarYear < LUNAR_BASE_YEAR || lunarYear > maxYear) return null;
  if (lunarMonth < 1 || lunarMonth > 12) return null;
  if (lunarDay < 1 || lunarDay > monthDays(lunarYear, lunarMonth)) return null;

  let offset = 0;
  for (let year = LUNAR_BASE_YEAR; year < lunarYear; year += 1) {
    offset += lunarYearDays(year);
  }

  const leap = leapMonth(lunarYear);
  for (let month = 1; month < lunarMonth; month += 1) {
    offset += monthDays(lunarYear, month);
    if (leap === month) offset += leapDays(lunarYear);
  }
  offset += lunarDay - 1;

  const result = new Date(LUNAR_BASE_DATE);
  result.setDate(LUNAR_BASE_DATE.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getBirthdayDateForYear(birthday: string, isLunar: boolean, year: number): Date | null {
  const birthDate = parseDateOnly(birthday);
  if (!birthDate) return null;

  if (isLunar) {
    return lunarToSolar(year, birthDate.getMonth() + 1, birthDate.getDate());
  }

  const result = new Date(year, birthDate.getMonth(), birthDate.getDate());
  result.setHours(0, 0, 0, 0);
  if (result.getMonth() !== birthDate.getMonth()) return new Date(year, 1, 28);
  return result;
}

function getNextBirthdayDate(birthday: string, isLunar: boolean, today = new Date()): Date | null {
  const normalizedToday = new Date(today);
  normalizedToday.setHours(0, 0, 0, 0);
  const thisYear = getBirthdayDateForYear(birthday, isLunar, normalizedToday.getFullYear());
  if (thisYear && thisYear >= normalizedToday) return thisYear;
  return getBirthdayDateForYear(birthday, isLunar, normalizedToday.getFullYear() + 1);
}

export function getDaysUntilBirthday(birthday: string, isLunar: boolean): number | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextBirthday = getNextBirthdayDate(birthday, isLunar, today);
  if (!nextBirthday) return null;
  return Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);
}

export function getZodiac(birthday: string): string {
  const date = parseDateOnly(birthday);
  if (!date) return '';
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const signs = [
    { sign: '摩羯座', start: [1, 1], end: [1, 19] },
    { sign: '水瓶座', start: [1, 20], end: [2, 18] },
    { sign: '双鱼座', start: [2, 19], end: [3, 20] },
    { sign: '白羊座', start: [3, 21], end: [4, 19] },
    { sign: '金牛座', start: [4, 20], end: [5, 20] },
    { sign: '双子座', start: [5, 21], end: [6, 21] },
    { sign: '巨蟹座', start: [6, 22], end: [7, 22] },
    { sign: '狮子座', start: [7, 23], end: [8, 22] },
    { sign: '处女座', start: [8, 23], end: [9, 22] },
    { sign: '天秤座', start: [9, 23], end: [10, 23] },
    { sign: '天蝎座', start: [10, 24], end: [11, 22] },
    { sign: '射手座', start: [11, 23], end: [12, 21] },
    { sign: '摩羯座', start: [12, 22], end: [12, 31] },
  ];
  return signs.find(({ start, end }) =>
    (month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])
  )?.sign || '';
}

export function getChineseZodiac(birthday: string): string {
  const date = parseDateOnly(birthday);
  if (!date) return '';
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  return animals[(date.getFullYear() - 4 + 1200) % 12];
}

export function formatDate(dateStr: string): string {
  const date = parseDateOnly(dateStr);
  if (!date) return dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMothersDay(year: number): Date {
  const may = new Date(year, 4, 1);
  const dayOfWeek = may.getDay();
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, 4, firstSunday + 7);
}

export function getFathersDay(year: number): Date {
  const june = new Date(year, 5, 1);
  const dayOfWeek = june.getDay();
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, 5, firstSunday + 14);
}

function builtInEventsForYear(
  year: number,
  relatives: Array<{ id: string; name: string; birthday: string; isLunar: boolean; relation: string }>
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  relatives.forEach((relative) => {
    const birthdayDate = getBirthdayDateForYear(relative.birthday, relative.isLunar, year);
    if (birthdayDate) {
      events.push({
        id: `birthday-${relative.id}-${year}`,
        relativeId: relative.id,
        name: relative.name,
        label: `${relative.name}生日`,
        date: birthdayDate,
        type: 'birthday',
      });
    }
  });

  const mothersDay = getMothersDay(year);
  const fathersDay = getFathersDay(year);
  relatives
    .filter((r) => ['mother', 'grandma', 'grandma_maternal'].includes(r.relation))
    .forEach((r) => events.push({
      id: `mothers-day-${r.id}-${year}`,
      relativeId: r.id,
      name: `${r.name} · 母亲节`,
      label: `${r.name} · 母亲节`,
      date: mothersDay,
      type: 'mothers_day',
    }));
  relatives
    .filter((r) => ['father', 'grandpa', 'grandpa_maternal'].includes(r.relation))
    .forEach((r) => events.push({
      id: `fathers-day-${r.id}-${year}`,
      relativeId: r.id,
      name: `${r.name} · 父亲节`,
      label: `${r.name} · 父亲节`,
      date: fathersDay,
      type: 'fathers_day',
    }));
  return events;
}

function customEvents(customReminders: CustomReminderInput[] = []): CalendarEvent[] {
  return customReminders
    .filter((item) => item.is_enabled !== false)
    .map((item) => {
      const date = parseDateOnly(item.date);
      if (!date) return null;
      return {
        id: `custom-${item.id}`,
        relativeId: item.relative_id ? String(item.relative_id) : undefined,
        name: item.title,
        label: item.title,
        date,
        type: 'custom' as const,
        note: item.note || undefined,
      };
    })
    .filter(Boolean) as CalendarEvent[];
}

export function getEventsForDate(
  date: Date,
  relatives: Array<{ id: string; name: string; birthday: string; isLunar: boolean; relation: string }>,
  reminders: CustomReminderInput[] = []
): CalendarEvent[] {
  return [...builtInEventsForYear(date.getFullYear(), relatives), ...customEvents(reminders)]
    .filter((event) => sameMonthDay(event.date, date));
}

export function getUpcomingEvents(
  relatives: Array<{ id: string; name: string; birthday: string; isLunar: boolean; relation: string }>,
  reminders: CustomReminderInput[] = []
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextYear = today.getFullYear() + 1;
  const events = [
    ...builtInEventsForYear(today.getFullYear(), relatives),
    ...builtInEventsForYear(nextYear, relatives),
    ...customEvents(reminders),
  ]
    .map((event) => ({
      ...event,
      daysUntil: Math.ceil((event.date.getTime() - today.getTime()) / 86400000),
    }))
    .filter((event) => event.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return events.slice(0, 30);
}
