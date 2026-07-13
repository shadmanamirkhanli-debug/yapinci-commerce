const COLOR_TRANSLATIONS: Record<string, { en: string; ru: string }> = {
  "qara": { en: "Black", ru: "Чёрный" },
  "ağ": { en: "White", ru: "Белый" },
  "mavi": { en: "Blue", ru: "Синий" },
  "tünd mavi": { en: "Dark Blue", ru: "Тёмно-синий" },
  "açıq mavi": { en: "Light Blue", ru: "Голубой" },
  "göy-boz": { en: "Blue-gray", ru: "Сине-серый" },
  "bordó": { en: "Maroon", ru: "Бордовый" },
  "yaşıl": { en: "Green", ru: "Зелёный" },
  "tünd yaşıl": { en: "Dark Green", ru: "Тёмно-зелёный" },
  "boz": { en: "Gray", ru: "Серый" },
  "qırmızı": { en: "Red", ru: "Красный" },
  "sarı": { en: "Yellow", ru: "Жёлтый" },
  "narıncı": { en: "Orange", ru: "Оранжевый" },
  "bənövşəyi": { en: "Purple", ru: "Фиолетовый" },
  "çəhrayı": { en: "Pink", ru: "Розовый" },
  "qəhvəyi": { en: "Brown", ru: "Коричневый" },
  "bej": { en: "Beige", ru: "Бежевый" },
  "gümüşü": { en: "Silver", ru: "Серебристый" },
  "qızılı": { en: "Gold", ru: "Золотистый" },
  "krem": { en: "Cream", ru: "Кремовый" },
};

export function translateColor(color: string, locale: "az" | "en" | "ru"): string {
  if (locale === "az" || !color) return color;
  const entry = COLOR_TRANSLATIONS[color.trim().toLowerCase()];
  if (!entry) return color;
  return locale === "en" ? entry.en : entry.ru;
}
