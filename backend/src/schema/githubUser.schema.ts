import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    githubId: {
      type: String,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    avatarUrl: {
      type: String,
    },

    access_token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const GithubUser =
  mongoose.models.User || mongoose.model("GithubUser", UserSchema);
