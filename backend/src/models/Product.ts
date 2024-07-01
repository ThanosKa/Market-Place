// models/Product.ts
import mongoose, { Document, Schema } from "mongoose";

export const CONDITION_TYPES = [
  "brandNew",
  "newOpenBox",
  "refurbished",
  "used",
  "partsOnly",
  "openBox",
] as const;

export const CATEGORY_TYPES = [
  "womenFashion",
  "travel",
  "mobile",
  "healthANDbeauty",
  "luxury",
  "homeServices",
  "menFashion",
  "furniture",
] as const;

export interface IProduct extends Document {
  title: string;
  price: number;
  images: string[];
  category: (typeof CATEGORY_TYPES)[number];
  condition: (typeof CONDITION_TYPES)[number];
  seller: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: String, required: true, enum: CATEGORY_TYPES },
    condition: { type: String, required: true, enum: CONDITION_TYPES },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);