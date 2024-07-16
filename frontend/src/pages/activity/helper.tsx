// ActivityHelper.tsx

import { Activity, User } from "../../interfaces/user";
import { t } from "i18next";
import {
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  differenceInHours,
} from "date-fns";

export interface GroupedActivities {
  today: Activity[];
  yesterday: Activity[];
  lastWeek: Activity[];
  lastMonth: Activity[];
  older: Activity[];
}

export const groupActivities = (activities: Activity[]): GroupedActivities => {
  const now = new Date();
  const grouped: GroupedActivities = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  activities.forEach((activity) => {
    const activityDate = new Date(activity.createdAt);
    const hoursDiff = differenceInHours(now, activityDate);

    if (isToday(activityDate)) {
      grouped.today.push(activity);
    } else if (
      isYesterday(activityDate) ||
      (hoursDiff >= 24 && hoursDiff < 48)
    ) {
      grouped.yesterday.push(activity);
    } else if (isThisWeek(activityDate)) {
      grouped.lastWeek.push(activity);
    } else if (isThisMonth(activityDate)) {
      grouped.lastMonth.push(activity);
    } else {
      grouped.older.push(activity);
    }
  });

  return grouped;
};

export const getActivityMessage = (type: string): string => {
  switch (type) {
    case "product_like":
      return t("liked your product");
    case "profile_like":
      return t("liked your profile");
    case "message":
      return t("sent you a message");
    default:
      return "";
  }
};

export const getSections = (groupedActivities: GroupedActivities) => [
  { title: t("Today"), data: groupedActivities.today },
  { title: t("Yesterday"), data: groupedActivities.yesterday },
  { title: t("Last 7 Days"), data: groupedActivities.lastWeek },
  { title: t("This Month"), data: groupedActivities.lastMonth },
  { title: t("Older"), data: groupedActivities.older },
];
