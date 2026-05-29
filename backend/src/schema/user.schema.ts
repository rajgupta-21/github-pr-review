import mongoose, { InferSchemaType, Model } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    githubConnected: {
      type: Boolean,
      default: false,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    githubUsername: {
      type: String,
    },

    githubAvatarUrl: {
      type: String,
    },

    githubAccessToken: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
export type UserType = InferSchemaType<typeof UserSchema>;
export const UserModel: Model<UserType> =
  mongoose.models.User || mongoose.model("User", UserSchema);
