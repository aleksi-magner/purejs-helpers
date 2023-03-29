/**
 * Вспомогательные функции.
 * @author Aleksey Magner
 * @license MIT
 */

/**
 * Локализация по умолчанию
 * @const locale
 */
const locale = 'ru-RU';
/**
 * Локализация по умолчанию
 * @const locale
 */
exports.locale = locale;

/**
 * Определение окружения по домену
 * @function getEnvironment
 * @param {string} [name='verme'] - ключевое имя
 * @return {{server: string, mode: string}}
 * @example https://any-verme.ru -> { server: 'any', mode: 'development' }
 */
const getEnvironment = (name = 'verme') => {
  const URL = window.location.hostname;

  const isLocalServer = ['127.0.0.1', 'localhost'].includes(URL);
  const regExp = new RegExp(['(?=-).*(?=\\.', name, ')'].join(''));
  const environment = URL.match(regExp)?.[0].replace('-', '') || 'production';

  return {
    server: environment,
    mode: isLocalServer || environment !== 'production' ? 'development' : 'production',
  };
};
/**
 * Определение окружения по домену
 * @function getEnvironment
 * @param {string} [name='verme'] - ключевое имя
 * @return {{server: string, mode: string}}
 * @example https://any-verme.ru -> { server: 'any', mode: 'development' }
 */
exports.getEnvironment = getEnvironment;

/**
 * Определение казахского домена
 * @function isKZ
 * @return {boolean}
 * @example https://any-domain.kz -> true
 */
const isKZ = () => window.location.hostname.includes('.kz');
/**
 * Определение казахского домена
 * @function isKZ
 * @return {boolean}
 * @example https://any-domain.kz -> true
 */
exports.isKZ = isKZ;

/** Работа с Cookie */
const cookie = {
  /**
   * Формирование опций cookie
   * @method createOptions
   * @param {Object} [options={}]
   * @return {string}
   */
  createOptions(options = {}) {
    const allowedOptions = [
      'Domain',
      'Path',
      'Expires',
      'Max-Age',
      'HttpOnly',
      'Secure',
      'SameSite',
    ];

    const cookieOptions = {
      Path: '/',
    };

    for (const key in options) {
      const option = allowedOptions.find(code => code.toLowerCase() === key.toLowerCase());

      const value = options[key];

      switch (option) {
        case 'Domain':
        case 'Path':
          if (typeof value === 'string') {
            cookieOptions[option] = value;
          }

          break;

        case 'Expires': {
          cookieOptions[option] = value instanceof Date ? value.toUTCString() : value;

          delete cookieOptions['Max-Age'];

          break;
        }

        case 'Max-Age': {
          if (typeof value === 'number') {
            cookieOptions[option] = value;

            delete cookieOptions['Expires'];
          }

          break;
        }

        case 'HttpOnly':
        case 'Secure':
          if (value === true) {
            cookieOptions[option] = '';
          }

          break;

        case 'SameSite': {
          if (['None', 'Strict', 'Lax'].some(code => code === value)) {
            cookieOptions[option] = value;
          }

          break;
        }
      }
    }

    const optionsText = [];

    Object.entries(cookieOptions).forEach(pair => {
      const value = pair.filter(Boolean).join('=');

      optionsText.push(value);
    });

    return optionsText.join('; ');
  },
  /**
   * Получение значения из Cookie по ключу
   * @method get
   * @param {string} name
   * @return {string}
   */
  get(name) {
    if (!name) {
      return '';
    }

    const pairs = document.cookie.split(';').map(value => value.trim());

    const encodeName = encodeURIComponent(name);
    const valueIndex = pairs.findIndex(string => string.includes(encodeName));

    if (valueIndex !== -1) {
      const [, value] = pairs[valueIndex].split('=');

      return value ? decodeURIComponent(value) : '';
    }

    return '';
  },
  /**
   * Установка значения в Cookie по ключу
   * @method set
   * @param {string} name
   * @param {string} value
   * @param {{
   *   Domain?: string,
   *   Path?: string,
   *   Expires?: (Date|string),
   *   'Max-Age'?: number,
   *   HttpOnly?: boolean,
   *   Secure?: boolean,
   *   SameSite?: string
   * }} [options]
   * @example SameSite: Strict | Lax | None
   */
  set(name, value, options) {
    if (!name) {
      return;
    }

    const pair = [name, value]
      .filter(Boolean)
      .map(string => encodeURIComponent(string.trim()))
      .join('=');

    const params = this.createOptions(options);

    document.cookie = [pair, params].join('; ');
  },
  /**
   * Удаление Cookie по ключу
   * @method delete
   * @param {string} name
   */
  delete(name) {
    const value = this.get(name) ? '<removed>' : '';

    this.set(name, value, {
      'Max-Age': -1,
    });
  },
};
/** Работа с Cookie */
exports.cookie = cookie;

/**
 * Определение типа переданного значения
 * @function getType
 * @param {*} [value]
 * @return {string}
 * @example Undefined | Null | Number | String | Date | Function | Array | Object
 */
const getType = value => {
  switch (value) {
    case undefined:
      return 'Undefined';
    case null:
      return 'Null';
    default:
      return value.constructor.name;
  }
};
/**
 * Определение типа переданного значения
 * @function getType
 * @param {*} [value]
 * @return {string}
 * @example Undefined | Null | Number | String | Date | Function | Array | Object
 */
exports.getType = getType;

/**
 * Добавление ведущего нуля
 * @function leadingZero
 * @param {string|number} value
 * @return {string}
 * @example
 * leadingZero(9); // '09'
 */
const leadingZero = value => {
  const type = getType(value);
  const invalid = !value || !['Number', 'String'].some(allowed => allowed === type);
  const number = invalid ? 0 : value;

  return String(number).padStart(2, '0');
};
/**
 * Добавление ведущего нуля
 * @function leadingZero
 * @param {string|number} value
 * @return {string}
 * @example
 * leadingZero(9); // '09'
 */
exports.leadingZero = leadingZero;

/**
 * Преобразование числа в сумму
 * @function currencyMask
 * @param {number|string} value - Значение суммы
 * @param {number} [fraction=1] - Количество символов после запятой
 * @return {string}
 * @example
 * currencyMask(1840); // '1 840 ₽'
 */
const currencyMask = (value, fraction = 1) => {
  const KZ = isKZ();
  const currencyLocale = KZ ? 'ru-KZ' : 'ru-RU';
  const currency = KZ ? 'KZT' : 'RUB';

  return new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: fraction,
  }).format(value || 0);
};
/**
 * Преобразование числа в сумму
 * @function currencyMask
 * @param {number|string} value - Значение суммы
 * @param {number} [fraction=1] - Количество символов после запятой
 * @return {string}
 * @example
 * currencyMask(1840); // '1 840 ₽'
 */
exports.currencyMask = currencyMask;

/**
 * Проверка объекта даты на валидность
 * @function dateIsValid
 * @param {Date} date
 * @return {boolean}
 */
const dateIsValid = date =>
  [!!date, date instanceof Date, !Number.isNaN(new Date(date).getTime())].every(Boolean);
/**
 * Проверка объекта даты на валидность
 * @function dateIsValid
 * @param {Date} date
 * @return {boolean}
 */
exports.dateIsValid = dateIsValid;

/**
 * Преобразование даты в ISO формат
 * @function toISODate
 * @param {Date} date
 * @return {string}
 * @example
 * toISODate(new Date('2020-10-21T08:45:00')); // '2020-10-21'
 */
const toISODate = date => {
  if (!dateIsValid(date)) {
    return '';
  }

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  return new Intl.DateTimeFormat('ru-RU', options).format(date).split('.').reverse().join('-');
};
/**
 * Преобразование даты в ISO формат
 * @function toISODate
 * @param {Date} date
 * @return {string}
 * @example
 * toISODate(new Date('2020-10-21T08:45:00')); // '2020-10-21'
 */
exports.toISODate = toISODate;

/**
 * Преобразование даты в формат DD.MM.YYYY
 * @function dateToDateShort
 * @param {Date} date - Дата
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * dateToDateShort(new Date('2020-10-21T08:45:00')); // '21.10.2020'
 */
const dateToDateShort = (date, timeZone = 'Europe/Moscow') => {
  if (!dateIsValid(date)) {
    return '';
  }

  const options = {
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
 * Преобразование даты в формат DD.MM.YYYY
 * @function dateToDateShort
 * @param {Date} date - Дата
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * dateToDateShort(new Date('2020-10-21T08:45:00')); // '21.10.2020'
 */
exports.dateToDateShort = dateToDateShort;

/**
 * Преобразование ISO даты в формат DD.MM.YYYY
 * @function ISOToDateFormat
 * @param {string} ISODate - Дата в формате ISO
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * ISOToDateFormat('1979-12-03'); // '03.12.1979'
 */
const ISOToDateFormat = (ISODate, timeZone = 'Europe/Moscow') => {
  const datePattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/; // 'YYYY-MM-DD'

  const invalid = [!ISODate, getType(ISODate) !== 'String', !datePattern.test(ISODate)].some(
    Boolean,
  );

  if (invalid) {
    return '';
  }

  const options = {
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
 * Преобразование ISO даты в формат DD.MM.YYYY
 * @function ISOToDateFormat
 * @param {string} ISODate - Дата в формате ISO
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * ISOToDateFormat('1979-12-03'); // '03.12.1979'
 */
exports.ISOToDateFormat = ISOToDateFormat;

/**
 * Преобразование даты в формат DD.MM.YYYY, HH:MM
 * @function dateTime
 * @param {Date} date - Дата
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * dateTime(new Date('2020-10-21T08:45:00')); // '21.10.2020, 08:45'
 */
const dateTime = (date, timeZone = 'Europe/Moscow') => {
  if (!dateIsValid(date)) {
    return '';
  }

  const options = {
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
/**
 * Преобразование даты в формат DD.MM.YYYY, HH:MM
 * @function dateTime
 * @param {Date} date - Дата
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * dateTime(new Date('2020-10-21T08:45:00')); // '21.10.2020, 08:45'
 */
exports.dateTime = dateTime;

/**
 * Преобразование даты в формат WW, DD MMMM YYYY
 * @function dateToDateLong
 * @param {Object} payload={}
 * @param {Date} payload.date - Дата
 * @param {boolean} [payload.showWeekDay=false] - Показ дня недели
 * @param {boolean} [payload.showYear=true] - Показ года
 * @param {string} [payload.timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
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
const dateToDateLong = (payload = {}) => {
  if (!dateIsValid(payload.date)) {
    return '';
  }

  const { date } = payload;
  const showWeekDay = payload.showWeekDay ?? false;
  const showYear = payload.showYear ?? true;
  const timeZone = payload.timeZone ?? 'Europe/Moscow';

  const options = {
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

  const longDate = new Intl.DateTimeFormat(locale, options).format(date);

  return showYear ? longDate.slice(0, -3) : longDate;
};
/**
 * Преобразование даты в формат WW, DD MMMM YYYY
 * @function dateToDateLong
 * @param {Object} payload={}
 * @param {Date} payload.date - Дата
 * @param {boolean} [payload.showWeekDay=false] - Показ дня недели
 * @param {boolean} [payload.showYear=true] - Показ года
 * @param {string} [payload.timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
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
exports.dateToDateLong = dateToDateLong;

/**
 * Преобразование даты в формат HH:MM
 * @function dateToHoursMinutes
 * @param {Date} date - Дата
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * dateToHoursMinutes(new Date('2020-10-21')); // '08:45'
 */
const dateToHoursMinutes = (date, timeZone = 'Europe/Moscow') => {
  if (!dateIsValid(date)) {
    return '00:00';
  }

  const options = {
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
 * Преобразование даты в формат HH:MM
 * @function dateToHoursMinutes
 * @param {Date} date - Дата
 * @param {string} [timeZone='Europe/Moscow'] - Часовой пояс
 * @return {string}
 * @example
 * dateToHoursMinutes(new Date('2020-10-21')); // '08:45'
 */
exports.dateToHoursMinutes = dateToHoursMinutes;

/**
 * Преобразование числа в формат HH:MM
 * @function minutesToHoursMinutes
 * @param {number} value
 * @return {string}
 * @example minutesToHoursMinutes(480); // '08:00'
 */
const minutesToHoursMinutes = value => {
  const type = getType(value);
  const invalid = !value || type !== 'Number';
  const number = invalid ? 0 : value;

  const absNumber = Math.abs(number);
  const sign = number < 0 ? '-' : '';

  const hours = leadingZero(Math.floor(absNumber / 60));
  const minutes = leadingZero(absNumber % 60);

  const time = [hours, minutes].join(':');

  return [sign, time].join('');
};
/**
 * Преобразование числа в формат HH:MM
 * @function minutesToHoursMinutes
 * @param {number} value
 * @return {string}
 * @example minutesToHoursMinutes(480); // '08:00'
 */
exports.minutesToHoursMinutes = minutesToHoursMinutes;

/**
 * Получение объекта с московским временем из даты
 * @function getMoscowTime
 * @param {string} dateString
 * @return {{hour: string, minute: string, timestamp: number}}
 * @example
 * // { hour: '12', minute: '00', timestamp: 1643041320000 }
 * getMoscowTime('2022-05-02T08:00:00Z');
 */
const getMoscowTime = dateString => {
  const date = new Date(dateString);

  if (!dateString || !dateIsValid(date)) {
    return {
      hour: '00',
      minute: '00',
      timestamp: 0,
    };
  }

  const offset = +3;

  const newDate = new Date(date.getTime() + offset * 3600 * 1000)
    .toUTCString()
    .replace(/ GMT$/, '');

  const localTime = new Date(newDate);

  return {
    hour: leadingZero(localTime.getHours()),
    minute: leadingZero(localTime.getMinutes()),
    timestamp: localTime.getTime(),
  };
};
/**
 * Получение объекта с московским временем из даты
 * @function getMoscowTime
 * @param {string} dateString
 * @return {{hour: string, minute: string, timestamp: number}}
 * @example
 * // { hour: '12', minute: '00', timestamp: 1643041320000 }
 * getMoscowTime('2022-05-02T08:00:00Z');
 */
exports.getMoscowTime = getMoscowTime;

/**
 * Получение номера недели в году
 * @function weekOfYear
 * @param {Date} [currentDate=Date] - Дата
 * @return {number}
 * @example
 * weekOfYear(new Date('2020-10-21')); // 43
 */
const weekOfYear = (currentDate = new Date()) => {
  if (!dateIsValid(currentDate)) {
    return 0;
  }

  const date = new Date(currentDate.getTime());

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));

  const firstWeek = new Date(date.getFullYear(), 0, 4);
  const MILLISECONDS_IN_DAY = 86400000; // 24 * 60 * 60 * 1000

  const currentYearDay = (date.getTime() - firstWeek.getTime()) / MILLISECONDS_IN_DAY;

  return 1 + Math.round((currentYearDay - 3 + ((firstWeek.getDay() + 6) % 7)) / 7);
};
/**
 * Получение номера недели в году
 * @function weekOfYear
 * @param {Date} [currentDate=Date] - Дата
 * @return {number}
 * @example
 * weekOfYear(new Date('2020-10-21')); // 43
 */
exports.weekOfYear = weekOfYear;

/**
 * Получения даты начала недели по номеру недели
 * @function weekNumberToDate
 * @param {number} year
 * @param {number} weekNumber
 * @return {Date}
 * @example
 * weekNumberToDate(2020, 43); // Wed Oct 21 2020 00:00:00 GMT+0300
 */
const weekNumberToDate = (year, weekNumber) => {
  const validYear = !year || getType(year) !== 'Number' ? new Date().getFullYear() : year;
  const validWeek = !weekNumber || getType(weekNumber) !== 'Number' ? weekOfYear() : weekNumber;

  const startOfYear = new Date(validYear, 0, 1 + (validWeek - 1) * 7);

  const day = startOfYear.getDay();
  const date = startOfYear.getDate() + (day <= 4 ? -day + 1 : 8 - day);

  startOfYear.setDate(date);
  startOfYear.setHours(0, 0, 0, 0);

  return startOfYear;
};
/**
 * Получения даты начала недели по номеру недели
 * @function weekNumberToDate
 * @param {number} year
 * @param {number} weekNumber
 * @return {Date}
 * @example
 * weekNumberToDate(2020, 43); // Wed Oct 21 2020 00:00:00 GMT+0300
 */
exports.weekNumberToDate = weekNumberToDate;

/**
 * Окончания слов
 * @function wordEndings
 * @param {number|string} amount
 * @param {Array} titles
 * @return {string}
 * @example
 * wordEndings(17, ['метр', 'метра', 'метров']); // '17 метров'
 */
const wordEndings = (amount, titles) => {
  const amountType = getType(amount);
  const validAmount = ['Number', 'String'].some(allowed => allowed === amountType);

  const titlesType = getType(titles);
  const validTitles = [titlesType === 'Array', titles?.length === 3].every(Boolean);

  if (!validAmount || !validTitles) {
    return '';
  }

  const number = Number.parseFloat(amount || 0);
  const formatNumber = new Intl.NumberFormat('ru-RU').format(number);

  let word;

  // RU
  if (number % 10 === 1 && number % 100 !== 11) {
    word = titles[0];
  } else if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
    word = titles[1];
  } else {
    word = titles[2];
  }

  return [formatNumber, word].join(' ');
};
/**
 * Окончания слов
 * @function wordEndings
 * @param {number|string} amount
 * @param {Array} titles
 * @return {string}
 * @example
 * wordEndings(17, ['метр', 'метра', 'метров']); // '17 метров'
 */
exports.wordEndings = wordEndings;

/**
 * Преобразование числа в расстояние
 * @function distanceFormat
 * @param {number|string} distance
 * @param {boolean} [short=false] - Сокращённый формат
 * @return {string}
 * @example
 * distanceFormat(42); // '42 метра'
 * distanceFormat(42, true); // '42 м'
 * distanceFormat(1042); // '1.42 км'
 */
const distanceFormat = (distance, short = false) => {
  const type = getType(distance);
  const validType = ['Number', 'String'].some(allowed => allowed === type);

  if (!distance || !validType) {
    return '';
  }

  const validDistance = Number.parseFloat(distance);

  if (validDistance > 900) {
    return `${Math.round((validDistance / 1000) * 10) / 10} км`;
  } else if (short) {
    return `${new Intl.NumberFormat(locale).format(validDistance)} м`;
  }

  return wordEndings(validDistance, ['метр', 'метра', 'метров']);
};
/**
 * Преобразование числа в расстояние
 * @function distanceFormat
 * @param {number|string} distance
 * @param {boolean} [short=false] - Сокращённый формат
 * @return {string}
 * @example
 * distanceFormat(42); // '42 метра'
 * distanceFormat(42, true); // '42 м'
 * distanceFormat(1042); // '1.42 км'
 */
exports.distanceFormat = distanceFormat;

/**
 * Получение преобразованного размера файла
 * @function bytesToSize
 * @param {number} bytes
 * @return {string}
 * @example bytesToSize(40031); // '39.09 кБ'
 */
const bytesToSize = bytes => {
  const invalid = [!bytes, getType(bytes) !== 'Number'].some(Boolean);

  if (invalid) {
    return '0 байт';
  }

  const kiloByte = 1024;
  const unit = ['байт', 'кБ', 'МБ', 'ГБ', 'ТБ', 'ПБ', 'ЭБ', 'ЗБ', 'ИБ'];

  if (bytes < kiloByte) {
    return wordEndings(bytes, ['байт', 'байта', 'байт']);
  }

  const sizeIndex = Math.floor(Math.log(bytes) / Math.log(kiloByte));
  const size = Math.round((bytes / kiloByte ** sizeIndex) * 100) / 100;

  return [size, unit[sizeIndex]].join(' ');
};
/**
 * Получение преобразованного размера файла
 * @function bytesToSize
 * @param {number} bytes
 * @return {string}
 * @example bytesToSize(40031); // '39.09 кБ'
 */
exports.bytesToSize = bytesToSize;

/**
 * Преобразование файла в Base64
 * @function convertFileToBase64
 * @param {File} file
 * @return {Promise<string>}
 */
const convertFileToBase64 = file => {
  if (!file) {
    return Promise.resolve('');
  }

  const reader = new FileReader();

  return new Promise(resolve => {
    reader.onload = () => {
      resolve(reader.result.split('base64,', 2)[1]);
    };

    reader.readAsDataURL(file);
  });
};
/**
 * Преобразование файла в Base64
 * @function convertFileToBase64
 * @param {File} file
 * @return {Promise<string>}
 */
exports.convertFileToBase64 = convertFileToBase64;

/**
 * Сокращение ФИО до формата ФффИО или ФфффИ (если нет отчества)
 * @function shortName
 * @param {string} fullName
 * @return {string}
 * @example
 * shortName('Светлова Александра Андреевна'); // 'СвеАА'
 * shortName('Бекр Фуркад'); // 'БекрФ'
 */
const shortName = fullName => {
  const invalid = [!fullName, getType(fullName) !== 'String'].some(Boolean);

  if (invalid) {
    return '――';
  }

  const [surname, firstname, patronymic] = fullName
    .match(/[^\s\d_.,'"`;:]+/gi)
    .map(item => [item[0].toUpperCase(), item.slice(1)].join(''));

  const firstnameInitials = firstname ? firstname.slice(0, 1) : '';
  const patronymicInitials = patronymic ? patronymic.slice(0, 1) : '';

  let limit;

  if (patronymic) {
    limit = 3;
  } else if (firstname) {
    limit = 4;
  } else {
    limit = 5;
  }

  return [surname.slice(0, limit), firstnameInitials, patronymicInitials].join('');
};
/**
 * Сокращение ФИО до формата ФффИО или ФфффИ (если нет отчества)
 * @function shortName
 * @param {string} fullName
 * @return {string}
 * @example
 * shortName('Светлова Александра Андреевна'); // 'СвеАА'
 * shortName('Бекр Фуркад'); // 'БекрФ'
 */
exports.shortName = shortName;

/**
 * Удаление ключей из объекта
 * @function removeObjectKeys
 * @param {Array} exclusionFields
 * @param {Object} sourceObject
 * @return {Object}
 * @example
 * removeObjectKeys(['a'], { a: 13, b: 42 }); // { b: 42 }
 */
const removeObjectKeys = (exclusionFields, sourceObject) => {
  const object = { ...(sourceObject || {}) };

  (exclusionFields || []).forEach(key => {
    delete object[key];
  });

  return object;
};
/**
 * Удаление ключей из объекта
 * @function removeObjectKeys
 * @param {Array} exclusionFields
 * @param {Object} sourceObject
 * @return {Object}
 * @example
 * removeObjectKeys(['a'], { a: 13, b: 42 }); // { b: 42 }
 */
exports.removeObjectKeys = removeObjectKeys;

/**
 * Рекурсивное (глубокое) копирование объекта (массива)
 * @function deepClone
 * @param {Object} sourceObject
 * @return {Object}
 */
const deepClone = sourceObject => {
  if (!sourceObject || typeof sourceObject !== 'object') {
    return sourceObject;
  } else if (sourceObject instanceof Date) {
    return new Date(sourceObject);
  }

  const clone = Array.isArray(sourceObject)
    ? [].concat(sourceObject)
    : Object.assign({}, sourceObject);

  Object.keys(clone).forEach(key => {
    const value = sourceObject[key];

    clone[key] = typeof value === 'object' ? deepClone(value) : value;
  });

  return clone;
};
/**
 * Рекурсивное (глубокое) копирование объекта (массива)
 * @function deepClone
 * @param {Object} sourceObject
 * @return {Object}
 */
exports.deepClone = deepClone;

/**
 * Мемоизация
 * @function memo
 * @param {Function} callback
 * @return {Function}
 * @example
 * const add = (x, y) => x + y;
 * const memoAdd = memo(add);
 *
 * memoAdd(24, 42); // Calculated
 * memoAdd(42, 24); // From cache
 */
const memo = callback =>
  new Proxy(callback, {
    cache: new Map(),
    apply(fn, context, args) {
      args.sort();

      const key = args.toString();

      if (!this.cache.has(key)) {
        this.cache.set(key, fn.apply(context, args));
      }

      return this.cache.get(key);
    },
  });
/**
 * Мемоизация
 * @function memo
 * @param {Function} callback
 * @return {Function}
 * @example
 * const add = (x, y) => x + y;
 * const memoAdd = memo(add);
 *
 * memoAdd(24, 42); // Calculated
 * memoAdd(42, 24); // From cache
 */
exports.memo = memo;

/**
 * Поиск по поисковой фразе в списке по переданным ключам объекта
 * @function searchByKeys
 * @param {Object} payload={}
 * @param {string} [payload.search=''] - поисковая фраза
 * @param {Object[]} [payload.options=[]] - список объектов
 * @param {string[]} [payload.keys=[]] - список ключей объекта
 * @return {object[]} - Возвращает отфильтрованный список объект по поисковым словам
 */
const searchByKeys = (payload = {}) => {
  const search = payload.search || '';
  const options = payload.options || [];
  const searchableKeys = payload.keys || [];

  const searchWords =
    String(search)
      .toLowerCase()
      .match(/[\p{L}\d]+/gimu) || [];

  return options.flatMap(item => {
    const concatValue = searchableKeys
      .map(key => {
        const nestedKey = key.split('.');

        // Если ключ с вложениями, перебираем все вложения
        // key a.b, object.a.b: 'value' -> 'value'
        const nestedValue = nestedKey.reduce((accumulator, prop) => accumulator?.[prop], item);

        return String(nestedValue).toLowerCase();
      })
      .filter(Boolean)
      .join(', ');

    const matchingStrings = searchWords.filter(word => concatValue.includes(word));

    return matchingStrings.length === searchWords.length ? [item] : [];
  });
};
/**
 * Поиск по поисковой фразе в списке по переданным ключам объекта
 * @function searchByKeys
 * @param {Object} payload={}
 * @param {string} [payload.search=''] - поисковая фраза
 * @param {Object[]} [payload.options=[]] - список объектов
 * @param {string[]} [payload.keys=[]] - список ключей объекта
 * @return {object[]} - Возвращает отфильтрованный список объект по поисковым словам
 */
exports.searchByKeys = searchByKeys;

/**
 * Проверка поддержки браузером копирования/вставки
 * @function checkClipboardFunctionality
 * @return {{copy: boolean, paste: boolean}}
 */
const checkClipboardFunctionality = async () => {
  const actions = {
    copy: false,
    paste: false,
  };

  if (!window.navigator?.clipboard) {
    return actions;
  }

  const { clipboard = {}, permissions = {} } = window.navigator;

  // Проверяем доступность функционала копирования в браузере
  if ('writeText' in clipboard) {
    try {
      await clipboard.writeText('');

      actions.copy = true;
    } catch (error) {
      console.error(`Check copy filed. ${error.message}`);
    }
  }

  // Проверяем доступность функционала вставки в браузере
  if (['query' in permissions, 'readText' in clipboard].every(Boolean)) {
    try {
      // Проверяем включённое разрешение в пользовательских настройках браузера
      const { state } = await permissions.query({
        name: 'clipboard-read',
      });

      if (['granted', 'prompt'].some(allowedState => allowedState === state)) {
        actions.paste = true;
      }
    } catch (error) {
      console.error(`Check paste filed. ${error.message}`);
    }
  }

  return actions;
};
/**
 * Проверка поддержки браузером копирования/вставки
 * @function checkClipboardFunctionality
 * @return {{copy: boolean, paste: boolean}}
 */
exports.checkClipboardFunctionality = checkClipboardFunctionality;

/**
 * Получение UTM-меток из поисковой строки
 * @function getUTMLabels
 * @param {string} prefix='utm_' - Префикс метки
 * @return {Object|null}
 */
const getUTMLabels = async (prefix = 'utm_') => {
  const queryString = window.location.search;

  const data = {};

  if (queryString.includes(prefix)) {
    const urlParams = new URLSearchParams(queryString);

    urlParams.forEach((value, key) => {
      if (key.includes(prefix)) {
        data[key.replace(prefix, '')] = value.trim();
      }
    });
  }

  return Object.keys(data).length ? data : null;
};
/**
 * Получение UTM-меток из поисковой строки
 * @function getUTMLabels
 * @param {string} prefix='utm_' - Префикс метки
 * @return {Object|null}
 */
exports.getUTMLabels = getUTMLabels;
