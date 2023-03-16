export const locale = 'ru-RU';

/**
 * Определение окружения по домену
 * https://any-verme.ru -> { server: 'any', mode: 'development' }
 * @param {string} [name='verme'] - ключевое имя
 * @return {{server: string, mode: string}}
 */
export const getEnvironment = (name = 'verme') => {
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
 * Определение казахского домена
 * https://any-domain.kz -> true
 * @return {boolean}
 */
export const isKZ = () => window.location.hostname.includes('.kz');

export const cookie = {
  /**
   * Формирование опций cookie
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
   * @param {string} name
   */
  delete(name) {
    const value = this.get(name) ? '<removed>' : '';

    this.set(name, value, {
      'Max-Age': -1,
    });
  },
};

/**
 * Определение типа переданного значения
 * @param {*} [value]
 * @return {string} - Undefined | Null | Number | String | Date | Function | Array | Object
 */
export const getType = value => {
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
 * Добавление ведущего нуля
 * 9 -> '09'
 * @param {string|number} value
 * @return {string}
 */
export const leadingZero = value => {
  const type = getType(value);
  const invalid = !value || !['Number', 'String'].some(allowed => allowed === type);
  const number = invalid ? 0 : value;

  return String(number).padStart(2, '0');
};

/**
 * Преобразование числа в сумму
 * 1840 -> '1 840 ₽'
 * @param {number|string} value
 * @param {number} [fraction=1]
 * @return {string}
 */
export const currencyMask = (value, fraction = 1) => {
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
 * Проверка объекта даты на валидность
 * @param {Date} [date]
 * @return {boolean}
 */
export const dateIsValid = date =>
  [!!date, date instanceof Date, !Number.isNaN(new Date(date).getTime())].every(Boolean);

/**
 * Преобразование даты в ISO формат
 * Wed Oct 21 2020 08:45:00 GMT+0300 -> '2020-10-21'
 * @param {Date} date
 * @return {string}
 */
export const toISODate = date => {
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
 * Преобразование даты в формат DD.MM.YYYY
 * Wed Oct 21 2020 08:45:00 GMT+0300 -> '21.10.2020'
 * @param {Date} date
 * @param {string} [timeZone='Europe/Moscow']
 * @return {string}
 */
export const dateToDateShort = (date, timeZone = 'Europe/Moscow') => {
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
 * Преобразование ISO даты в формат DD.MM.YYYY
 * '1979-12-03' -> '03.12.1979'
 * @param {string} ISODate
 * @param {string} [timeZone='Europe/Moscow']
 * @return {string}
 */
export const ISOToDateFormat = (ISODate, timeZone = 'Europe/Moscow') => {
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
 * Преобразование даты в формат DD.MM.YYYY, HH:MM
 * Wed Oct 21 2020 08:45:00 GMT+0300 -> '21.10.2020, 08:45'
 * @param {Date} date
 * @param {string} [timeZone='Europe/Moscow']
 * @return {string}
 */
export const dateTime = (date, timeZone = 'Europe/Moscow') => {
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
 * Преобразование даты в формат WW, DD MMMM YYYY
 * Wed Oct 21 2020 08:45:00 GMT+0300 -> '21 октября' | '21 октября 2020' | 'ср, 21 октября' | 'ср, 21 октября 2020'
 * @param {Object} payload={}
 * @param {Date} payload.date
 * @param {boolean} [payload.showWeekDay=false]
 * @param {boolean} [payload.showYear=true]
 * @param {string} [payload.timeZone='Europe/Moscow']
 * @return {string}
 */
export const dateToDateLong = (payload = {}) => {
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
 * Преобразование даты в формат HH:MM
 * Wed Oct 21 2020 08:45:00 GMT+0300 -> '08:45'
 * @param {Date} date
 * @param {string} [timeZone='Europe/Moscow']
 * @return {string}
 */
export const dateToHoursMinutes = (date, timeZone = 'Europe/Moscow') => {
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
 * Преобразование числа в формат времени HH:MM
 * 480 -> '08:00'
 * @param {number} value
 * @return {string}
 */
export const minutesToHoursMinutes = value => {
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
 * Получение объекта с московским временем из даты
 * "2022-05-02T08:00:00Z" -> { hour: '12', minute: '00', timestamp: 1643041320000 }
 * @param {string} dateString
 * @return {{hour: string, minute: string, timestamp: number}}
 */
export const getMoscowTime = dateString => {
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
 * Получение номера недели в году
 * Wed Oct 21 2020 08:45:00 GMT+0300 -> 43
 * @param {Date} [currentDate=Date]
 * @return {number}
 */
export const weekOfYear = (currentDate = new Date()) => {
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
 * Получения даты начала недели по номеру недели
 * 2020, 43 -> Wed Oct 21 2020 00:00:00 GMT+0300
 * @param {number} year
 * @param {number} weekNumber
 * @return {Date}
 */
export const weekNumberToDate = (year, weekNumber) => {
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
 * Окончания слов
 * wordEndings(17, ['метр', 'метра', 'метров']) -> '17 метров'
 * @param {number|string} amount
 * @param {Array} titles
 * @return {string}
 */
export const wordEndings = (amount, titles) => {
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
 * Преобразование числа в расстояние
 * 42 -> '42 метра' | 42 -> '42 м' | 1042 -> '1.42 км'
 * @param {number|string} distance
 * @param {boolean} [short=false]
 * @return {string}
 */
export const distanceFormat = (distance, short = false) => {
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
 * Получение преобразованного размера файла
 * 40031 -> '39.09 кБ'
 * @param {number} bytes
 * @return {string}
 */
export const bytesToSize = bytes => {
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
 * Преобразование файла в Base64
 * @param {File} file
 * @return {Promise<string>}
 */
export const convertFileToBase64 = file => {
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
 * Сокращение ФИО до формата ФффИО или ФфффИ (если нет отчества)
 * 'Светлова Александра Андреевна' -> 'СвеАА'
 * 'Бекр Фуркад' -> 'БекрФ'
 * @param {string} fullName
 * @return {string}
 */
export const shortName = fullName => {
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
 * Удаление ключей из объекта
 * ['a'], { a: 13, b: 42 } -> { b: 42 }
 * @param {Array} exclusionFields
 * @param {Object} sourceObject
 * @return {Object}
 */
export const removeObjectKeys = (exclusionFields, sourceObject) => {
  const object = { ...(sourceObject || {}) };

  (exclusionFields || []).forEach(key => {
    delete object[key];
  });

  return object;
};

/**
 * Рекурсивное (глубокое) копирование объекта (массива)
 * @param {Object} sourceObject
 * @return {Object}
 */
export const deepClone = sourceObject => {
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
 * Мемоизация
 * const add = (x, y) => x + y;
 * const memoAdd = memo(add);
 *
 * memoAdd(24, 42); // Calculated
 * memoAdd(42, 24); // From cache
 * @param {Function} callback
 * @return {Function}
 */
export const memo = callback =>
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
 * Поиск по поисковой фразе в списке по переданным ключам объекта
 * @param {Object} payload={}
 * @param {string} [payload.search=''] - поисковая фраза
 * @param {Object[]} [payload.options=[]] - список объектов
 * @param {string[]} [payload.keys=[]] - список ключей объекта
 * @return {object[]} - Возвращает отфильтрованный список объект по поисковым словам
 */
export const searchByKeys = (payload = {}) => {
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
 * Проверка поддержки браузером копирования/вставки
 * @return {{copy: boolean, paste: boolean}}
 */
export const checkClipboardFunctionality = async () => {
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
 * Получение UTM-меток из поисковой строки
 * @param {string} prefix='utm_'
 * @return {Object|null}
 */
export const getUTMLabels = async (prefix = 'utm_') => {
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
