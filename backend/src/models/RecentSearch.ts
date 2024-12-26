// RecentSearch Model and Interface
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { IProduct } from "./Product";

export interface IRecentSearch extends Document {
  _id: mongoose.Types.ObjectId;  
  user: mongoose.Types.ObjectId;
  searchedUser?: mongoose.Types.ObjectId | IUser; // Add this line
  query: string;
  product?: mongoose.Types.ObjectId | IProduct; // Made optional
  createdAt: Date;
}

const RecentSearchSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  searchedUser: { type: Schema.Types.ObjectId, ref: "User" },
  query: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  createdAt: { type: Date, default: Date.now },
});

// Create a type for populated RecentSearch
export interface IPopulatedRecentSearch extends Omit<IRecentSearch, 'searchedUser' | 'product'> {
  searchedUser?: {
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string | null;
    averageRating: number;
    reviewCount: number;
  } | null;
  product?: {
    title: string;
    price: number;
    condition: string;
    images: string[];
  } | null;
}

export default mongoose.model<IRecentSearch>("RecentSearch", RecentSearchSchema);
