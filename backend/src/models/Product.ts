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
  "electronics",
  "healthANDbeauty",
  "luxury",
  "other",
  "menFashion",
  "furniture",
] as const;

interface SoldInfo {
  to: mongoose.Types.ObjectId; // Reference to User
  date: Date;
}
interface PurchaseRequest {
  buyer: mongoose.Types.ObjectId;
  date: Date;
  status: "pending" | "accepted" | "rejected";
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;  
  title: string;
  price: number;
  images: string[];
  category: (typeof CATEGORY_TYPES)[number];
  condition: (typeof CONDITION_TYPES)[number];
  description?: string;
  seller: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  sold: SoldInfo | null;
  purchaseRequest?: PurchaseRequest;
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
    description: { type: String },
    sold: {
      type: {
        to: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
        date: Date,
        _id: false,
      },
      default: null, // Ensure that 'sold' is set to null by default
    },
    purchaseRequest: {
      type: {
        buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
        },
      },
      default: null, // Ensure that 'sold' is set to null by default

      _id: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
