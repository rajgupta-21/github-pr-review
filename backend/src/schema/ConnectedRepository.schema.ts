import mongoose from "mongoose";

const ConnectRepoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    repoId: {
      type: Number,
      required: true,
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
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

ConnectRepoSchema.index(
  {
    userId: 1,
    repoId: 1,
  },
  {
    unique: true,
  },
);

export const ConnectedRepo = mongoose.model("ConnectedRepo", ConnectRepoSchema);
