import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';

import {
  locale,
  getEnvironment,
  isKZ,
  cookie,
  getType,
  leadingZero,
  currencyMask,
  dateIsValid,
  toISODate,
  dateToDateShort,
  ISOToDateFormat,
  dateTime,
  dateToDateLong,
  dateToHoursMinutes,
  minutesToHoursMinutes,
  getMoscowTime,
  weekOfYear,
  weekNumberToDate,
  maskIt,
  wordEndings,
  distanceFormat,
  bytesToSize,
  convertFileToBase64,
  shortName,
  removeObjectKeys,
  deepClone,
  memo,
  searchByKeys,
  checkClipboardFunctionality,
  getUTMLabels,
} from './index';

describe('helpers', () => {
  test('locale', () => {
    expect(locale).toBe('ru-RU');
  });

  const envCases = [
    {
      url: 'http://localhost:8080/',
      expected: {
        server: 'production',
        mode: 'development',
      },
    },
    {
      url: 'http://127.0.0.1:8080/',
      expected: {
        server: 'production',
        mode: 'development',
      },
    },
    {
      url: 'https://server.verme.ru/',
      expected: {
        server: 'production',
        mode: 'production',
      },
    },
    {
      url: 'https://server.verme.kz/',
      expected: {
        server: 'production',
        mode: 'production',
      },
    },
    {
      url: 'https://server-dev.verme.ru/',
      expected: {
        server: 'dev',
        mode: 'development',
      },
    },
    {
      url: 'https://server-demo.verme.ru/',
      expected: {
        server: 'demo',
        mode: 'development',
      },
    },
    {
      url: 'https://server-rc.verme.ru/',
      expected: {
        server: 'rc',
        mode: 'development',
      },
    },
    {
      url: 'https://server-test.verme.ru/',
      expected: {
        server: 'test',
        mode: 'development',
      },
    },
  ];

  test.each(envCases)('getEnvironment', ({ url, expected }) => {
    global.window.location.assign(url);

    expect(getEnvironment()).toEqual(expected);

    global.window.location.assign('about:blank');
  });

  const kzCases = [
    {
      url: 'https://server.verme.ru/',
      expected: false,
    },
    {
      url: 'https://server.verme.kz/',
      expected: true,
    },
  ];

  test.each(kzCases)('isKZ', ({ url, expected }) => {
    global.window.location.assign(url);

    expect(isKZ()).toBe(expected);

    global.window.location.assign('about:blank');
  });

  test('cookie', () => {
    global.window.location.assign('http://localhost:8080/');

    const documentCookie = global.document.cookie;

    expect(global.document.cookie).toBe('');

    cookie.set('any_code1', 'any_value text');

    expect(global.document.cookie).toBe('any_code1=any_value%20text');
    expect(cookie.get('any_code1')).toBe('any_value text');

    expect(cookie.get('')).toBe('');

    cookie.set('', 'any_value text');

    expect(global.document.cookie).toBe('any_code1=any_value%20text');

    cookie.set('any name', 'any_value text', {
      Expires: new Date(3000, 11, 31),
      'Max-Age': 34874878946,
      SameSite: 'Strict',
      Secure: false,
    });

    expect(global.document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');
    expect(cookie.get('any name')).toBe('any_value text');

    cookie.set('outside domain', 'any_value text', {
      Domain: 'domain.com',
    });

    expect(global.document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');

    cookie.set('secure', '', {
      Secure: true,
      HttpOnly: true,
      Expires: '2023-04-15T18:20:14.057Z',
    });

    expect(global.document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');

    cookie.set('any_code3', 'any...text.42', {
      SameSite: 'Strict',
      Secure: false,
      'Max-Age': 34874878946,
    });

    expect(global.document.cookie).toBe(
      'any_code1=any_value%20text; any%20name=any_value%20text; any_code3=any...text.42',
    );

    expect(cookie.get('any_code3')).toBe('any...text.42');

    cookie.set('any_code4', '', {
      SameSite: 'Lax',
      Secure: false,
      'Max-Age': 34874878946,
    });

    expect(global.document.cookie).toBe(
      'any_code1=any_value%20text; any%20name=any_value%20text; any_code3=any...text.42; any_code4',
    );

    expect(cookie.get('any_code4')).toBe('');

    cookie.delete('any_code1');
    cookie.delete('any name');
    cookie.delete('any_code3');
    cookie.delete('any_code4');

    expect(cookie.get('any_code1')).toBe('');
    expect(cookie.get('any name')).toBe('');
    expect(cookie.get('any_code3')).toBe('');
    expect(cookie.get('any_code4')).toBe('');

    expect(global.document.cookie).toBe('');

    global.document.cookie = documentCookie;

    global.window.location.assign('about:blank');
  });

  test('getType', () => {
    expect(getType()).toBe('Undefined');
    expect(getType('')).toBe('String');
    expect(getType(null)).toBe('Null');
    expect(getType(undefined)).toBe('Undefined');
    expect(getType('string')).toBe('String');
    expect(getType(42)).toBe('Number');
    expect(getType(42.13)).toBe('Number');
    expect(getType([])).toBe('Array');
    expect(getType({})).toBe('Object');
    expect(getType(new Date())).toBe('Date');
    expect(getType(() => {})).toBe('Function');
    expect(getType(function () {})).toBe('Function');
    expect(getType(Promise.resolve())).toBe('Promise');
    expect(getType(new Proxy({}, {}))).toBe('Object');
    expect(getType(new Event('any'))).toBe('Event');
  });

  test('leadingZero', () => {
    expect(leadingZero(9)).toBe('09');
    expect(leadingZero(42)).toBe('42');
    expect(leadingZero(null)).toBe('00');
    expect(leadingZero(undefined)).toBe('00');
    expect(leadingZero('')).toBe('00');
  });

  test('currencyMask', () => {
    expect(currencyMask(1840)).toBe('1 840 ₽');
    expect(currencyMask(1840.57)).toBe('1 840,6 ₽');
    expect(currencyMask(1840.54, 2)).toBe('1 840,54 ₽');
    expect(currencyMask(null)).toBe('0 ₽');
    expect(currencyMask(undefined)).toBe('0 ₽');
    expect(currencyMask(0)).toBe('0 ₽');

    window.location.assign('https://test.verme.kz/');

    expect(currencyMask(1840)).toBe('1 840 ₸');
    expect(currencyMask(1840.54, 2)).toBe('1 840,54 ₸');

    global.window.location.assign('about:blank');
  });

  test('dateIsValid', () => {
    expect(dateIsValid()).toBe(false);
    expect(dateIsValid(new Date('22.04.2026T21:06:06+05:00'))).toBe(false);
    expect(dateIsValid(new Date('2022-32-33'))).toBe(false);
    expect(dateIsValid(new Date('2022-02-23'))).toBe(true);
  });

  test('toISODate', () => {
    const { DateTimeFormat } = Intl;

    const dateTimeFormat = vi.spyOn(global.Intl, 'DateTimeFormat');

    dateTimeFormat.mockImplementation(
      (locale, options) =>
        new DateTimeFormat(locale, {
          ...options,
          timeZone: 'Europe/Moscow',
        }),
    );

    expect(toISODate(new Date('2022-04-26T21:06:06.405296+03:00'))).toBe('2022-04-26');
    expect(toISODate(new Date('2022-04-26T21:06:06+05:00'))).toBe('2022-04-26');
    expect(toISODate(new Date('2022-32-33'))).toBe('');
    expect(toISODate(null)).toBe('');
    expect(toISODate(undefined)).toBe('');
  });

  test('dateToDateShort', () => {
    expect(dateToDateShort(new Date('2022-04-26T21:06:06.405296+03:00'))).toBe('26.04.2022');
    expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'))).toBe('26.04.2022');

    expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk')).toBe(
      '26.04.2022',
    );

    expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'), '')).toBeDefined();

    expect(dateToDateShort(new Date('2022-32-33'))).toBe('');
    expect(dateToDateShort(null)).toBe('');
    expect(dateToDateShort(undefined)).toBe('');
  });

  test('ISOToDateFormat', () => {
    expect(ISOToDateFormat('2022-04-26')).toBe('26.04.2022');
    expect(ISOToDateFormat('2022-04-26T21:06:06+05:00')).toBe('');
    expect(ISOToDateFormat(null)).toBe('');
    expect(ISOToDateFormat(undefined)).toBe('');
    expect(ISOToDateFormat('')).toBe('');
  });

  test('dateTime', () => {
    expect(dateTime(new Date('2022-04-26T21:06:06.405296+03:00'))).toBe('26.04.2022, 21:06');
    expect(dateTime(new Date('2022-04-26T21:06:06+05:00'))).toBe('26.04.2022, 19:06');

    expect(dateTime(new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk')).toBe(
      '26.04.2022, 20:06',
    );

    expect(dateTime(new Date('2022-04-26T21:06:06+05:00'), '')).toBeDefined();
    expect(dateTime(null)).toBe('');
    expect(dateTime(undefined)).toBe('');
  });

  test('dateToDateLong', () => {
    const payload = {
      date: new Date('2022-04-26T21:06:06+05:00'),
      showWeekDay: undefined,
      showYear: undefined,
      timeZone: undefined,
    };

    expect(dateToDateLong(payload)).toBe('26 апреля 2022');

    payload.date = new Date('2022-04-27T01:06:06+05:00');

    expect(dateToDateLong(payload)).toBe('26 апреля 2022');

    payload.showWeekDay = false;
    payload.showYear = true;
    payload.timeZone = 'Europe/Ulyanovsk';

    expect(dateToDateLong(payload)).toBe('27 апреля 2022');

    payload.showYear = false;

    expect(dateToDateLong(payload)).toBe('27 апреля');

    payload.date = new Date('2022-04-26T21:06:06.405296+03:00');
    payload.showWeekDay = true;
    payload.showYear = true;

    expect(dateToDateLong(payload)).toBe('вт, 26 апреля 2022');

    payload.date = new Date('2022-04-26');
    payload.showWeekDay = true;
    payload.showYear = false;

    expect(dateToDateLong(payload)).toBe('вт, 26 апреля');

    payload.showWeekDay = false;
    payload.showYear = true;
    payload.timeZone = '';

    expect(dateToDateLong(payload)).toBeDefined();

    payload.date = new Date('2022-32-33');

    expect(dateToDateLong(payload)).toBe('');

    payload.date = null;

    expect(dateToDateLong(payload)).toBe('');

    payload.date = undefined;

    expect(dateToDateLong(payload)).toBe('');

    expect(dateToDateLong()).toBe('');
  });

  test('dateToHoursMinutes', () => {
    expect(dateToHoursMinutes(new Date('2022-04-26T21:06:06.405296+03:00'))).toBe('21:06');
    expect(dateToHoursMinutes(new Date('2022-04-26T21:06:06+05:00'))).toBe('19:06');

    expect(dateToHoursMinutes(new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk')).toBe(
      '20:06',
    );

    expect(dateToHoursMinutes(new Date('2022-04-26T21:06:06+05:00'), '')).not.toBe('00:00');

    expect(dateToHoursMinutes(new Date('2022-32-33'))).toBe('00:00');
    expect(dateToHoursMinutes(null)).toBe('00:00');
    expect(dateToHoursMinutes(undefined)).toBe('00:00');
  });

  test('minutesToHoursMinutes', () => {
    expect(minutesToHoursMinutes(480)).toBe('08:00');
    expect(minutesToHoursMinutes(-480)).toBe('-08:00');
    expect(minutesToHoursMinutes(null)).toBe('00:00');
    expect(minutesToHoursMinutes(undefined)).toBe('00:00');
  });

  test('getMoscowTime', () => {
    expect(getMoscowTime('2022-05-01T09:30:00Z')).toEqual({
      hour: '12',
      minute: '30',
      timestamp: 1651397400000,
    });

    expect(getMoscowTime('2022-04-26T01:06:06+03:00')).toEqual({
      hour: '01',
      minute: '06',
      timestamp: 1650924366000,
    });

    expect(getMoscowTime('2022-05-01')).toEqual({
      hour: '03',
      minute: '00',
      timestamp: 1651363200000,
    });

    expect(getMoscowTime(null)).toEqual({
      hour: '00',
      minute: '00',
      timestamp: 0,
    });
  });

  test('weekOfYear', () => {
    expect(weekOfYear(new Date('2022-04-26T21:06:06+03:00'))).toBe(17);
    expect(weekOfYear(new Date('2021-10-21T21:06:06+05:00'))).toBe(42);
    expect(weekOfYear(new Date('2020-10-21T01:06:06+05:00'))).toBe(43);

    expect(weekOfYear()).toBeGreaterThan(0);
    expect(weekOfYear(null)).toBe(0);
  });

  test('weekNumberToDate', () => {
    expect(weekNumberToDate(2022, 17)).toStrictEqual(new Date('2022-04-24T21:00:00.000Z'));
    expect(weekNumberToDate(2021, 42)).toStrictEqual(new Date('2021-10-17T21:00:00.000Z'));
    expect(weekNumberToDate(2020, 43)).toStrictEqual(new Date('2020-10-18T21:00:00.000Z'));

    expect(weekNumberToDate(42, undefined)).toBeInstanceOf(Date);
  });

  const maskCases = [
    {
      mask: '',
      values: ['d-fg 123 t 667', 'd2g123t667'],
      expected: [
        {
          clearValue: 'dfg123t667',
          formatValue: '',
          valid: true,
        },
        {
          clearValue: 'd2g123t667',
          formatValue: '',
          valid: true,
        },
      ],
    },
    {
      mask: 'gg4k5',
      values: ['d-fg 123 t 667'],
      expected: [
        {
          clearValue: 'dfg123t667',
          formatValue: 'dfg12',
          valid: true,
        },
      ],
    },
    {
      mask: 'Z-ZZ/999 Z.999',
      values: ['', 'dfg123t667', 'd-fg 123 t 667', 'd2g123t667', 'd2g123'],
      expected: [
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
        {
          clearValue: 'dfg123t667',
          formatValue: 'd-fg/123 t.667',
          valid: true,
        },
        {
          clearValue: 'dfg123t667',
          formatValue: 'd-fg/123 t.667',
          valid: true,
        },
        {
          clearValue: 'd2g123t667',
          formatValue: 'd-2g/123 t.667',
          valid: false,
        },
        {
          clearValue: 'd2g123',
          formatValue: 'd-2g/123',
          valid: false,
        },
      ],
    },
    {
      mask: '+9 999 999-99-99',
      values: [
        70008564907,
        '80008564907',
        '70d0-0856_4.90$7',
        '+7 000 85-64-907',
        700085649,
        '70d0-0856_4.$7',
        null,
        undefined,
        '',
      ],
      expected: [
        {
          clearValue: '70008564907',
          formatValue: '+7 000 856-49-07',
          valid: true,
        },
        {
          clearValue: '80008564907',
          formatValue: '+8 000 856-49-07',
          valid: true,
        },
        {
          clearValue: '70d00856490$7',
          formatValue: '+7 0d0 085-64-90',
          valid: false,
        },
        {
          clearValue: '70008564907',
          formatValue: '+7 000 856-49-07',
          valid: true,
        },
        {
          clearValue: '700085649',
          formatValue: '+7 000 856-49',
          valid: false,
        },
        {
          clearValue: '70d008564$7',
          formatValue: '+7 0d0 085-64-$7',
          valid: false,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
      ],
    },
    {
      mask: '+7 999 xxx-xx-99',
      values: [
        80008564907,
        '80008564907',
        '90008564907',
        '70d0-0856_4.90$7',
        '+7 000 85-64-907',
        700085649,
        70008564,
        '70d0-0856_4.$7',
        null,
        undefined,
        '',
      ],
      expected: [
        {
          clearValue: '80008564907',
          formatValue: '+7 000 xxx-xx-07',
          valid: true,
        },
        {
          clearValue: '80008564907',
          formatValue: '+7 000 xxx-xx-07',
          valid: true,
        },
        {
          clearValue: '90008564907',
          formatValue: '+7 000 xxx-xx-07',
          valid: true,
        },
        {
          clearValue: '70d00856490$7',
          formatValue: '+7 0d0 xxx-xx-90',
          valid: false,
        },
        {
          clearValue: '70008564907',
          formatValue: '+7 000 xxx-xx-07',
          valid: true,
        },
        {
          clearValue: '700085649',
          formatValue: '+7 000 xxx-xx',
          valid: false,
        },
        {
          clearValue: '70008564',
          formatValue: '+7 000 xxx-x',
          valid: false,
        },
        {
          clearValue: '70d008564$7',
          formatValue: '+7 0d0 xxx-xx-$7',
          valid: false,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
      ],
    },
    {
      mask: '999-999',
      values: [
        123456,
        '',
        '1',
        '12',
        '123',
        '1234',
        '12345',
        '123456',
        '12345678',
        '12-34-56',
        '123-456',
      ],
      expected: [
        {
          clearValue: '123456',
          formatValue: '123-456',
          valid: true,
        },
        {
          clearValue: '',
          formatValue: '',
          valid: false,
        },
        {
          clearValue: '1',
          formatValue: '1',
          valid: false,
        },
        {
          clearValue: '12',
          formatValue: '12',
          valid: false,
        },
        {
          clearValue: '123',
          formatValue: '123',
          valid: false,
        },
        {
          clearValue: '1234',
          formatValue: '123-4',
          valid: false,
        },
        {
          clearValue: '12345',
          formatValue: '123-45',
          valid: false,
        },
        {
          clearValue: '123456',
          formatValue: '123-456',
          valid: true,
        },
        {
          clearValue: '12345678',
          formatValue: '123-456',
          valid: true,
        },
        {
          clearValue: '123456',
          formatValue: '123-456',
          valid: true,
        },
        {
          clearValue: '123456',
          formatValue: '123-456',
          valid: true,
        },
      ],
    },
  ];

  test.each(maskCases)('maskIt', payload => {
    const { mask, values, expected } = payload;

    values.forEach((value, index) => {
      expect(maskIt.clear(value)).toBe(expected[index].clearValue);
      expect(maskIt.format(mask, value)).toBe(expected[index].formatValue);
      expect(maskIt.check(mask, value)).toBe(expected[index].valid);
    });
  });

  test('wordEndings', () => {
    expect(wordEndings(0, ['метр', 'метра', 'метров'])).toBe('0 метров');
    expect(wordEndings('0.0', ['метр', 'метра', 'метров'])).toBe('0 метров');
    expect(wordEndings(17, ['метр', 'метра', 'метров'])).toBe('17 метров');
    expect(wordEndings('1', ['метр', 'метра', 'метров'])).toBe('1 метр');
  });

  test('distanceFormat', () => {
    expect(distanceFormat(42)).toBe('42 метра');
    expect(distanceFormat(1042)).toBe('1 км');
    expect(distanceFormat(1420)).toBe('1.4 км');
    expect(distanceFormat(42, true)).toBe('42 м');
    expect(distanceFormat('420', !!{})).toBe('420 м');
    expect(distanceFormat(null)).toBe('');
    expect(distanceFormat(undefined)).toBe('');
    expect(distanceFormat('')).toBe('');
  });

  test('bytesToSize', () => {
    expect(bytesToSize(0)).toBe('0 байт');
    expect(bytesToSize(1000)).toBe('1 000 байт');
    expect(bytesToSize(40031)).toBe('39.09 кБ');
    expect(bytesToSize(40031456)).toBe('38.18 МБ');
    expect(bytesToSize(40314564546)).toBe('37.55 ГБ');
    expect(bytesToSize(4003145646546)).toBe('3.64 ТБ');
    expect(bytesToSize(4003147895276546)).toBe('3.56 ПБ');
    expect(bytesToSize(+'40031478952795646546')).toBe('34.72 ЭБ');
    expect(bytesToSize(+'4003147895279564654656')).toBe('3.39 ЗБ');
    expect(bytesToSize(+'400314789527956465462451090')).toBe('331.13 ИБ');
  });

  test('convertFileToBase64', async () => {
    const validFileContent = '<tag1>Test file for Jest<tag1>';
    const validFile = new File([validFileContent], 'File.xml', { type: 'text/xml' });

    const validFileInBase64 = await convertFileToBase64(validFile);

    expect(validFileInBase64).toBe('PHRhZzE+VGVzdCBmaWxlIGZvciBKZXN0PHRhZzE+');

    const emptyFile = await convertFileToBase64(null);

    expect(emptyFile).toBe('');
  });

  test('shortName', () => {
    expect(shortName('Светлова Александра Андреевна')).toBe('СвеАА');
    expect(shortName('Бекр Фуркад')).toBe('БекрФ');
    expect(shortName('василий')).toBe('Васил');
    expect(shortName('42')).toBe('――');
    expect(shortName('')).toBe('――');
    expect(shortName(null)).toBe('――');
    expect(shortName(undefined)).toBe('――');
  });

  test('removeObjectKeys', () => {
    expect(removeObjectKeys(null, null)).toEqual({});
    expect(removeObjectKeys([], null)).toEqual({});
    expect(removeObjectKeys(['a'], null)).toEqual({});
    expect(removeObjectKeys(['a'], {})).toEqual({});
    expect(removeObjectKeys(['a'], { b: 42 })).toEqual({ b: 42 });

    expect(
      removeObjectKeys(['a'], {
        a: 'need remove',
        b: 42,
      }),
    ).toEqual({ b: 42 });

    expect(
      removeObjectKeys([], {
        a: 'need remove',
        b: 42,
      }),
    ).toEqual({
      a: 'need remove',
      b: 42,
    });
  });

  test('deepClone', () => {
    const sourceObject = {
      foo: 'bar',
      obj: { a: 1, b: 2 },
      array: [{ id: 1, text: 42 }, 'string'],
      any: undefined,
      number: 0,
      date: new Date('2023-03-20'),
    };

    const clonedObject = deepClone(sourceObject);

    clonedObject.obj.a = 4;
    clonedObject.array[0].id = 4;
    clonedObject.date.setFullYear(3000);

    expect(sourceObject).not.toEqual(clonedObject);

    expect(clonedObject).toEqual({
      foo: 'bar',
      obj: { a: 4, b: 2 },
      array: [{ id: 4, text: 42 }, 'string'],
      any: undefined,
      number: 0,
      date: new Date('3000-03-20'),
    });

    const sourceArray = [{ id: 1, text: 42 }, 'string'];
    const clonedArray = deepClone(sourceArray);

    clonedArray[0].id = 7;

    expect(sourceArray).not.toEqual(clonedArray);
    expect(clonedArray).toEqual([{ id: 7, text: 42 }, 'string']);

    expect(deepClone(42)).toBe(42);
    expect(deepClone('string')).toBe('string');
    expect(deepClone('')).toBe('');
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  test('memo', () => {
    const add = (x, y) => x + y;
    const memoAdd = memo(add);

    expect(memoAdd(24, 42)).toBe(66);
    expect(memoAdd(42, 24)).toBe(66);
  });

  test('searchByKeys', () => {
    expect(searchByKeys()).toEqual([]);

    expect(
      searchByKeys({
        search: '',
        options: [],
        keys: [],
      }),
    ).toEqual([]);

    const options = [
      {
        text: 'Any text content',
        sub: {
          name: 'query',
        },
      },
      {
        text: 'Content',
      },
    ];

    expect(
      searchByKeys({
        search: 'any',
        options,
        keys: [],
      }),
    ).toEqual([]);

    expect(
      searchByKeys({
        search: 'any',
        options,
        keys: ['text'],
      }),
    ).toEqual([
      {
        text: 'Any text content',
        sub: {
          name: 'query',
        },
      },
    ]);

    expect(
      searchByKeys({
        search: 'content',
        options,
        keys: ['text'],
      }),
    ).toEqual(options);

    expect(
      searchByKeys({
        search: 'query',
        options,
        keys: ['sub.name'],
      }),
    ).toEqual([
      {
        text: 'Any text content',
        sub: {
          name: 'query',
        },
      },
    ]);
  });

  describe('Check Clipboard', () => {
    const copy = (type: 'success' | 'error') => {
      if (type === 'success') {
        return value => Promise.resolve(value);
      }

      return () => Promise.reject(new Error('write text don`t support'));
    };

    const paste = (type: 'success' | 'error') => {
      if (type === 'success') {
        return () => Promise.resolve('Text from clipboard');
      }

      return () => Promise.reject(new Error('read text don`t support'));
    };

    const query = async ({ name = '' }) =>
      new Promise((resolve, reject) => {
        if (name === 'clipboard-read') {
          return resolve({
            name: 'clipboard_read',
            state: 'prompt',
            onchange: null,
          });
        }

        return reject(new Error('this name value don`t support'));
      });

    const cases = [
      {
        handleNavigator: <Navigator>{},
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: <Navigator>{
          clipboard: <Clipboard>{},
          permissions: <Permissions>{},
        },
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: <Navigator>{
          clipboard: <Clipboard>{
            writeText: copy('error'),
          },
          permissions: <Permissions>{ query },
        },
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: <Navigator>{
          clipboard: <Clipboard>{
            writeText: copy('success'),
            readText: paste('error'),
          },
          permissions: <Permissions>{
            query: query.bind(null, { name: 'any' }),
          },
        },
        expected: {
          isCanCopy: true,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: <Navigator>{
          clipboard: <Clipboard>{
            writeText: copy('success'),
            readText: paste('success'),
          },
          permissions: <Permissions>{
            query: query.bind(null, { name: 'any' }),
          },
        },
        expected: {
          isCanCopy: true,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: <Navigator>{
          clipboard: <Clipboard>{
            writeText: copy('success'),
            readText: paste('success'),
          },
          permissions: <Permissions>{ query },
        },
        expected: {
          isCanCopy: true,
          isCanPaste: true,
        },
      },
    ];

    test.each(cases)('checkClipboardFunctionality', async payload => {
      const { handleNavigator, expected } = payload;

      const { navigator } = global.window;

      delete global.window.navigator;

      global.window.navigator = handleNavigator;

      const { error } = console;

      console.error = vi.fn();

      const { copy, paste } = await checkClipboardFunctionality();

      expect(copy).toBe(expected.isCanCopy);
      expect(paste).toBe(expected.isCanPaste);

      global.window.navigator = navigator;
      console.error = error;
    });
  });

  const utmCases = [
    {
      locationSearch: '',
      expected: null,
    },
    {
      locationSearch: '?',
      expected: null,
    },
    {
      locationSearch: '?utm_',
      expected: { '': '' },
    },
    {
      locationSearch: '?utm_promocode=',
      expected: { promocode: '' },
    },
    {
      locationSearch: '?utm_promocode=bpdigital',
      expected: { promocode: 'bpdigital' },
    },
    {
      locationSearch: '?utm_promocode=bpdigital',
      expected: { promocode: 'bpdigital' },
    },
    {
      locationSearch: '?utm_promocode=bpdigital   ',
      expected: { promocode: 'bpdigital' },
    },
    {
      locationSearch: '?utm_promocode=bpdigital&id=42&shift=174',
      expected: { promocode: 'bpdigital' },
    },
    {
      locationSearch: '?utm_key1=key1&utm_key2=key2',
      expected: {
        key1: 'key1',
        key2: 'key2',
      },
    },
  ];

  test.each(utmCases)('getUTMLabels', async payload => {
    const { locationSearch, expected } = payload;

    global.window.location.assign(`https://shifts.verme.ru/${locationSearch}`);

    const labels = await getUTMLabels();

    expect(labels).toEqual(expected);

    global.window.location.assign('about:blank');
  });
});
