import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  type: "product_like" | "profile_like" | "review" | "review_prompt";
  sender: mongoose.Types.ObjectId;
  content: string;
  product?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  lastSentAt: Date; // New field to track when the activity was last sent
}

const ActivitySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    required: true,
    enum: ["product_like", "profile_like", "review", "review_prompt"],
  },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastSentAt: { type: Date, default: Date.now }, // New field
});

// Updated index to include lastSentAt
ActivitySchema.index({
  user: 1,
  type: 1,
  sender: 1,
  product: 1,
  lastSentAt: 1,
});

export default mongoose.model<IActivity>("Activity", ActivitySchema);
