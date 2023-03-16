import { jest, beforeEach, afterEach, describe, test, expect } from '@jest/globals';

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
} from './helpers';

describe('helpers.js', () => {
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
    const { location } = global.window;

    delete global.window.location;

    global.window.location = new URL(url);

    expect(getEnvironment()).toEqual(expected);

    global.window.location = location;
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
    const { location } = global.window;

    delete global.window.location;

    global.window.location = new URL(url);

    expect(isKZ()).toBe(expected);

    global.window.location = location;
  });

  test('cookie', () => {
    const documentCookie = global.document.cookie;

    expect(global.document.cookie).toBe('');

    cookie.set('any_code1', 'any_value text');

    expect(global.document.cookie).toBe('any_code1=any_value%20text');
    expect(cookie.get('any_code1')).toBe('any_value text');

    expect(cookie.get()).toBe('');
    expect(cookie.get('')).toBe('');

    cookie.set('', 'any_value text');

    expect(global.document.cookie).toBe('any_code1=any_value%20text');

    cookie.set('any name', 'any_value text', {
      any_code: 'any_value',
      page: 42,
      expires: new Date(3000, 11, 31),
      'Max-Age': 34874878946,
      SameSite: 'Strict',
      Secure: '',
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
      expires: '2023-04-15T18:20:14.057Z',
    });

    expect(global.document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');

    cookie.set('any_code3', 'any...text.42', {
      any_code: 'any_value',
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
    expect(currencyMask('')).toBe('0 ₽');

    global.window = Object.create(window);

    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'test.server.kz',
      },
    });

    expect(currencyMask(1840)).toBe('1 840 ₸');
    expect(currencyMask(1840.54, 2)).toBe('1 840,54 ₸');
  });

  test('dateIsValid', () => {
    expect(dateIsValid()).toBe(false);
    expect(dateIsValid('')).toBe(false);
    expect(dateIsValid('2023-01-01')).toBe(false);
    expect(dateIsValid(1675449307553)).toBe(false);
    expect(dateIsValid(new Date('22.04.2026T21:06:06+05:00'))).toBe(false);
    expect(dateIsValid(new Date('2022-32-33'))).toBe(false);
    expect(dateIsValid(new Date('2022-02-23'))).toBe(true);
  });

  test('toISODate', () => {
    const { DateTimeFormat } = Intl;

    const dateTimeFormat = jest.spyOn(global.Intl, 'DateTimeFormat');

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
    expect(toISODate('2022-01-01')).toBe('');
    expect(toISODate('2022-32-33')).toBe('');
    expect(toISODate('asdf')).toBe('');
    expect(toISODate('one-two-20')).toBe('');
    expect(toISODate(null)).toBe('');
    expect(toISODate(undefined)).toBe('');
    expect(toISODate('')).toBe('');
  });

  test('dateToDateShort', () => {
    expect(dateToDateShort(new Date('2022-04-26T21:06:06.405296+03:00'))).toBe('26.04.2022');
    expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'))).toBe('26.04.2022');

    expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk')).toBe(
      '26.04.2022',
    );

    expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'), '')).toBeDefined();

    expect(dateToDateShort(new Date('2022-32-33'))).toBe('');
    expect(dateToDateShort('2022-01-01')).toBe('');
    expect(dateToDateShort('2022-32-33')).toBe('');
    expect(dateToDateShort('asdf')).toBe('');
    expect(dateToDateShort('one-two-20')).toBe('');
    expect(dateToDateShort(null)).toBe('');
    expect(dateToDateShort(undefined)).toBe('');
    expect(dateToDateShort('')).toBe('');
  });

  test('ISOToDateFormat', () => {
    expect(ISOToDateFormat('2022-04-26')).toBe('26.04.2022');
    expect(ISOToDateFormat(new Date('2022-04-26'))).toBe('');
    expect(ISOToDateFormat(42)).toBe('');
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
    expect(dateTime('2022-01-01')).toBe('');
    expect(dateTime(null)).toBe('');
    expect(dateTime(undefined)).toBe('');
    expect(dateTime('')).toBe('');
  });

  test('dateToDateLong', () => {
    const payload = {
      date: new Date('2022-04-26T21:06:06+05:00'),
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

    payload.date = '2022-01-01';

    expect(dateToDateLong(payload)).toBe('');

    payload.date = '2022-32-33';

    expect(dateToDateLong(payload)).toBe('');

    payload.date = 'asdf';

    expect(dateToDateLong(payload)).toBe('');

    payload.date = 'one-two-20';

    expect(dateToDateLong(payload)).toBe('');

    payload.date = null;

    expect(dateToDateLong(payload)).toBe('');

    payload.date = undefined;

    expect(dateToDateLong(payload)).toBe('');

    payload.date = '';

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
    expect(dateToHoursMinutes('2022-01-01')).toBe('00:00');
    expect(dateToHoursMinutes('2022-32-33')).toBe('00:00');
    expect(dateToHoursMinutes('asdf')).toBe('00:00');
    expect(dateToHoursMinutes('one-two-20')).toBe('00:00');
    expect(dateToHoursMinutes(null)).toBe('00:00');
    expect(dateToHoursMinutes(undefined)).toBe('00:00');
    expect(dateToHoursMinutes('')).toBe('00:00');
  });

  test('minutesToHoursMinutes', () => {
    expect(minutesToHoursMinutes(480)).toBe('08:00');
    expect(minutesToHoursMinutes(-480)).toBe('-08:00');
    expect(minutesToHoursMinutes('420')).toBe('00:00');
    expect(minutesToHoursMinutes(null)).toBe('00:00');
    expect(minutesToHoursMinutes(undefined)).toBe('00:00');
    expect(minutesToHoursMinutes('')).toBe('00:00');
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

    expect(getMoscowTime()).toEqual({
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

    expect(weekOfYear(42)).toBe(0);
    expect(weekOfYear('2022-01-01')).toBe(0);
    expect(weekOfYear(null)).toBe(0);
    expect(weekOfYear('')).toBe(0);
  });

  test('weekNumberToDate', () => {
    expect(weekNumberToDate(2022, 17)).toStrictEqual(new Date('2022-04-24T21:00:00.000Z'));
    expect(weekNumberToDate(2021, 42)).toStrictEqual(new Date('2021-10-17T21:00:00.000Z'));
    expect(weekNumberToDate(2020, 43)).toStrictEqual(new Date('2020-10-18T21:00:00.000Z'));

    expect(weekNumberToDate(42, undefined)).toBeInstanceOf(Date);
    expect(weekNumberToDate('2022', 17)).toBeInstanceOf(Date);
    expect(weekNumberToDate('2022-01-01')).toBeInstanceOf(Date);
    expect(weekNumberToDate(null)).toBeInstanceOf(Date);
    expect(weekNumberToDate(undefined)).toBeInstanceOf(Date);
    expect(weekNumberToDate('')).toBeInstanceOf(Date);
  });

  test('wordEndings', () => {
    expect(wordEndings(0, ['метр', 'метра', 'метров'])).toBe('0 метров');
    expect(wordEndings(17, ['метр', 'метра', 'метров'])).toBe('17 метров');
    expect(wordEndings('1', ['метр', 'метра', 'метров'])).toBe('1 метр');
    expect(wordEndings('42')).toBe('');
    expect(wordEndings('42', ['метр', 'метра'])).toBe('');
    expect(wordEndings('420', {})).toBe('');
    expect(wordEndings(null)).toBe('');
    expect(wordEndings(undefined)).toBe('');
    expect(wordEndings('')).toBe('');
  });

  test('distanceFormat', () => {
    expect(distanceFormat(42)).toBe('42 метра');
    expect(distanceFormat(1042)).toBe('1 км');
    expect(distanceFormat(1420)).toBe('1.4 км');
    expect(distanceFormat(42, true)).toBe('42 м');
    expect(distanceFormat('420', {})).toBe('420 м');
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
    expect(shortName('')).toBe('――');
    expect(shortName(0)).toBe('――');
    expect(shortName(400)).toBe('――');
    expect(shortName(null)).toBe('――');
    expect(shortName(undefined)).toBe('――');
    expect(shortName({})).toBe('――');
    expect(shortName([])).toBe('――');
  });

  test('removeObjectKeys', () => {
    expect(removeObjectKeys()).toEqual({});
    expect(removeObjectKeys(null)).toEqual({});
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
    const errorCopy = async () => Promise.reject(new Error('write text don`t support'));
    const errorPaste = async () => Promise.reject(new Error('read text don`t support'));
    const successCopy = async value => value;
    const successPaste = async () => 'Text from clipboard';

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

    const originalNavigator = window.navigator;
    const originalConsole = console.error;

    beforeEach(() => {
      delete window.navigator;

      console.error = jest.fn();
    });

    afterEach(() => {
      global.window.navigator = originalNavigator;
      console.error = originalConsole;
    });

    const cases = [
      {
        navigator: {},
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        navigator: {
          clipboard: {},
          permissions: {},
        },
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        navigator: {
          clipboard: {
            writeText: errorCopy,
          },
          permissions: { query },
        },
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        navigator: {
          clipboard: {
            writeText: successCopy,
            readText: errorPaste,
          },
          permissions: {
            query: query.bind(null, { name: 'any' }),
          },
        },
        expected: {
          isCanCopy: true,
          isCanPaste: false,
        },
      },
      {
        navigator: {
          clipboard: {
            writeText: successCopy,
            readText: successPaste,
          },
          permissions: {
            query: query.bind(null, { name: 'any' }),
          },
        },
        expected: {
          isCanCopy: true,
          isCanPaste: false,
        },
      },
      {
        navigator: {
          clipboard: {
            writeText: successCopy,
            readText: successPaste,
          },
          permissions: { query },
        },
        expected: {
          isCanCopy: true,
          isCanPaste: true,
        },
      },
    ];

    test.each(cases)('checkClipboardFunctionality', async payload => {
      const { navigator, expected } = payload;

      global.window.navigator = navigator;

      const { copy, paste } = await checkClipboardFunctionality();

      expect(copy).toBe(expected.isCanCopy);
      expect(paste).toBe(expected.isCanPaste);
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
    const { location } = window;

    delete window.location;

    const { locationSearch, expected } = payload;

    global.window.location = new URL(`https://shifts.verme.ru/${locationSearch}`);

    const labels = await getUTMLabels();

    expect(labels).toEqual(expected);

    global.window.location = location;
  });
});
