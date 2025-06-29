/** Локализация по умолчанию */
export const locale: string = 'ru-RU';

export type Environment = {
  server: string;
  isLocal: boolean;
  mode: 'development' | 'production';
};

/**
 * Определение окружения по домену
 * @example
 * https://any-verme.ru
 * getEnvironment('verme')
 * // { server: 'any', isLocal: false, mode: 'development' }
 */
export const getEnvironment = (name: string = ''): Environment => {
  const host: string = window.location.hostname;

  const isLocalServer: boolean = Boolean(
    host === 'localhost' ||
      // IPv4 localhost address
      /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(host),
  );

  const regExp: RegExp = new RegExp(['(?=-).*(?=\\.', name, ')'].join(''));
  const environment: string = regExp.exec(host)?.[0].replace('-', '') ?? 'production';

  return {
    server: environment,
    isLocal: isLocalServer,
    mode: isLocalServer || environment !== 'production' ? 'development' : 'production',
  };
};

/**
 * Определение казахского домена
 * @example
 * https://any-domain.kz
 * isKZ() // true
 */
export const isKZ = (): boolean => window.location.hostname.includes('.kz');

export type CookieCreateOptions = {
  Domain?: string;
  Path?: string;
  Expires?: Date | string;
  'Max-Age'?: number;
  HttpOnly?: boolean;
  Secure?: boolean;
  SameSite?: 'None' | 'Strict' | 'Lax';
};

type CookieOptions = {
  Domain?: string;
  Path?: string;
  Expires?: string;
  'Max-Age'?: number;
  HttpOnly?: string;
  Secure?: string;
  SameSite?: string;
};

export type Cookie = {
  /** Формирование опций cookie */
  createOptions: (options?: CookieCreateOptions) => string;
  /** Получение значения из Cookie по ключу */
  get: (name: string) => string;
  /** Установка значения в Cookie по ключу */
  set: (name: string, value: string, options?: CookieCreateOptions) => void;
  /** Удаление Cookie по ключу */
  delete: (name: string) => void;
};

/** Работа с Cookie */
export const cookie: Readonly<Cookie> = Object.freeze({
  createOptions(options: CookieCreateOptions = {}): string {
    const allowedOptions: Array<keyof CookieOptions> = [
      <keyof CookieOptions>'Domain',
      <keyof CookieOptions>'Path',
      <keyof CookieOptions>'Expires',
      <keyof CookieOptions>'Max-Age',
      <keyof CookieOptions>'HttpOnly',
      <keyof CookieOptions>'Secure',
      <keyof CookieOptions>'SameSite',
    ];

    const cookieOptions: CookieOptions = {
      Path: '/',
    };

    for (const key in options) {
      const option: keyof CookieOptions | undefined = allowedOptions.find(
        (code: string): boolean => code.toLowerCase() === key.toLowerCase(),
      );

      if (!option) {
        continue;
      }

      const value = options[<keyof CookieCreateOptions>key];

      switch (true) {
        case ['Domain', 'Path'].includes(option) && typeof value === 'string': {
          cookieOptions[<'Domain' | 'Path'>option] = value;

          break;
        }

        case option === 'Expires': {
          cookieOptions[<'Expires'>option] =
            value instanceof Date ? value.toUTCString() : <string>value;

          delete cookieOptions['Max-Age'];

          break;
        }

        case option === 'Max-Age' && typeof value === 'number': {
          cookieOptions[<'Max-Age'>option] = value;

          delete cookieOptions['Expires'];

          break;
        }

        case ['HttpOnly', 'Secure'].includes(option) && value === true: {
          cookieOptions[<'HttpOnly' | 'Secure'>option] = '';

          break;
        }

        case option === 'SameSite': {
          if (['None', 'Strict', 'Lax'].some((code: string): boolean => code === value)) {
            cookieOptions[<'SameSite'>option] = <string>value;
          }

          break;
        }
      }
    }

    const optionsText: Array<string | number> = [];

    Object.entries(cookieOptions).forEach((pair: [string, string | number]): void => {
      const value: string = pair.filter(Boolean).join('=');

      optionsText.push(value);
    });

    return optionsText.join('; ');
  },
  get(name: string): string {
    if (!name) {
      return '';
    }

    const pairs: string[] = document.cookie.split(';').map((value: string) => value.trim());

    const encodeName: string = encodeURIComponent(name);
    const valueIndex: number = pairs.findIndex((string: string) => string.includes(encodeName));

    if (valueIndex !== -1) {
      const [, value] = (<string>pairs.at(valueIndex)).split('=');

      return value ? decodeURIComponent(value) : '';
    }

    return '';
  },
  set(name: string, value: string, options: CookieCreateOptions | undefined): void {
    if (!name) {
      return;
    }

    const pair: string = [name, value]
      .filter(Boolean)
      .map((string: string) => encodeURIComponent(string.trim()))
      .join('=');

    const params: string = cookie.createOptions(options);

    document.cookie = [pair, params].join('; ');
  },
  delete(name: string): void {
    const value: '' | '<removed>' = cookie.get(name) ? '<removed>' : '';

    cookie.set(name, value, {
      'Max-Age': -1,
    });
  },
});

/** Определение типа переданного значения */
export const getType = (value?: any): string => {
  switch (value) {
    case undefined: {
      return 'Undefined';
    }

    case null: {
      return 'Null';
    }

    default: {
      return value.constructor.name;
    }
  }
};

/**
 * Добавление ведущего нуля
 * @example
 * leadingZero(9); // '09'
 */
export const leadingZero = (value: string | number): string => {
  const type: string = getType(value);

  const invalid: boolean =
    !value || !['Number', 'String'].some((allowed: string): boolean => allowed === type);

  const number: string | number = invalid ? 0 : value;

  return String(number).padStart(2, '0');
};

/**
 * Преобразование числа в сумму
 * @param value - Значение суммы
 * @param [fraction=1] - Количество символов после запятой
 * @example
 * currencyMask(1840); // '1 840 ₽'
 */
export const currencyMask = (value: number | undefined | null, fraction: number = 1): string => {
  const KZ: boolean = isKZ();
  const currencyLocale: string = KZ ? 'ru-KZ' : 'ru-RU';
  const currency: string = KZ ? 'KZT' : 'RUB';

  const number: number = !value || Number.isNaN(value) ? 0 : value;

  return new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: fraction,
  }).format(number);
};

/**
 * Окончания слов
 * @example
 * wordEndings(17, ['метр', 'метра', 'метров']); // '17 метров'
 */
export const wordEndings = (amount: number | string, titles: [string, string, string]): string => {
  const number: number = Number.parseFloat(String(amount || 0));
  const formatNumber: string = new Intl.NumberFormat('ru-RU').format(number);

  let word;

  // RU
  if (number % 10 === 1 && number % 100 !== 11) {
    word = titles.at(0);
  } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
    word = titles.at(1);
  } else {
    word = titles.at(2);
  }

  return [formatNumber, word].join(' ');
};

/**
 * Преобразование числа в расстояние
 * @example
 * distanceFormat(42); // '42 метра'
 * distanceFormat(42, true); // '42 м'
 * distanceFormat(1042); // '1.42 км'
 */
export const distanceFormat = (distance: number | string, short: boolean = false): string => {
  const type: string = getType(distance);

  const validType: boolean = ['Number', 'String'].some(
    (allowed: string): boolean => allowed === type,
  );

  if (!distance || !validType) {
    return '';
  }

  const validDistance: number = Number.parseFloat(String(distance));

  if (validDistance > 900) {
    return `${Math.round((validDistance / 1000) * 10) / 10} км`;
  } else if (short) {
    return `${new Intl.NumberFormat(locale).format(validDistance)} м`;
  }

  return wordEndings(validDistance, ['метр', 'метра', 'метров']);
};

/**
 * Получение преобразованного размера файла
 * @example
 * bytesToSize(40031); // '39.09 кБ'
 */
export const bytesToSize = (bytes: number): string => {
  const invalid: boolean = [!bytes, getType(bytes) !== 'Number'].some(Boolean);

  if (invalid) {
    return '0 байт';
  }

  const kiloByte = 1024;
  const unit: string[] = ['байт', 'кБ', 'МБ', 'ГБ', 'ТБ', 'ПБ', 'ЭБ', 'ЗБ', 'ИБ'];

  if (bytes < kiloByte) {
    return wordEndings(bytes, ['байт', 'байта', 'байт']);
  }

  const sizeIndex: number = Math.floor(Math.log(bytes) / Math.log(kiloByte));
  const size: number = Math.round((bytes / kiloByte ** sizeIndex) * 100) / 100;

  return [size, unit.at(sizeIndex)].join(' ');
};

/** Проверка объекта даты на валидность */
export const dateIsValid = (date?: Date): boolean => {
  if (!date) {
    return false;
  }

  return !Number.isNaN(new Date(date).getTime());
};

/**
 * Преобразование даты в ISO формат
 * @example
 * toISODate(new Date('2020-10-21T08:45:00')); // '2020-10-21'
 */
export const toISODate = (date: Date): string => {
  if (!dateIsValid(date)) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return new Intl.DateTimeFormat('ru-RU', options).format(date).split('.').reverse().join('-');
};

/**
 * Преобразование даты в формат DD.MM.YYYY
 * @example
 * dateToDateShort(new Date('2020-10-21T08:45:00')); // '21.10.2020'
 */
export const dateToDateShort = (date: Date, timeZone: string = 'Europe/Moscow'): string => {
  if (!dateIsValid(date)) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  if (timeZone) {
    options.timeZone = timeZone;
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Преобразование ISO даты в формат DD.MM.YYYY
 * @example
 * ISOToDateFormat('1979-12-03'); // '03.12.1979'
 */
export const ISOToDateFormat = (ISODate: string, timeZone: string = 'Europe/Moscow'): string => {
  const datePattern: RegExp = /^(\d{4})-(\d{1,2})-(\d{1,2})$/; // 'YYYY-MM-DD'

  const invalid: boolean = [
    !ISODate,
    getType(ISODate) !== 'String',
    !datePattern.test(ISODate),
  ].some(Boolean);

  if (invalid) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  if (timeZone) {
    options.timeZone = timeZone;
  }

  return new Intl.DateTimeFormat(locale, options).format(new Date(ISODate));
};

/**
 * Преобразование даты в формат DD.MM.YYYY, HH:MM
 * @example
 * dateTime(new Date('2020-10-21T08:45:00')); // '21.10.2020, 08:45'
 */
export const dateTime = (date: Date, timeZone: string = 'Europe/Moscow'): string => {
  if (!dateIsValid(date)) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
  };

  if (timeZone) {
    options.timeZone = timeZone;
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

export type DateToDateLong = {
  date?: Date;
  showWeekDay?: boolean;
  showYear?: boolean;
  timeZone?: string;
};

/**
 * Преобразование даты в формат WW, DD MMMM YYYY
 * @example
 * // '21 октября 2020'
 * dateToDateLong({
 *   date: new Date(2020, 9, 21),
 * });
 *
 * // 'ср, 21 октября 2020'
 * dateToDateLong({
 *   date: new Date(2020, 9, 21),
 *   showWeekDay: true,
 * });
 *
 * // 'ср, 21 октября'
 * dateToDateLong({
 *   date: new Date(2020, 9, 21),
 *   showWeekDay: true,
 *   showYear: false,
 * });
 *
 * // '21 октября'
 * dateToDateLong({
 *   date: new Date(2020, 9, 21),
 *   showYear: false,
 * });
 */
export const dateToDateLong = (payload: DateToDateLong = {}): string => {
  if (!dateIsValid(payload.date)) {
    return '';
  }

  const { date } = payload;
  const showWeekDay: boolean = payload.showWeekDay ?? false;
  const showYear: boolean = payload.showYear ?? true;
  const timeZone: string = payload.timeZone ?? 'Europe/Moscow';

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
  };

  if (showWeekDay) {
    options.weekday = 'short';
  }

  if (showYear) {
    options.year = 'numeric';
  }

  if (timeZone) {
    options.timeZone = timeZone;
  }

  const longDate: string = new Intl.DateTimeFormat(locale, options).format(<Date>date);

  return showYear ? longDate.slice(0, -3) : longDate;
};

/**
 * Преобразование даты в формат HH:MM
 * @example
 * dateToHoursMinutes(new Date('2020-10-21')); // '08:45'
 */
export const dateToHoursMinutes = (date: Date, timeZone: string = 'Europe/Moscow'): string => {
  if (!dateIsValid(date)) {
    return '00:00';
  }

  const options: Intl.DateTimeFormatOptions = {
    hour12: false,
    minute: '2-digit',
    hour: '2-digit',
  };

  if (timeZone) {
    options.timeZone = timeZone;
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Преобразование числа в формат HH:MM
 * @example
 * minutesToHoursMinutes(480); // '08:00'
 */
export const minutesToHoursMinutes = (value: number, byParts: boolean = false): string => {
  const type: string = getType(value);
  const invalid: boolean = !value || type !== 'Number';
  const number: number = invalid ? 0 : value;

  const absNumber: number = Math.abs(number);
  const sign: string = number < 0 ? '-' : '';

  const hours: number = Math.floor(absNumber / 60);
  const minutes: number = absNumber % 60;

  let time;

  if (byParts) {
    if (hours && minutes) {
      time = `${hours} ч. ${minutes} мин.`;
    } else if (hours) {
      time = wordEndings(hours, ['час', 'часа', 'часов']);
    } else {
      time = wordEndings(minutes, ['минута', 'минуты', 'минут']);
    }
  } else {
    time = [leadingZero(hours), leadingZero(minutes)].join(':');
  }

  return [sign, time].join('');
};

export type HourTimestamp = {
  hour: string;
  minute: string;
  timestamp: number;
};

/**
 * Получение объекта с московским временем из даты
 * @example
 * getMoscowTime('2022-05-02T08:00:00Z');
 * // { hour: '12', minute: '00', timestamp: 1643041320000 }
 */
export const getMoscowTime = (dateString: string): HourTimestamp => {
  const date: Date = new Date(dateString);

  if (!dateString || !dateIsValid(date)) {
    return {
      hour: '00',
      minute: '00',
      timestamp: 0,
    };
  }

  const offset: 3 = +3;

  const newDate: string = new Date(date.getTime() + offset * 3600 * 1000)
    .toUTCString()
    .replace(/ GMT$/, '');

  const localTime: Date = new Date(newDate);

  return {
    hour: leadingZero(localTime.getHours()),
    minute: leadingZero(localTime.getMinutes()),
    timestamp: localTime.getTime(),
  };
};

/**
 * Получение номера недели в году
 * @example
 * weekOfYear(new Date('2020-10-21')); // 43
 */
export const weekOfYear = (currentDate: Date = new Date()): number => {
  if (!dateIsValid(currentDate)) {
    return 0;
  }

  const date: Date = new Date(currentDate.getTime());

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  const firstWeek: Date = new Date(date.getFullYear(), 0, 4);
  const MILLISECONDS_IN_DAY = 86400000; // 24 * 60 * 60 * 1000

  const currentYearDay: number = (date.getTime() - firstWeek.getTime()) / MILLISECONDS_IN_DAY;

  return 1 + Math.round((currentYearDay - 3 + ((firstWeek.getDay() + 6) % 7)) / 7);
};

/**
 * Получения даты начала недели по номеру недели
 * @example
 * weekNumberToDate(2020, 43); // Wed Oct 21 2020 00:00:00 GMT+0300
 */
export const weekNumberToDate = (year: number, weekNumber: number): Date => {
  const startOfYear: Date = new Date(year, 0, 1 + (weekNumber - 1) * 7);

  const day: number = startOfYear.getDay();
  const date: number = startOfYear.getDate() + (day <= 4 ? -day + 1 : 8 - day);

  startOfYear.setDate(date);
  startOfYear.setHours(0, 0, 0, 0);

  return startOfYear;
};

type MaskHelpers = {
  /** Набор спец.символов */
  readonly special: RegExp;
  /** Словарь для составления регулярных выражений */
  readonly dictionary: Record<string, string>;
  /** Создание регулярного выражения по маске */
  readonly createRegExpByMask: (mask?: string | undefined) => RegExp;
};

const maskItHelpers: MaskHelpers = {
  special: /[\s-+/._{}()[\]]/,
  dictionary: {
    Z: '[A-Z]',
    9: '\\d',
    7: '7',
    x: 'x',
    ' ': '\\s',
    '+': '\\+',
    '-': '-',
    _: '_',
    '/': '/',
    '.': '\\.',
    '(': '\\(',
    ')': '\\)',
    '{': '\\{',
    '}': '\\}',
    '[': '\\[',
    ']': '\\]',
  },
  createRegExpByMask(mask: string | undefined): RegExp {
    const fullValue: RegExp = /.*/;

    if (!mask) {
      return fullValue;
    }

    let regExp: string = '';

    const addRegExpRange = (string: string): void => {
      if (!string) {
        return;
      }

      const symbol: string = string.charAt(0);

      if (maskItHelpers.dictionary[symbol]) {
        const matchArray: RegExpMatchArray = <RegExpMatchArray>(
          new RegExp(`${maskItHelpers.dictionary[symbol]}*`).exec(string)
        );

        const { length } = <string>matchArray.at(0);

        regExp += `${maskItHelpers.dictionary[symbol]}{${length}}`;

        addRegExpRange(string.slice(length));
      } else {
        addRegExpRange(string.slice(1));
      }
    };

    addRegExpRange(mask);

    return regExp ? new RegExp(regExp, 'i') : fullValue;
  },
};

export type MaskMethods = {
  readonly phoneMask: {
    ru: string;
    ru_anon: string;
  };
  readonly clear: (value: string | number) => string;
  /**
   * Формирование значения по маске
   * @example
   * maskIt.format('+7 999 999-99-99', '12345678910'); // '+7 234 567-89-10'
   * maskIt.format('ZZZ-xxx', 'АБВГДЕ'); // 'АБВ-xxx'
   */
  readonly format: (mask: string, value: string | number) => string;
  /**
   * Проверка значения по маске
   * @example
   * maskIt.check('+7 999 999-99-99', '12345678910'); // true
   * maskIt.check('+7 999 999-99-99', '+7 234 567-89-10'); // true
   */
  readonly check: (mask: string, value: string | number) => boolean;
};

/** Форматирование по маске */
export const maskIt: Readonly<MaskMethods> = Object.freeze({
  phoneMask: {
    ru: '+7 999 999-99-99',
    ru_anon: '+7 999 xxx-xx-99',
  },
  clear(value: string | number): string {
    if (!value) {
      return '';
    }

    const regExp: RegExp = new RegExp(maskItHelpers.special, 'g');

    return String(value).replace(regExp, '');
  },
  format(mask: string, value: string | number): string {
    const clearValue: string = maskIt.clear(value);

    if (!mask || !clearValue) {
      return '';
    }

    const isPhoneMask: boolean = Object.values(maskIt.phoneMask).some(
      (phoneMask: string): boolean => phoneMask === mask,
    );

    const maskArray: string[] = mask.split('');

    let count: number = 0;
    let formatValue: string = '';

    for (const symbol of maskArray) {
      if (count >= clearValue.length) {
        break;
      }

      const isSpecialCharacter: boolean = maskItHelpers.special.test(symbol);

      if (isSpecialCharacter) {
        formatValue += symbol;
      } else if (isPhoneMask && /[7x]/.test(symbol)) {
        const valueChar: string = clearValue.charAt(count);
        const invalidValue: boolean = symbol === '7' && !['7', '8'].includes(valueChar);

        formatValue += symbol;

        if (!invalidValue) {
          count += 1;
        }
      } else {
        formatValue += clearValue.charAt(count);
        count += 1;
      }
    }

    return formatValue;
  },
  check(mask: string, value: string | number): boolean {
    const regExp: RegExp = maskItHelpers.createRegExpByMask(mask);
    const formatValue: string = maskIt.format(mask, value);

    return regExp.test(formatValue);
  },
});

/** Преобразование файла в Base64 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  if (!file) {
    return Promise.resolve('');
  }

  const reader: FileReader = new FileReader();

  return new Promise(resolve => {
    reader.onload = (): void => {
      const base64: string | ArrayBuffer | null = reader.result;

      if (typeof base64 === 'string') {
        resolve(<string>base64.split('base64,', 2).at(1));
      }
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Сокращение ФИО до формата ФффИО или ФфффИ (если нет отчества)
 * @example
 * shortName('Светлова Александра Андреевна'); // 'СвеАА'
 * shortName('Бекр Фуркад'); // 'БекрФ'
 */
export const shortName = (fullName: string): string => {
  const invalid: boolean = [!fullName, getType(fullName) !== 'String'].some(Boolean);

  if (invalid) {
    return '――';
  }

  const splitFullName: RegExpMatchArray | [] = fullName.match(/[^\s\d_.,'"`;:]+/gi) ?? [];

  const [surname, firstname, patronymic] = splitFullName.map((item: string) =>
    [item.charAt(0).toUpperCase(), item.slice(1)].join(''),
  );

  let limit;

  if (patronymic) {
    limit = 3;
  } else if (firstname) {
    limit = 4;
  } else {
    limit = 5;
  }

  const shortSurname: string = surname ? surname.slice(0, limit) : '';
  const firstnameInitials: string = firstname ? firstname.slice(0, 1) : '';
  const patronymicInitials: string = patronymic ? patronymic.slice(0, 1) : '';

  const name: string = [shortSurname, firstnameInitials, patronymicInitials].join('');

  return !name ? '――' : name;
};

/**
 * Удаление ключей из объекта
 * @example
 * removeObjectKeys(['a'], { a: 13, b: 42 }); // { b: 42 }
 */
export const removeObjectKeys = (
  exclusionFields: string[],
  sourceObject: {},
): Record<string, any> => {
  const object: Record<string, any> = { ...(sourceObject || {}) };

  (exclusionFields || []).forEach((key: string): void => {
    delete object[key];
  });

  return object;
};

/** Рекурсивное (глубокое) копирование объекта (массива) */
export const deepClone = (sourceObject: any): any => {
  if (!sourceObject || typeof sourceObject !== 'object') {
    return sourceObject;
  } else if (sourceObject instanceof Date) {
    return new Date(sourceObject);
  } else if (Array.isArray(sourceObject)) {
    const arrayClone: any[] = [...sourceObject];

    for (let index = 0; index < arrayClone.length; index += 1) {
      const value = arrayClone[index];

      if (typeof value === 'object') {
        arrayClone[index] = deepClone(value);
      }
    }

    return arrayClone;
  }

  const objectClone: Record<string, any> = { ...sourceObject };

  Object.keys(objectClone).forEach((key: string): void => {
    const value = sourceObject[key];

    if (typeof value === 'object') {
      objectClone[key] = deepClone(value);
    }
  });

  return objectClone;
};

type MemoHandler = {
  cache: Map<string, Function>;
  apply: (fn: Function, context: any, args: any[]) => any;
};

/**
 * Мемоизация
 * @example
 * const add = (x, y) => x + y;
 * const memoAdd = memo(add);
 *
 * memoAdd(24, 42); // Calculated
 * memoAdd(42, 24); // From cache
 */
export const memo = (callback: Function): Function =>
  new Proxy(callback, <MemoHandler>{
    cache: new Map(),
    apply(fn: Function, context: any, args: any[]) {
      args.sort((a, b) => (a > b ? 1 : -1));

      const key: string = args.toString();

      if (!this.cache.has(key)) {
        this.cache.set(key, fn.apply(context, args));
      }

      return this.cache.get(key);
    },
  });

/**
 * Нечёткий поиск в строке по поисковой фразе.
 * @param {string} query - поисковая фраза.
 * @param {string} text - текст, в котором искать.
 * @returns {boolean}
 *
 * @example
 * fuzzySearch('twl', 'cartwheel') // true
 * fuzzySearch('eeel', 'cartwheel') // false
 */
export const fuzzySearch = (query: string, text: string): boolean => {
  const queryLength: number = query.length;
  const textLength: number = text.length;

  if (queryLength > textLength) {
    return false;
  } else if (queryLength === textLength) {
    return query === text;
  }

  for (let queryIndex = 0, textIndex = 0; queryIndex < queryLength; queryIndex += 1) {
    const queryCharCode = query.charCodeAt(queryIndex);

    let isMatched = false;

    while (textIndex < textLength) {
      const textCharCode = text.charCodeAt(textIndex);

      textIndex += 1;

      if (textCharCode === queryCharCode) {
        isMatched = true;

        break;
      }
    }

    if (isMatched) {
      continue;
    }

    return false;
  }

  return true;
};

/**
 * Если ключ с вложениями, перебираем все вложения.
 * @param {string} compositeKey
 * @param {Object} item
 *
 * @example
 * findNestedValue('a.b', { a: { b: 'value' } }) // 'value'
 */
const findNestedValue = (compositeKey: string, item: Record<string, any>): any => {
  const keys: string[] = compositeKey.split('.');

  return keys.reduce((accumulator: Record<string, any>, prop: string) => accumulator?.[prop], item);
};

/**
 * Разбивает значение поля на отдельные слова, убирая специальные символы.
 * Добавляет значение в новое поле `normalized_${key}`.
 * @param {string[]} keys
 * @param {Object} item
 * @returns {string[]}
 */
const transformValuesToNormalized = (keys: string[], item: Record<string, any>): string[] =>
  keys
    .map((key: string): string => {
      const normalizedKey: string = `normalized_${key}`;

      if (Object.hasOwn(item, normalizedKey)) {
        return item[normalizedKey];
      }

      const nestedValue: any = findNestedValue(key, item) ?? '';

      const normalizedValue: string = String(nestedValue)
        .toLowerCase()
        .replace(/[^\p{L}\d]+/gimu, '|'); // Чтобы разделять слова

      item[normalizedKey] = normalizedValue;

      return normalizedValue;
    })
    .filter(Boolean);

type findMatchedItemsOptions = {
  options: Record<string, any>[];
  childrenField: string;
  keys: string[];
  queryWords: string[];
  query: string;
  enableFuzzySearch: boolean;
};

const findMatchedItems = (payload: findMatchedItemsOptions): Record<string, any>[] => {
  const { childrenField, keys, queryWords, query, enableFuzzySearch } = payload;

  return payload.options.flatMap((item: Record<string, any>): Record<string, any>[] => {
    const setScoreAndGetItemWithChildren = (score: number): Record<string, any> | null => {
      item['match_score'] = score;

      // Если в основных полях не нашли и есть дети, ищем в них
      if (!childrenField || !item[childrenField]?.length) {
        return null;
      }

      // Список детей, подходящих под запрос
      const children: Record<string, any>[] = findMatchedItems({
        options: item[childrenField],
        childrenField,
        keys,
        queryWords,
        query,
        enableFuzzySearch,
      });

      if (!children.length) {
        return null;
      }

      const scores: number[] = children.map(childrenItem => childrenItem['match_score']);
      const maxScore: number = Math.max(...scores);

      if (maxScore > item['match_score']) {
        item['match_score'] = maxScore;
      }

      return {
        ...item,
        [childrenField]: children,
      };
    };

    // Нормализованные значения всех запрашиваемых полей
    const normalizedValues: string[] = transformValuesToNormalized(keys, item);

    // Точное совпадение
    const hasFullMatch: boolean = normalizedValues.some(word => word === query);

    if (hasFullMatch) {
      return [setScoreAndGetItemWithChildren(4) ?? item];
    }

    // Начинается с запроса
    const hasStartWithQuery: boolean = normalizedValues.some(word => word.startsWith(query));

    if (hasStartWithQuery) {
      return [setScoreAndGetItemWithChildren(3) ?? item];
    }

    // Содержит запрос внутри хотя бы в одном из полей
    const matchingStrings: string[] = queryWords.filter(queryWord =>
      normalizedValues.some(normalizedString => normalizedString.includes(queryWord)),
    );

    if (matchingStrings.length === queryWords.length) {
      return [setScoreAndGetItemWithChildren(2) ?? item];
    }

    // Нечёткий поиск, для проверок на опечатки
    if (enableFuzzySearch) {
      // Есть нечёткое соответствие в одном из полей
      const hasFuzzyMatch: boolean = normalizedValues.some(word => fuzzySearch(query, word));

      if (hasFuzzyMatch) {
        return [setScoreAndGetItemWithChildren(1) ?? item];
      }
    }

    // Нет совпадений
    const itemWithChildren: Record<string, any> | null = setScoreAndGetItemWithChildren(0);

    return itemWithChildren ? [itemWithChildren] : [];
  });
};

export type SearchOptions = Partial<{
  search: string;
  options: Record<string, any>[];
  childrenField: string;
  keys: string[];
  enableFuzzySearch: boolean;
}>;

/**
 * Поиск по поисковой фразе в списке по переданным ключам объекта.
 * @param {Object} payload
 * @param {string} payload.search - поисковая фраза.
 * @param {Object[]} payload.options - список объектов.
 * @param {string} [payload.childrenField] - название поля дочернего списка.
 * @param {string[]} payload.keys - список ключей объекта, разделённых точкой.
 * @param {boolean} payload.enableFuzzySearch - включить поддержку нечёткого поиска.
 * @returns {Object[]} - Возвращает отфильтрованный список объект по поисковым словам.
 */
export const searchByKeys = (payload: SearchOptions = {}): Record<string, any>[] => {
  const search: string = payload.search ?? '';
  const options: Record<string, any>[] = payload.options ?? [];
  const childrenField: string = payload.childrenField ?? '';
  const searchableKeys: string[] = payload.keys ?? [];
  const enableFuzzySearch: boolean = !!payload.enableFuzzySearch;

  // Разбивает поисковую фразу на отдельные слова, убирая специальные символы
  // 'Какая-то фраза поиска и немного спец.символов +=-_()*?:%;№"!0123456789"'
  // -> ['какая', 'то', 'фраза', 'поиска', 'и', 'немного', 'спец', 'символов', '0123456789']
  const searchWords: RegExpMatchArray | [] =
    String(search)
      .toLowerCase()
      .match(/[\p{L}\d]+/gimu) ?? [];

  // Объединяем ключевые слова в одно
  const normalizedSearch: string = searchWords.join('|');

  // Если поисковой фразы нет, выходим
  if (!normalizedSearch) {
    return [];
  }

  const result: Record<string, any>[] = findMatchedItems({
    options,
    childrenField,
    keys: searchableKeys,
    queryWords: searchWords,
    query: normalizedSearch,
    enableFuzzySearch,
  });

  const hasHighest: boolean = result.some(item => item['match_score'] === 4);

  // Есть точное совпадение. Оставляем элементы только с ним
  if (hasHighest) {
    return result.filter(item => item['match_score'] === 4);
  }

  // Иначе оставляем весь найденный список.
  // Вывод отдельных приоритетов, кроме точного соответствия не показывает всю картину
  return result;
};

export type ClipboardActions = {
  copy: boolean;
  paste: boolean;
};

// Проверка поддержки браузером копирования/вставки
export const checkClipboardFunctionality = async (): Promise<ClipboardActions> => {
  const actions: ClipboardActions = {
    copy: false,
    paste: false,
  };

  if (!window.navigator?.clipboard) {
    return actions;
  }

  const { clipboard = {}, permissions = {} } = window.navigator;

  // Проверяем доступность функционала копирования в браузере
  actions.copy = 'writeText' in clipboard;

  // Проверяем доступность функционала вставки в браузере
  if (['query' in permissions, 'readText' in clipboard].every(Boolean)) {
    try {
      // Проверяем включённое разрешение в пользовательских настройках браузера
      const { state } = await (<Permissions>permissions).query({
        name: <PermissionName>'clipboard-read',
      });

      if (['granted', 'prompt'].some((allowedState: string): boolean => allowedState === state)) {
        actions.paste = true;
      }
    } catch (error) {
      console.error(`Check paste filed. ${(<Error>error).message}`);
    }
  }

  return actions;
};

// Получение UTM-меток из поисковой строки
export const getUTMLabels = (prefix: string = 'utm_'): Record<string, any> | null => {
  const queryString: string = window.location.search;

  const data: Record<string, any> = {};

  if (queryString.includes(prefix)) {
    const urlParams: URLSearchParams = new URLSearchParams(queryString);

    urlParams.forEach((value: string, key: string): void => {
      if (key.includes(prefix)) {
        data[key.replace(prefix, '')] = value.trim();
      }
    });
  }

  return Object.keys(data).length ? data : null;
};
