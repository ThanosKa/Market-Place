import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  bio?: string;
  likedProducts: mongoose.Types.ObjectId[];
  likedUsers: mongoose.Types.ObjectId[];
  products: mongoose.Types.ObjectId[];
  averageRating: number;
  reviewCount: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePicture: { type: String, default: null },
    bio: { type: String },
    likedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    likedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
