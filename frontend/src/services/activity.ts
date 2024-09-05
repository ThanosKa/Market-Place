// src/services/activityService.ts

import { Activities } from "../interfaces/user";
import axiosInstance from "./axiosConfig";
export interface GetActivitiesResponse {
  success: number;
  message: string;
  data: {
    activities: Activities;
    unseenCount: number;
  };
}

export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/activities/${activityId}`);
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

export const markActivityAsRead = async (activityId: string): Promise<void> => {
  try {
    await axiosInstance.put(`/activities/${activityId}/read`);
  } catch (error) {
    console.error("Error marking activity as read:", error);
    throw error;
  }
};

export const markAllActivitiesAsRead = async (): Promise<void> => {
  try {
    await axiosInstance.put("/activities/mark-all-read");
  } catch (error) {
    console.error("Error marking all activities as read:", error);
    throw error;
  }
};

export const getActivities = async (): Promise<GetActivitiesResponse> => {
  try {
    const response = await axiosInstance.get<GetActivitiesResponse>(
      "/activities"
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

interface CreateReviewPromptActivityResponse {
  success: number;
  message: string;
  data: 0 | 1 | { activity: any }; // You might want to define a more specific type for the activity
}

export const createReviewPromptActivity = async (
  productId: string
): Promise<CreateReviewPromptActivityResponse> => {
  try {
    const response = await axiosInstance.post("/activities/review-prompt", {
      productId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating review prompt activity:", error);
    throw error;
  }
};
