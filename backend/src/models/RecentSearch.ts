import mongoose, { Document, Schema } from "mongoose";

export interface IRecentSearch extends Document {
  user: mongoose.Types.ObjectId;
  query: string;
  product: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RecentSearchSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  query: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IRecentSearch>(
  "RecentSearch",
  RecentSearchSchema
);
