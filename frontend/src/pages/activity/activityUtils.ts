import { TFunction } from "i18next";
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
} from "date-fns";

export const getTranslatableTimeString = (date: Date, t: TFunction): string => {
  const now = new Date();
  const secondsAgo = differenceInSeconds(now, date);

  if (secondsAgo < 60) return t("just-now");

  const minutesAgo = differenceInMinutes(now, date);
  if (minutesAgo < 60)
    return t("time-format", {
      value: minutesAgo,
      unit: t("minute-short"),
      ago: t("ago"),
    });

  const hoursAgo = differenceInHours(now, date);
  if (hoursAgo < 24)
    return t("time-format", {
      value: hoursAgo,
      unit: t("hour-short"),
      ago: t("ago"),
    });

  const daysAgo = differenceInDays(now, date);
  if (daysAgo < 7)
    return t("time-format", {
      value: daysAgo,
      unit: t("day-short"),
      ago: t("ago"),
    });

  const weeksAgo = differenceInWeeks(now, date);
  return t("time-format", {
    value: weeksAgo,
    unit: t("week-short"),
    ago: t("ago"),
  });
};
