import { TFunction } from "i18next";
import { Activity } from "../../interfaces/user";

export const updateLocalActivities = (
  activities: Activity[],
  updatedActivity: Activity
): Activity[] => {
  return activities.map((a) =>
    a._id === updatedActivity._id ? updatedActivity : a
  );
};

export const removeActivityFromLocal = (
  activities: Activity[],
  id: string
): Activity[] => {
  return activities.filter((a) => a._id !== id);
};

export const getUnseenCount = (activities: Activity[]): number => {
  return activities.filter((a) => !a.read).length;
};

import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

export const getTranslatableTimeString = (date: Date, t: TFunction) => {
  const now = new Date();
  const secondsAgo = differenceInSeconds(now, date);

  if (secondsAgo < 30) return t("just-now");
  if (secondsAgo < 60) return t("less-than-a-minute-ago");

  const minutesAgo = differenceInMinutes(now, date);
  if (minutesAgo === 1) return t("a-minute-ago");
  if (minutesAgo < 60) return `${minutesAgo} ${t("minutes-ago")}`;

  const hoursAgo = differenceInHours(now, date);
  if (hoursAgo === 1) return t("about-an-hour-ago");
  if (hoursAgo < 24) return `${hoursAgo} ${t("hours-ago")}`;

  const daysAgo = differenceInDays(now, date);
  if (daysAgo === 1) return t("yesterday");
  if (daysAgo < 7) return `${daysAgo} ${t("days-ago")}`;

  const weeksAgo = differenceInWeeks(now, date);
  if (weeksAgo === 1) return t("a-week-ago");
  if (weeksAgo < 4) return `${weeksAgo} ${t("weeks-ago")}`;

  const monthsAgo = differenceInMonths(now, date);
  if (monthsAgo === 1) return t("a-month-ago");
  if (monthsAgo < 12) return `${monthsAgo} ${t("months-ago")}`;

  const yearsAgo = differenceInYears(now, date);
  if (yearsAgo === 1) return t("a-year-ago");
  return `${yearsAgo} ${t("years-ago")}`;
};
