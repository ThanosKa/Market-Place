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
