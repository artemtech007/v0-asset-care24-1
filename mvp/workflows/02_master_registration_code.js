// Code нода для обработки данных веб-регистрации мастера
// Файл: 02_master_registration_code.js
// Используется в n8n Code Node для workflow регистрации мастеров

// === КОНФИГУРАЦИЯ ===
const CONFIG = {
  // Входное поле с ISO timestamp
  inputTimestampField: 'body.timestamp',
  // Выходные поля для timestamp
  outputTimestampFields: {
    date: 'registration_date',           // дата YYYY-MM-DD
    month: 'registration_month',         // месяц (1-12)
    day: 'registration_day',             // день (1-31)
    time: 'registration_time',           // время HH:MM:SS
    year: 'registration_year'            // год YYYY
  },
  // Поле с WhatsApp номером
  whatsappField: 'body.whatsapp',
  // Выходные поля для WhatsApp
  outputWhatsappFields: {
    normalized: 'wa_norm',               // нормализованный номер без +
    masterId: 'master_id'                // полный ID мастера
  },
  // Поля для специализаций (для преобразования массива в булевы поля)
  specializationFields: {
    elektrik: 'spec_elektrik',
    sanitaer: 'spec_sanitaer',
    heizung: 'spec_heizung',
    maler: 'spec_maler',
    elektriker: 'spec_elektriker',
    klempner: 'spec_klempner',
    schlosser: 'spec_schlosser',
    garten: 'spec_garten',
    reinigung: 'spec_reinigung',
    other: 'spec_other'
  },
  // Рабочие дни теперь приходят в булевом формате из вебхука (work_mo, work_di, etc.)
  // Локаль для форматирования
  locale: 'ru-RU'
};
// === КОНЕЦ КОНФИГУРАЦИИ ===

// Функция для преобразования ISO timestamp в читаемые компоненты
function parseISOTimestamp(isoString, config) {
  const date = new Date(isoString);

  // Проверяем валидность даты
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${isoString}`);
  }

  return {
    [config.outputTimestampFields.date]: date.toISOString().split('T')[0], // YYYY-MM-DD
    [config.outputTimestampFields.month]: date.getMonth() + 1, // 1-12
    [config.outputTimestampFields.day]: date.getDate(), // 1-31
    [config.outputTimestampFields.time]: date.toISOString().split('T')[1].split('.')[0], // HH:MM:SS
    [config.outputTimestampFields.year]: date.getFullYear() // YYYY
  };
}

// Функция для преобразования массива специализаций в булевы поля
function convertSpecializationsToBooleans(specializationsArray, config) {
  const result = {};

  // Сначала устанавливаем все специализации в false
  Object.values(config.specializationFields).forEach(field => {
    result[field] = false;
  });

  // Если массив передан и не пустой
  if (Array.isArray(specializationsArray) && specializationsArray.length > 0) {
    // Проходим по каждой специализации из массива
    specializationsArray.forEach(spec => {
      // Нормализуем название специализации (приводим к нижнему регистру, убираем пробелы)
      const normalizedSpec = spec.toLowerCase().replace(/\s+/g, '');

      // Ищем соответствующее поле в конфигурации
      const fieldName = config.specializationFields[normalizedSpec];
      if (fieldName) {
        result[fieldName] = true;
      } else {
        // Если специализация не найдена в конфигурации, записываем в "other"
        result[config.specializationFields.other] = true;
      }
    });
  }

  return result;
}

// Убрана функция convertWorkingDaysToBooleans - рабочие дни теперь приходят в булевом формате из вебхука

// Функция для нормализации WhatsApp номера
function normalizeWhatsappNumber(whatsappNumber) {
  if (!whatsappNumber || typeof whatsappNumber !== 'string') {
    throw new Error(`Invalid WhatsApp number: ${whatsappNumber}`);
  }

  // Убираем + в начале и любые не-цифровые символы
  const normalized = whatsappNumber.replace(/^\+/, '').replace(/\D/g, '');

  if (normalized.length < 10) {
    throw new Error(`WhatsApp number too short: ${normalized}`);
  }

  return normalized;
}

// Основная логика обработки
for (let i = 0; i < $input.all().length; i++) {
  const item = $input.all()[i];

  // 1. Обрабатываем timestamp
  if (item.json.body && item.json.body.timestamp) {
    const isoTimestamp = item.json.body.timestamp;
    try {
      const timestampFields = parseISOTimestamp(isoTimestamp, CONFIG);
      // Добавляем поля к body
      Object.assign(item.json.body, timestampFields);
    } catch (error) {
      console.error(`Error parsing timestamp ${isoTimestamp}:`, error.message);
      // В случае ошибки добавляем пустые значения
      Object.assign(item.json.body, {
        [CONFIG.outputTimestampFields.date]: null,
        [CONFIG.outputTimestampFields.month]: null,
        [CONFIG.outputTimestampFields.day]: null,
        [CONFIG.outputTimestampFields.time]: null,
        [CONFIG.outputTimestampFields.year]: null
      });
    }
  }

  // 2. Обрабатываем WhatsApp номер
  if (item.json.body && item.json.body.whatsapp) {
    const whatsappNumber = item.json.body.whatsapp;
    try {
      const normalizedNumber = normalizeWhatsappNumber(whatsappNumber);
      const masterId = `mid_wa_${normalizedNumber}`;

      // Добавляем поля к body
      Object.assign(item.json.body, {
        [CONFIG.outputWhatsappFields.normalized]: normalizedNumber,
        [CONFIG.outputWhatsappFields.masterId]: masterId
      });
    } catch (error) {
      console.error(`Error processing WhatsApp number ${whatsappNumber}:`, error.message);
      // В случае ошибки добавляем пустые значения
      Object.assign(item.json.body, {
        [CONFIG.outputWhatsappFields.normalized]: null,
        [CONFIG.outputWhatsappFields.masterId]: null
      });
    }
  }

  // 3. Преобразуем массив специализаций в булевы поля
  if (item.json.body && item.json.body.specializations) {
    try {
      const specializationFields = convertSpecializationsToBooleans(item.json.body.specializations, CONFIG);
      // Добавляем поля к body
      Object.assign(item.json.body, specializationFields);
    } catch (error) {
      console.error(`Error processing specializations:`, error.message);
      // В случае ошибки устанавливаем все специализации в false
      Object.values(CONFIG.specializationFields).forEach(field => {
        item.json.body[field] = false;
      });
    }
  }

  // Рабочие дни уже приходят в булевом формате из вебхука, дополнительная обработка не нужна
}

// Возвращаем обработанные данные (сохраняя всю структуру)
return $input.all();
