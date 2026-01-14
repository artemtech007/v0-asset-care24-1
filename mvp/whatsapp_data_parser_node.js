// n8n Function Node: Parse WA Data and R-Code
// Копирует входящий JSON, добавляет wa_id поля и парсит R-код

function processWAData(data) {
  // 1. Копия оригинального JSON (сохраняем всю структуру)
  const result = { ...data };

  // 2. Обработка поля "from" -> wa_id_plus и wa_id
  if (data.From && typeof data.From === 'string') {
    // Из "whatsapp:+79196811458" получаем "+79196811458" и "79196811458"
    const phoneMatch = data.From.match(/whatsapp:\+(\d+)/);
    if (phoneMatch) {
      result.wa_id_plus = '+' + phoneMatch[1];  // "+79196811458"
      result.wa_id = phoneMatch[1];              // "79196811458"
    }
  }

  // 3. Обработка поля "body" - поиск и разбор R-кода
  result.has_code = false;

  if (data.Body && typeof data.Body === 'string') {
    // Ищем код между ||- и -|| (ровно 14 символов между ними)
    const codeRegex = /\|\|-(.+?)-\|\|/g;
    const matches = data.Body.match(codeRegex);

    if (matches && matches.length > 0) {
      // Берем первый найденный код
      const fullCode = matches[0]; // "||-R-WB-C-P-0000S-||"

      // Проверяем что между ||- и -|| ровно 14 символов
      const content = fullCode.slice(3, -3); // "R-WB-C-P-0000S"
      if (content.length === 14) {
        result.has_code = true;

        // Разбираем код на части
        const parts = content.split('-');
        if (parts.length === 5) {
          result.code_prefix = parts[0];      // "R" (всегда R)
          result.code_source = parts[1];      // "WB" (сайт) или "QR" (QR-код)
          result.code_user_type = parts[2];  // "C" (клиент) или "M" (мастер)
          result.code_client_type = parts[3]; // "C" (контрактный), "P" (публичный) или "0" (для мастеров)
          result.code_value = parts[4];       // "0000S", "00001" и т.д.
        }
      }
    }
  }

  return result;
}

// Обработка всех входящих items (стандартный паттерн n8n)
const items = $input.all();
const results = items.map(item => ({
  json: processWAData(item.json)
}));

return results;

// Пример входа (SMS webhook):
// {
//   "SmsMessageSid": "SM6fdb2d3eb1f28b332a898ccc0d1b321e",
//   "From": "whatsapp:+79196811458",
//   "Body": "Hallo! Bitte senden Sie diese Nachricht mit dem Registrierungscode, ohne ihn zu bearbeiten!\n\n||-R-WB-C-P-0000S-||\n\nDanke!"
// }

// Пример выхода:
// {
//   "SmsMessageSid": "SM6fdb2d3eb1f28b332a898ccc0d1b321e",
//   "From": "whatsapp:+79196811458",
//   "Body": "Hallo! Bitte senden Sie diese Nachricht mit dem Registrierungscode, ohne ihn zu bearbeiten!\n\n||-R-WB-C-P-0000S-||\n\nDanke!",
//   "wa_id_plus": "+79196811458",
//   "wa_id": "79196811458",
//   "has_code": true,
//   "code_prefix": "R",
//   "code_source": "WB",
//   "code_user_type": "C",
//   "code_client_type": "P",
//   "code_value": "0000S"
// }
