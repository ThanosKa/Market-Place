import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  username: string;
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
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    firstName: { 
      type: String, 
      required: true,
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true 
    },
    profilePicture: { 
      type: String, 
      default: null 
    },
    bio: { 
      type: String 
    },
    likedProducts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product" 
    }],
    likedUsers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    products: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product" 
    }],
    averageRating: { 
      type: Number, 
      default: 0 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    balance: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export default mongoose.model<IUser>("User", UserSchema);
