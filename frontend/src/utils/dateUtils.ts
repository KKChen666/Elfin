export function getDaysUntilBirthday(birthday: string, isLunar: boolean): number | null {
  if (!birthday) return null;
  if (isLunar) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;

  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  thisYearBirthday.setHours(0, 0, 0, 0);

  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = thisYearBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// 计算星座
export function getZodiac(birthday: string): string {
  if (!birthday) return '';

  const date = new Date(birthday);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacSigns = [
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
    { sign: '摩羯座', start: [12, 22], end: [12, 31] }
  ];

  for (const zodiac of zodiacSigns) {
    const [startMonth, startDay] = zodiac.start;
    const [endMonth, endDay] = zodiac.end;

    if (month === startMonth && day >= startDay || month === endMonth && day <= endDay) {
      return zodiac.sign;
    }
  }

  return '';
}

// 计算生肖
export function getChineseZodiac(birthday: string): string {
  if (!birthday) return '';

  const date = new Date(birthday);
  const year = date.getFullYear();

  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const index = (year - 4) % 12;

  return animals[index];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
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

export function getEventsForDate(
  date: Date,
  relatives: Array<{ id: string; name: string; birthday: string; isLunar: boolean; relation: string }>
): Array<{ id: string; name: string; label: string; type: 'birthday' | 'mothers_day' | 'fathers_day' }> {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const events: Array<{ id: string; name: string; label: string; type: 'birthday' | 'mothers_day' | 'fathers_day' }> = [];

  relatives.forEach(r => {
    const birthday = new Date(r.birthday);
    if (birthday.getMonth() === month && birthday.getDate() === day) {
      events.push({ id: r.id, name: r.name, label: `${r.name}生日`, type: 'birthday' });
    }
  });

  const mothersDay = getMothersDay(year);
  if (mothersDay.getMonth() === month && mothersDay.getDate() === day) {
    const familyMembers = relatives.filter(r => r.relation === 'mother' || r.relation === 'grandma' || r.relation === 'grandma_maternal');
    if (familyMembers.length > 0) {
      familyMembers.forEach(r => {
        events.push({ id: r.id, name: r.name, label: `${r.name}·母亲节`, type: 'mothers_day' });
      });
    } else {
      events.push({ id: '', name: '', label: '母亲节', type: 'mothers_day' });
    }
  }

  const fathersDay = getFathersDay(year);
  if (fathersDay.getMonth() === month && fathersDay.getDate() === day) {
    const familyMembers = relatives.filter(r => r.relation === 'father' || r.relation === 'grandpa' || r.relation === 'grandpa_maternal');
    if (familyMembers.length > 0) {
      familyMembers.forEach(r => {
        events.push({ id: r.id, name: r.name, label: `${r.name}·父亲节`, type: 'fathers_day' });
      });
    } else {
      events.push({ id: '', name: '', label: '父亲节', type: 'fathers_day' });
    }
  }

  return events;
}

export function getUpcomingEvents(relatives: Array<{ id: string; name: string; birthday: string; isLunar: boolean; relation: string }>) {
  const events: Array<{ id: string; name: string; date: Date; type: string; daysUntil: number }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const familyRelationKeys = ['mother', 'father', 'grandpa', 'grandma', 'grandpa_maternal', 'grandma_maternal', 'spouse', 'uncle', 'aunt', 'brother', 'sister', 'son', 'daughter', 'cousin'];

  relatives.forEach(relative => {
    const days = getDaysUntilBirthday(relative.birthday, relative.isLunar);
    if (days !== null) {
      const birthday = new Date(relative.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }
      events.push({
        id: relative.id,
        name: relative.name,
        date: thisYearBirthday,
        type: 'birthday',
        daysUntil: days
      });
    }

    if (familyRelationKeys.includes(relative.relation)) {
      const mothersDay = getMothersDay(today.getFullYear());
      const fathersDay = getFathersDay(today.getFullYear());

      const daysToMothers = Math.ceil((mothersDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysToFathers = Math.ceil((fathersDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysToMothers > 0 && (relative.relation === 'mother' || relative.relation === 'grandma' || relative.relation === 'grandma_maternal')) {
        events.push({
          id: relative.id,
          name: `${relative.name} · 母亲节`,
          date: mothersDay,
          type: 'mothers_day',
          daysUntil: daysToMothers
        });
      }

      if (daysToFathers > 0 && (relative.relation === 'father' || relative.relation === 'grandpa' || relative.relation === 'grandpa_maternal')) {
        events.push({
          id: relative.id,
          name: `${relative.name} · 父亲节`,
          date: fathersDay,
          type: 'fathers_day',
          daysUntil: daysToFathers
        });
      }
    }
  });

  return events.sort((a, b) => a.daysUntil - b.daysUntil);
}
