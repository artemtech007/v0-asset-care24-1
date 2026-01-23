// Код для ноды Code в n8n
// На вход: [{"id": "2"}]
// На выход: [{"result": "00002"}]

const items = $input.all();

const outputItems = items.map(item => {
  const id = item.json.id;

  // Проверяем, является ли значение числом
  if (isNaN(id)) {
    return {
      json: {
        result: "ERROR"
      }
    };
  }

  // Преобразуем в число
  const numId = parseInt(id, 10);

  // Проверяем, что число не больше 99999
  if (numId > 99999) {
    return {
      json: {
        result: "ERROR"
      }
    };
  }

  // Форматируем с ведущими нулями до 5 символов
  const formattedId = numId.toString().padStart(5, '0');

  return {
    json: {
      result: formattedId
    }
  };
});

return outputItems;
