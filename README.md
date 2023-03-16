# Pure JS helpers plugin

## Установка

```shell
npm i purejs-helpers
```

или

```shell
yarn add purejs-helpers
```

## Использование

### Получение языка локализации по умолчанию

```javascript
import { locale } from 'purejs-helpers';

console.log(locale); // 'ru-RU'
```

### Определение окружения по домену

```javascript
import { getEnvironment } from 'purejs-helpers';

// http://localhost:8080/
getEnvironment(); // { server: 'production', mode: 'development' }
```

### Определение казахского домена

```javascript
import { isKZ } from 'purejs-helpers';

// https://any-domain.kz
isKZ(); // true
```

### Работа с Cookie

```javascript
import { cookie } from 'purejs-helpers';

cookie.get('any_key'); // 'value'

cookie.set('name', 'value', {
  'Domain': 'domain.com', // <string>
  'Path': '/page', // <string>. Default: '/'
  'Expires': new Date(3000, 11, 31), // <Date|string>
  'Max-Age': 3600, // <number>
  'HttpOnly': true, // <boolean>
  'Secure': true, // <boolean>
  'SameSite': 'Strict', // <string>. Strict | Lax | None
});

cookie.delete('any_key');
```

### Определение типа переданного значения

```javascript
import { getType } from 'purejs-helpers';

getType(); // 'Undefined'
getType([]); // 'Array'
getType({}); // 'Object'
getType(new Date()) // 'Date'
getType(() => {}); // 'Function'
getType(function() {}); // 'Function'
getType(Promise.resolve()); // 'Promise'
getType(new Proxy({}, {})); // 'Object'
getType(new Event('any')); // 'Event'
getType(42.13); // 'Number'
getType('string'); // 'String'
getType(''); // 'String'
getType(null); // 'Null'
getType(undefined); // 'Undefined'
```

### Добавление ведущего нуля

```javascript
import { leadingZero } from 'purejs-helpers';

leadingZero(9); // '09'
```

### Преобразование числа в сумму

```javascript
import { currencyMask } from 'purejs-helpers';

currencyMask(1840); // '1 840 ₽'
currencyMask(1840.621); // '1 840.6 ₽'
currencyMask(1840.621, 3); // '1 840.621 ₽'
```

### Проверка объекта даты на валидность

```javascript
import { dateIsValid } from 'purejs-helpers';

dateIsValid(null); // false
dateIsValid(new Date(); // true
dateIsValid(new Date('9999-99-99'); // false
dateIsValid(new Date('2023-03-16'); // true
```

### Преобразование даты в ISO формат

```javascript
import { toISODate } from 'purejs-helpers';

toISODate(new Date(2020, 9, 21)); // '2020-10-21'
```

### Преобразование даты в формат DD.MM.YYYY

```javascript
import { dateToDateShort } from 'purejs-helpers';

dateToDateShort(new Date(2020, 9, 21)); // '21.10.2020'
```

### Преобразование ISO даты в формат DD.MM.YYYY

```javascript
import { ISOToDateFormat } from 'purejs-helpers';

ISOToDateFormat('1979-12-03'); // '03.12.1979'
```

### Преобразование даты в формат DD.MM.YYYY, HH:MM

```javascript
import { dateTime } from 'purejs-helpers';

dateTime(new Date(2020, 9, 21, 8, 45)); // '21.10.2020, 08:45'
```

### Преобразование даты в формат WW, DD MMMM YYYY

```javascript
import { dateToDateLong } from 'purejs-helpers';

const date = new Date(2020, 9, 21);

dateToDateLong(date); // '21 октября 2020'
dateToDateLong(date, true); // 'ср, 21 октября 2020'
dateToDateLong(date, true, false); // 'ср, 21 октября'
dateToDateLong(date, false, false); // '21 октября'
```

### Преобразование даты в формат HH:MM

```javascript
import { dateToHoursMinutes } from 'purejs-helpers';

dateToHoursMinutes(new Date(2020, 9, 21, 8, 45)); // '08:45'
```

### Преобразование числа в формат времени HH:MM

```javascript
import { minutesToHoursMinutes } from 'purejs-helpers';

minutesToHoursMinutes(480); // '08:00'
```

### Получение объекта с московским временем из даты

```javascript
import { getMoscowTime } from 'purejs-helpers';

getMoscowTime('2022-05-02T08:00:00Z');
// { hour: '12', minute: '00', timestamp: 1643041320000 }
```

### Получение номера недели в году

```javascript
import { weekOfYear } from 'purejs-helpers';

weekOfYear(new Date(2020, 9, 21)); // 43
```

### Получения даты начала недели по номеру недели

```javascript
import { weekNumberToDate } from 'purejs-helpers';

weekNumberToDate(2020, 43); // Wed Oct 21 2020 00:00:00 GMT+0300
```

### Окончания русских слов

```javascript
import { wordEndings } from 'purejs-helpers';

wordEndings(17, ['метр', 'метра', 'метров']); // '17 метров'
```

### Преобразование числа в расстояние

```javascript
import { distanceFormat } from 'purejs-helpers';

distanceFormat(42); // '42 метра'
distanceFormat(42, true); // '42 м'
distanceFormat(1042); // '1.42 км'
```

### Получение преобразованного размера файла

```javascript
import { bytesToSize } from 'purejs-helpers';

bytesToSize(40031); // '39.09 кБ'
```

### Преобразование файла в Base64

```javascript
import { convertFileToBase64 } from 'purejs-helpers';

convertFileToBase64(<File>); // '<Base64>'
```

### Сокращение ФИО до формата ФффИО или ФфффИ (если нет отчества)

```javascript
import { shortName } from 'purejs-helpers';

shortName('Светлова Александра Андреевна'); // 'СвеАА'
shortName('Бекр фуркад'); // 'БекрФ'
shortName('cветлова'); // 'Светл'
```

### Удаление ключей из объекта с клонированием

```javascript
import { removeObjectKeys } from 'purejs-helpers';

removeObjectKeys(['a'], { a: 13, b: 42 }); // { b: 42 }
```

### Рекурсивное (глубокое) копирование объекта (массива)

```javascript
import { deepClone } from 'purejs-helpers';

const object = {
  foo: 'bar',
  obj: { a: 1, b: 2 },
  array: [{ id: 1, text: 42 }, 'string'],
  any: undefined,
  number: 0,
  date: new Date(),
};

deepClone(object);

const arr = [{ id: 1, text: 42 }, 'string'];

deepClone(arr);
```

### Мемоизация

```javascript
import { memo } from 'purejs-helpers';

const add = (x, y) => x + y;
const memoAdd = memo(add);

memoAdd(24, 42); // Calculated
memoAdd(42, 24); // From cache
```

### Поиск по поисковой фразе в списке по переданным ключам объекта

```javascript
import { searchByKeys } from 'purejs-helpers';

const options = [
  {
    title: 'Any',
    answer: {
      text: 'text',
    },
  },
];

searchByKeys({
  search: 'text any',
  options,
  keys: ['title', 'answer.text'],
});
```

### Проверка поддержки браузером копирования/вставки

```javascript
import { checkClipboardFunctionality } from 'purejs-helpers';

await checkClipboardFunctionality(); // { copy: true, paste: true }
```

### Получение UTM-меток из поисковой строки

```javascript
import { getUTMLabels } from 'purejs-helpers';

// https://any-domain?utm_any=value
getUTMLabels(); // { any: 'value' }
```

### Good Boy License

We’ve released the icon pack either under MIT or the Good Boy License. We invented it. Please do _whatever your mom would approve of:_

* Download
* Change
* Fork
