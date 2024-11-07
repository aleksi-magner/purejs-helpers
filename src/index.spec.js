import { vi, describe, test, expect } from 'vitest';

import {
  locale,
  getEnvironment,
  isKZ,
  cookie,
  getType,
  leadingZero,
  currencyMask,
  wordEndings,
  distanceFormat,
  bytesToSize,
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
  convertFileToBase64,
  shortName,
  removeObjectKeys,
  deepClone,
  memo,
  fuzzySearch,
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
        isLocal: true,
        mode: 'development',
      },
    },
    {
      url: 'http://127.0.0.1:8080/',
      expected: {
        server: 'production',
        isLocal: true,
        mode: 'development',
      },
    },
    {
      url: 'https://server.verme.ru/',
      expected: {
        server: 'production',
        isLocal: false,
        mode: 'production',
      },
    },
    {
      url: 'https://server.verme.kz/',
      expected: {
        server: 'production',
        isLocal: false,
        mode: 'production',
      },
    },
    {
      url: 'https://server-dev.verme.ru/',
      expected: {
        server: 'dev',
        isLocal: false,
        mode: 'development',
      },
    },
    {
      url: 'https://server-demo.verme.ru/',
      expected: {
        server: 'demo',
        isLocal: false,
        mode: 'development',
      },
    },
    {
      url: 'https://server-rc.verme.ru/',
      expected: {
        server: 'rc',
        isLocal: false,
        mode: 'development',
      },
    },
    {
      url: 'https://server-test.verme.ru/',
      expected: {
        server: 'test',
        isLocal: false,
        mode: 'development',
      },
    },
  ];

  test.each(envCases)('getEnvironment', ({ url, expected }) => {
    window.location.assign(url);

    expect(getEnvironment('verme')).toEqual(expected);

    window.location.assign('about:blank');
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
    window.location.assign(url);

    expect(isKZ()).toBe(expected);

    window.location.assign('about:blank');
  });

  test('cookie', () => {
    window.location.assign('http://localhost:8080/');

    const documentCookie = document.cookie;

    expect(document.cookie).toBe('');

    cookie.set('any_code1', 'any_value text');

    expect(document.cookie).toBe('any_code1=any_value%20text');
    expect(cookie.get('any_code1')).toBe('any_value text');

    expect(cookie.get('')).toBe('');

    cookie.set('', 'any_value text');

    expect(document.cookie).toBe('any_code1=any_value%20text');

    cookie.set('any name', 'any_value text', {
      Expires: new Date(3000, 11, 31),
      'Max-Age': 34874878946,
      SameSite: 'Strict',
      Secure: false,
    });

    expect(document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');
    expect(cookie.get('any name')).toBe('any_value text');

    cookie.set('outside domain', 'any_value text', {
      Domain: 'domain.com',
    });

    expect(document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');

    cookie.set('secure', '', {
      Secure: true,
      HttpOnly: true,
      Expires: '2023-04-15T18:20:14.057Z',
      WrongField: '2023-04-15T18:20:14.057Z',
    });

    expect(document.cookie).toBe('any_code1=any_value%20text; any%20name=any_value%20text');

    cookie.set('any_code3', 'any...text.42', {
      SameSite: 'Strict',
      Secure: false,
      'Max-Age': 34874878946,
    });

    expect(document.cookie).toBe(
      'any_code1=any_value%20text; any%20name=any_value%20text; any_code3=any...text.42',
    );

    expect(cookie.get('any_code3')).toBe('any...text.42');

    cookie.set('any_code4', '', {
      SameSite: 'Lax',
      Secure: false,
      'Max-Age': 34874878946,
    });

    expect(document.cookie).toBe(
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

    expect(document.cookie).toBe('');

    document.cookie = documentCookie;

    window.location.assign('about:blank');
  });

  const getTypeCases = [
    {
      param: undefined,
      expected: 'Undefined',
    },
    {
      param: null,
      expected: 'Null',
    },
    {
      param: '',
      expected: 'String',
    },
    {
      param: 'string',
      expected: 'String',
    },
    {
      param: 42,
      expected: 'Number',
    },
    {
      param: 42.13,
      expected: 'Number',
    },
    {
      param: [],
      expected: 'Array',
    },
    {
      param: {},
      expected: 'Object',
    },
    {
      param: new Date(),
      expected: 'Date',
    },
    {
      param: () => {},
      expected: 'Function',
    },
    {
      param: function () {},
      expected: 'Function',
    },
    {
      param: Promise.resolve(),
      expected: 'Promise',
    },
    {
      param: new Proxy({}, {}),
      expected: 'Object',
    },
    {
      param: new Event('any'),
      expected: 'Event',
    },
  ];

  test.each(getTypeCases)('getType', payload => {
    const { param, expected } = payload;

    expect(getType(param)).toBe(expected);
  });

  const leadingZeroCases = [
    {
      param: undefined,
      expected: '00',
    },
    {
      param: null,
      expected: '00',
    },
    {
      param: '',
      expected: '00',
    },
    {
      param: 9,
      expected: '09',
    },
    {
      param: 42,
      expected: '42',
    },
  ];

  test.each(leadingZeroCases)('leadingZero', payload => {
    const { param, expected } = payload;

    expect(leadingZero(param)).toBe(expected);
  });

  describe('Check currencyMask', () => {
    const currencyMaskCases = [
      {
        params: [undefined],
        expected: '0 ₽',
      },
      {
        params: [null],
        expected: '0 ₽',
      },
      {
        params: [0],
        expected: '0 ₽',
      },
      {
        params: [1840],
        expected: '1 840 ₽',
      },
      {
        params: [1840.57],
        expected: '1 840,6 ₽',
      },
      {
        params: [1840.54, 2],
        expected: '1 840,54 ₽',
      },
    ];

    test.each(currencyMaskCases)('RU server', payload => {
      const { params, expected } = payload;

      expect(currencyMask(...params)).toBe(expected);
    });

    test('KZ server', () => {
      window.location.assign('https://test.verme.kz/');

      expect(currencyMask(1840)).toBe('1 840 ₸');
      expect(currencyMask(1840.54, 2)).toBe('1 840,54 ₸');

      window.location.assign('about:blank');
    });
  });

  const wordEndingsMaskCases = [
    {
      params: [0, ['метр', 'метра', 'метров']],
      expected: '0 метров',
    },
    {
      params: ['0.0', ['метр', 'метра', 'метров']],
      expected: '0 метров',
    },
    {
      params: [17, ['метр', 'метра', 'метров']],
      expected: '17 метров',
    },
    {
      params: ['1', ['метр', 'метра', 'метров']],
      expected: '1 метр',
    },
  ];

  test.each(wordEndingsMaskCases)('wordEndings', payload => {
    const { params, expected } = payload;

    expect(wordEndings(...params)).toBe(expected);
  });

  const distanceFormatCases = [
    {
      params: [undefined],
      expected: '',
    },
    {
      params: [null],
      expected: '',
    },
    {
      params: [''],
      expected: '',
    },
    {
      params: [42],
      expected: '42 метра',
    },
    {
      params: [42, true],
      expected: '42 м',
    },
    {
      params: ['420', !!{}],
      expected: '420 м',
    },
    {
      params: [1042],
      expected: '1 км',
    },
    {
      params: [1420],
      expected: '1.4 км',
    },
  ];

  test.each(distanceFormatCases)('distanceFormat', payload => {
    const { params, expected } = payload;

    expect(distanceFormat(...params)).toBe(expected);
  });

  const bytesToSizeCases = [
    {
      param: 0,
      expected: '0 байт',
    },
    {
      param: 1000,
      expected: '1 000 байт',
    },
    {
      param: 40031,
      expected: '39.09 кБ',
    },
    {
      param: 40031456,
      expected: '38.18 МБ',
    },
    {
      param: 40314564546,
      expected: '37.55 ГБ',
    },
    {
      param: 4003145646546,
      expected: '3.64 ТБ',
    },
    {
      param: 4003147895276546,
      expected: '3.56 ПБ',
    },
    {
      param: +'40031478952795646546',
      expected: '34.72 ЭБ',
    },
    {
      param: +'4003147895279564654656',
      expected: '3.39 ЗБ',
    },
    {
      param: +'400314789527956465462451090',
      expected: '331.13 ИБ',
    },
  ];

  test.each(bytesToSizeCases)('bytesToSize', payload => {
    const { param, expected } = payload;

    expect(bytesToSize(param)).toBe(expected);
  });

  const dateIsValidCases = [
    {
      param: undefined,
      expected: false,
    },
    {
      param: new Date('22.04.2026T21:06:06+05:00'),
      expected: false,
    },
    {
      param: new Date('2022-32-33'),
      expected: false,
    },
    {
      param: new Date('2022-02-23'),
      expected: true,
    },
  ];

  test.each(dateIsValidCases)('dateIsValid', payload => {
    const { param, expected } = payload;

    expect(dateIsValid(param)).toBe(expected);
  });

  const toISODateCases = [
    {
      param: undefined,
      expected: '',
    },
    {
      param: null,
      expected: '',
    },
    {
      param: new Date('2022-32-33'),
      expected: '',
    },
    {
      param: new Date('2022-04-26T21:06:06.405296+03:00'),
      expected: '2022-04-26',
    },
    {
      param: new Date('2022-04-26T21:06:06+05:00'),
      expected: '2022-04-26',
    },
  ];

  test.each(toISODateCases)('toISODate', payload => {
    const { DateTimeFormat } = window.Intl;

    const dateTimeFormat = vi.spyOn(window.Intl, 'DateTimeFormat');

    dateTimeFormat.mockImplementation(
      (locale, options) =>
        new DateTimeFormat(locale, {
          ...options,
          timeZone: 'Europe/Moscow',
        }),
    );

    const { param, expected } = payload;

    expect(toISODate(param)).toBe(expected);

    window.Intl.DateTimeFormat = DateTimeFormat;
  });

  describe('Check dateToDateShort', () => {
    const dateToDateShortCases = [
      {
        params: [undefined],
        expected: '',
      },
      {
        params: [null],
        expected: '',
      },
      {
        params: [new Date('2022-32-33')],
        expected: '',
      },
      {
        params: [new Date('2022-04-26T21:06:06.405296+03:00')],
        expected: '26.04.2022',
      },
      {
        params: [new Date('2022-04-26T21:06:06+05:00')],
        expected: '26.04.2022',
      },
      {
        params: [new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk'],
        expected: '26.04.2022',
      },
    ];

    test.each(dateToDateShortCases)('Convert to Moscow timezone', payload => {
      const { params, expected } = payload;

      expect(dateToDateShort(...params)).toBe(expected);
    });

    test('Convert to local timezone', () => {
      expect(dateToDateShort(new Date('2022-04-26T21:06:06+05:00'), '')).toBeDefined();
    });
  });

  const ISOToDateFormatCases = [
    {
      param: undefined,
      expected: '',
    },
    {
      param: null,
      expected: '',
    },
    {
      param: '',
      expected: '',
    },
    {
      param: 42,
      expected: '',
    },
    {
      param: '2022-04-26',
      expected: '26.04.2022',
    },
    {
      param: '2022-04-26T21:06:06+05:00',
      expected: '',
    },
  ];

  test.each(ISOToDateFormatCases)('ISOToDateFormat', payload => {
    const { param, expected } = payload;

    expect(ISOToDateFormat(param)).toBe(expected);
  });

  describe('Check dateTime', () => {
    const dateTimeCases = [
      {
        params: [undefined],
        expected: '',
      },
      {
        params: [null],
        expected: '',
      },
      {
        params: [''],
        expected: '',
      },
      {
        params: [new Date('2022-04-26T21:06:06.405296+03:00')],
        expected: '26.04.2022, 21:06',
      },
      {
        params: [new Date('2022-04-26T21:06:06+05:00')],
        expected: '26.04.2022, 19:06',
      },
      {
        params: [new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk'],
        expected: '26.04.2022, 20:06',
      },
    ];

    test.each(dateTimeCases)('Convert to Moscow timezone', payload => {
      const { params, expected } = payload;

      expect(dateTime(...params)).toBe(expected);
    });

    test('Convert to local timezone', () => {
      expect(dateTime(new Date('2022-04-26T21:06:06+05:00'), '')).toBeDefined();
    });
  });

  describe('Check dateToDateLong', () => {
    const dateToDateLongCases = [
      {
        param: {
          date: new Date('2022-04-26T21:06:06+05:00'),
        },
        expected: '26 апреля 2022',
      },
      {
        param: {
          date: new Date('2022-04-27T01:06:06+05:00'),
        },
        expected: '26 апреля 2022',
      },
      {
        param: {
          date: new Date('2022-04-27T01:06:06+05:00'),
          showWeekDay: false,
          showYear: true,
          timeZone: 'Europe/Ulyanovsk',
        },
        expected: '27 апреля 2022',
      },
      {
        param: {
          date: new Date('2022-04-27T01:06:06+05:00'),
          showWeekDay: false,
          showYear: false,
          timeZone: 'Europe/Ulyanovsk',
        },
        expected: '27 апреля',
      },
      {
        param: {
          date: new Date('2022-04-26T21:06:06.405296+03:00'),
          showWeekDay: true,
          showYear: true,
          timeZone: 'Europe/Ulyanovsk',
        },
        expected: 'вт, 26 апреля 2022',
      },
      {
        param: {
          date: new Date('2022-04-26'),
          showWeekDay: true,
          showYear: false,
          timeZone: 'Europe/Ulyanovsk',
        },
        expected: 'вт, 26 апреля',
      },
      {
        param: {
          date: new Date('2022-32-33'),
          showWeekDay: false,
          showYear: true,
          timeZone: '',
        },
        expected: '',
      },
      {
        param: {
          date: null,
          showWeekDay: false,
          showYear: true,
          timeZone: '',
        },
        expected: '',
      },
      {
        param: {
          showWeekDay: false,
          showYear: true,
          timeZone: '',
        },
        expected: '',
      },
      {
        param: {},
        expected: '',
      },
    ];

    test.each(dateToDateLongCases)('Convert to Moscow timezone', payload => {
      const { param, expected } = payload;

      expect(dateToDateLong(param)).toBe(expected);
    });

    test('Convert to local timezone', () => {
      expect(
        dateToDateLong({
          date: new Date('2022-04-26'),
          showWeekDay: false,
          showYear: true,
          timeZone: '',
        }),
      ).toBeDefined();
    });
  });

  describe('Check dateToHoursMinutes', () => {
    const dateToHoursMinutesCases = [
      {
        params: [undefined],
        expected: '00:00',
      },
      {
        params: [null],
        expected: '00:00',
      },
      {
        params: [new Date('2022-32-33')],
        expected: '00:00',
      },
      {
        params: [new Date('2022-04-26T21:06:06.405296+03:00')],
        expected: '21:06',
      },
      {
        params: [new Date('2022-04-26T21:06:06+05:00')],
        expected: '19:06',
      },
      {
        params: [new Date('2022-04-26T21:06:06+05:00'), 'Europe/Ulyanovsk'],
        expected: '20:06',
      },
    ];

    test.each(dateToHoursMinutesCases)('Convert to Moscow timezone', payload => {
      const { params, expected } = payload;

      expect(dateToHoursMinutes(...params)).toBe(expected);
    });

    test('Convert to local timezone', () => {
      expect(dateToHoursMinutes(new Date('2022-04-26T21:06:06+05:00'), '')).not.toBe('00:00');
    });
  });

  const minutesToHoursMinutesCases = [
    {
      minutes: null,
      time: '00:00',
      byParts: '0 минут',
    },
    {
      minutes: -60,
      time: '-01:00',
      byParts: '-1 час',
    },
    {
      minutes: 0,
      time: '00:00',
      byParts: '0 минут',
    },
    {
      minutes: 15,
      time: '00:15',
      byParts: '15 минут',
    },
    {
      minutes: 120,
      time: '02:00',
      byParts: '2 часа',
    },
    {
      minutes: 145,
      time: '02:25',
      byParts: '2 ч. 25 мин.',
    },
    {
      minutes: 42,
      time: '00:42',
      byParts: '42 минуты',
    },
  ];

  test.each(minutesToHoursMinutesCases)('minutesToHoursMinutes', payload => {
    const { minutes, time, byParts } = payload;

    expect(minutesToHoursMinutes(minutes)).toBe(time);
    expect(minutesToHoursMinutes(minutes, true)).toBe(byParts);
  });

  const getMoscowTimeCases = [
    {
      param: '2022-05-01T09:30:00Z',
      expected: {
        hour: '12',
        minute: '30',
        timestamp: 1651397400000,
      },
    },
    {
      param: '2022-04-26T01:06:06+03:00',
      expected: {
        hour: '01',
        minute: '06',
        timestamp: 1650924366000,
      },
    },
    {
      param: '2022-05-01',
      expected: {
        hour: '03',
        minute: '00',
        timestamp: 1651363200000,
      },
    },
    {
      param: null,
      expected: {
        hour: '00',
        minute: '00',
        timestamp: 0,
      },
    },
  ];

  test.each(getMoscowTimeCases)('getMoscowTime', payload => {
    const { param, expected } = payload;

    expect(getMoscowTime(param)).toEqual(expected);
  });

  describe('Check weekOfYear', () => {
    const weekOfYearCases = [
      {
        param: null,
        expected: 0,
      },
      {
        param: new Date('2022-04-26T21:06:06+03:00'),
        expected: 17,
      },
      {
        param: new Date('2021-10-21T21:06:06+05:00'),
        expected: 42,
      },
      {
        param: new Date('2020-10-21T01:06:06+05:00'),
        expected: 43,
      },
    ];

    test.each(weekOfYearCases)('Week of year by date', payload => {
      const { param, expected } = payload;

      expect(weekOfYear(param)).toBe(expected);
    });

    test('Current week of year', () => {
      expect(weekOfYear()).toBeGreaterThan(0);
    });
  });

  describe('Check weekNumberToDate', () => {
    const weekNumberToDateCases = [
      {
        params: [2022, 17],
        expected: new Date('2022-04-24T21:00:00.000Z'),
      },
      {
        params: [2021, 42],
        expected: new Date('2021-10-17T21:00:00.000Z'),
      },
      {
        params: [2020, 43],
        expected: new Date('2020-10-18T21:00:00.000Z'),
      },
    ];

    test.each(weekNumberToDateCases)('Date by week number', payload => {
      const { params, expected } = payload;

      expect(weekNumberToDate(...params)).toStrictEqual(expected);
    });

    test('Random date by week number', () => {
      expect(weekNumberToDate(42, undefined)).toBeInstanceOf(Date);
    });
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
      mask: '+7 (999) {999}-[999]_999',
      values: ['+7 (123) {456}-[789]_111', '7123456789111'],
      expected: [
        {
          clearValue: '7123456789111',
          formatValue: '+7 (123) {456}-[789]_111',
          valid: true,
        },
        {
          clearValue: '7123456789111',
          formatValue: '+7 (123) {456}-[789]_111',
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
        '7 (928) 280-07-00',
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
          clearValue: '79282800700',
          formatValue: '+7 928 280-07-00',
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
        '7 (928) 280-07-00',
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
          clearValue: '79282800700',
          formatValue: '+7 928 xxx-xx-00',
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

  test('convertFileToBase64', async () => {
    const validFileContent = '<tag1>Test file<tag1>';
    const validFile = new File([validFileContent], 'File.xml', { type: 'text/xml' });

    const validFileInBase64 = await convertFileToBase64(validFile);

    expect(validFileInBase64).toBe('PHRhZzE+VGVzdCBmaWxlPHRhZzE+');

    const emptyFile = await convertFileToBase64(null);

    expect(emptyFile).toBe('');
  });

  const shortNameCases = [
    {
      param: undefined,
      expected: '――',
    },
    {
      param: null,
      expected: '――',
    },
    {
      param: '',
      expected: '――',
    },
    {
      param: '42',
      expected: '――',
    },
    {
      param: 'Светлова Александра Андреевна',
      expected: 'СвеАА',
    },
    {
      param: 'Бекр Фуркад',
      expected: 'БекрФ',
    },
    {
      param: 'василий',
      expected: 'Васил',
    },
  ];

  test.each(shortNameCases)('shortName', payload => {
    const { param, expected } = payload;

    expect(shortName(param)).toBe(expected);
  });

  const removeObjectKeysCases = [
    {
      params: [null, null],
      expected: {},
    },
    {
      params: [[], null],
      expected: {},
    },
    {
      params: [['a'], null],
      expected: {},
    },
    {
      params: [['a'], {}],
      expected: {},
    },
    {
      params: [['a'], { b: 42 }],
      expected: { b: 42 },
    },
    {
      params: [
        ['a'],
        {
          a: 'need remove',
          b: 42,
        },
      ],
      expected: { b: 42 },
    },
    {
      params: [
        [],
        {
          a: 'need remove',
          b: 42,
        },
      ],
      expected: {
        a: 'need remove',
        b: 42,
      },
    },
  ];

  test.each(removeObjectKeysCases)('removeObjectKeys', payload => {
    const { params, expected } = payload;

    expect(removeObjectKeys(...params)).toEqual(expected);
  });

  describe('Check deepClone', () => {
    test('Object', () => {
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
    });

    test('Array', () => {
      const sourceArray = [{ id: 1, text: 42 }, 'string'];
      const clonedArray = deepClone(sourceArray);

      clonedArray[0].id = 7;

      expect(sourceArray).not.toEqual(clonedArray);
      expect(clonedArray).toEqual([{ id: 7, text: 42 }, 'string']);
    });

    test.each([undefined, null, '', 'string', 42])('Primitive', param => {
      expect(deepClone(param)).toBe(param);
    });
  });

  test('memo', () => {
    const add = (x, y) => x + y;
    const memoAdd = memo(add);

    expect(memoAdd(24, 42)).toBe(66);
    expect(memoAdd(42, 24)).toBe(66);
  });

  const fuzzySearchCases = [
    {
      query: 'wheelcart',
      text: 'cart',
      expected: false,
    },
    {
      query: 'wheelcart',
      text: 'cartwheel',
      expected: false,
    },
    {
      query: 'cartwheel',
      text: 'cartwheel',
      expected: true,
    },
    {
      query: 'twl',
      text: 'cartwheel',
      expected: true,
    },
    {
      query: 'cart',
      text: 'cartwheel',
      expected: true,
    },
    {
      query: 'cw',
      text: 'cartwheel',
      expected: true,
    },
    {
      query: 'ee',
      text: 'cartwheel',
      expected: true,
    },
    {
      query: 'art',
      text: 'cartwheel',
      expected: true,
    },
    {
      query: 'eeel',
      text: 'cartwheel',
      expected: false,
    },
    {
      query: 'dog',
      text: 'cartwheel',
      expected: false,
    },
  ];

  test.each(fuzzySearchCases)('fuzzySearch', payload => {
    const { query, text, expected } = payload;

    expect(fuzzySearch(query, text)).toBe(expected);
  });

  describe('Check searchByKeys', () => {
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

    const searchByKeysCases = [
      {
        param: undefined,
        expected: [],
      },
      {
        param: {
          search: '',
          options: [],
          keys: [],
        },
        expected: [],
      },
      {
        param: {
          search: 'any',
          options: [...options],
          keys: [],
        },
        expected: [],
      },
      {
        param: {
          search: 'any',
          options: [...options],
          keys: ['text'],
        },
        expected: [
          {
            text: 'Any text content',
            sub: {
              name: 'query',
            },
            match_score: 3,
            normalized_text: 'anytextcontent',
          },
        ],
      },
      {
        param: {
          search: 'content',
          options: [...options],
          keys: ['text'],
        },
        expected: [
          {
            text: 'Content',
            match_score: 4,
            normalized_text: 'content',
          },
        ],
      },
      {
        param: {
          search: 'query',
          options: [...options],
          keys: ['sub.name'],
        },
        expected: [
          {
            text: 'Any text content',
            sub: {
              name: 'query',
            },
            match_score: 4,
            normalized_text: 'anytextcontent',
            'normalized_sub.name': 'query',
          },
        ],
      },
      {
        param: {
          search: 'Store',
          options: [
            {
              text: 'Any text content',
              baby: [
                {
                  name: 'Store 2',
                  description: 'Some_description-!@#$%^&*()_+=',
                },
              ],
            },
            {
              text: 'Store 1',
              baby: null,
              description: 'User description $$$',
            },
            {
              text: 'Any text content',
              baby: [
                {
                  name: 'Place 1',
                  description: 'Some_description-!@#$%^&*()_+=',
                },
              ],
            },
          ],
          childrenField: 'baby',
          keys: ['text', 'name', 'description'],
        },
        expected: [
          {
            text: 'Any text content',
            match_score: 3,
            normalized_text: 'anytextcontent',
            normalized_name: '',
            normalized_description: '',
            baby: [
              {
                name: 'Store 2',
                description: 'Some_description-!@#$%^&*()_+=',
                match_score: 3,
                normalized_text: '',
                normalized_name: 'store2',
                normalized_description: 'somedescription',
              },
            ],
          },
          {
            text: 'Store 1',
            description: 'User description $$$',
            match_score: 3,
            normalized_text: 'store1',
            normalized_name: '',
            normalized_description: 'userdescription',
            baby: null,
          },
        ],
      },
      {
        param: {
          search: 'onten',
          options: [...options],
          keys: ['text'],
        },
        expected: [
          {
            text: 'Any text content',
            sub: {
              name: 'query',
            },
            match_score: 2,
            normalized_text: 'anytextcontent',
            'normalized_sub.name': 'query',
          },
          {
            text: 'Content',
            match_score: 2,
            'normalized_sub.name': '',
            normalized_text: 'content',
          },
        ],
      },
      {
        param: {
          search: 'conent',
          options: [...options],
          keys: ['text'],
          enableFuzzySearch: false,
        },
        expected: [],
      },
      {
        param: {
          search: 'conent',
          options: [...options],
          keys: ['text'],
          enableFuzzySearch: true,
        },
        expected: [
          {
            text: 'Any text content',
            sub: {
              name: 'query',
            },
            match_score: 1,
            normalized_text: 'anytextcontent',
            'normalized_sub.name': 'query',
          },
          {
            text: 'Content',
            match_score: 1,
            'normalized_sub.name': '',
            normalized_text: 'content',
          },
        ],
      },
    ];

    test.each(searchByKeysCases)('searchByKeys', payload => {
      const { param, expected } = payload;

      expect(searchByKeys(param)).toEqual(expected);
    });
  });

  describe('Check Clipboard', () => {
    const copy = value => Promise.resolve(value);

    const paste = type => {
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
        handleNavigator: {},
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: {
          clipboard: {},
          permissions: { query },
        },
        expected: {
          isCanCopy: false,
          isCanPaste: false,
        },
      },
      {
        handleNavigator: {
          clipboard: {
            writeText: copy,
            readText: paste('error'),
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
        handleNavigator: {
          clipboard: {
            writeText: copy,
            readText: paste('success'),
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
        handleNavigator: {
          clipboard: {
            writeText: copy,
            readText: paste('success'),
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
      const { handleNavigator, expected } = payload;

      const { navigator } = window;

      delete window.navigator;

      window.navigator = handleNavigator;

      const { error } = console;

      console.error = vi.fn();

      const { copy, paste } = await checkClipboardFunctionality();

      expect(copy).toBe(expected.isCanCopy);
      expect(paste).toBe(expected.isCanPaste);

      window.navigator = navigator;
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

  test.each(utmCases)('getUTMLabels', payload => {
    const { locationSearch, expected } = payload;

    window.location.assign(`https://shifts.verme.ru/${locationSearch}`);

    const labels = getUTMLabels();

    expect(labels).toEqual(expected);

    window.location.assign('about:blank');
  });
});
