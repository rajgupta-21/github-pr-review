import mongoose from "mongoose";
const ConnectRepoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: "true",
  },

  repoId: {
    type: Number,
    required: true,
    unique: true,
  },
  owner: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  connected: {
    type: Boolean,
    default: false,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const ConnectedRepo = mongoose.model("ConnectedRepo", ConnectRepoSchema);
