import mongoose, { Schema, Document } from "mongoose";

export const ActivityTypes = {
  PRODUCT_LIKE: "product_like",
  PROFILE_LIKE: "profile_like",
  REVIEW: "review",
  REVIEW_PROMPT: "review_prompt",
  PRODUCT_PURCHASED: "product_purchased",
  PURCHASE_REQUEST: "purchase_request",
  PURCHASE_REQUEST_ACCEPTED: "purchase_request_accepted",
  PURCHASE_REQUEST_CANCELLED: "purchase_request_cancelled",
} as const;

export type ActivityType = (typeof ActivityTypes)[keyof typeof ActivityTypes];

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: ActivityType;
  sender: mongoose.Types.ObjectId;
  content: string;
  product?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  lastSentAt: Date;
  reviewDone?: boolean;
}

const ActivitySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    required: true,
    enum: Object.values(ActivityTypes),
  },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastSentAt: { type: Date, default: Date.now },
  reviewDone: { type: Boolean, default: false },
});

ActivitySchema.index({
  user: 1,
  type: 1,
  sender: 1,
  product: 1,
  lastSentAt: 1,
});

export default mongoose.model<IActivity>("Activity", ActivitySchema);

export interface ActivityStrings {
  [ActivityTypes.PRODUCT_LIKE]: string;
  [ActivityTypes.PROFILE_LIKE]: string;
  [ActivityTypes.REVIEW]: string;
  [ActivityTypes.REVIEW_PROMPT]: string;
  [ActivityTypes.PRODUCT_PURCHASED]: string;
  [ActivityTypes.PURCHASE_REQUEST]: string;
  [ActivityTypes.PURCHASE_REQUEST_ACCEPTED]: string;
}
