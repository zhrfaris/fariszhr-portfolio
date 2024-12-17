interface FormatDateOptions {
  hourAndMinutes?: boolean;
  weekday?: boolean;
  lang?: string;
}

export const formatDate = (
  date: Date,
  options: FormatDateOptions = {
    hourAndMinutes: true,
    weekday: false,
    lang: "en",
  }
) => {
  const { hourAndMinutes, weekday, lang } = options;

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  if (hourAndMinutes) {
    dateOptions.hour = "2-digit";
    dateOptions.minute = "2-digit";
  }

  if (weekday) {
    dateOptions.weekday = "long";
  }

  const locale = lang === "id" ? "id-ID" : "en-UK";

  return date.toLocaleDateString(locale, dateOptions);
};
