import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  images: string[];
  timestamp: Date;
  seen: boolean;
  edited?: boolean;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  deletedFor: {
    user: mongoose.Types.ObjectId;
    deletedAt: Date;
    messagesDeletedAt?: Date; // New field
  }[];
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: false },
    images: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
  },
  { _id: true }
);

const ChatSchema: Schema = new Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [MessageSchema],
    deletedFor: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: Date.now },
        messagesDeletedAt: { type: Date }, // New field
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
