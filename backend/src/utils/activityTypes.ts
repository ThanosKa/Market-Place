export const ACTIVITY_TYPES = [
  "product_like",
  "profile_like",
  "review",
  "review_prompt",
  "product_purchased",
  "purchase_request",
  "purchase_request_accepted",
  "purchase_request_declined",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
