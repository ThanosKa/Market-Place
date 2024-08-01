import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string; // Make content optional
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
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: false }, // Make content not required
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
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
