import mongoose, { InferSchemaType, Model, Schema } from "mongoose";

const PrSchema = new Schema({
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConnectedRepo",
    required: true,
  },

  // GitHub PR identifiers
  githubPrId: {
    type: Number,
    required: true,
  },

  githubPrNumber: {
    type: Number,
    required: true,
  },

  // Basic PR info
  title: {
    type: String,
    required: true,
  },

  body: String,

  state: {
    type: String,
    enum: ["open", "closed"],
  },

  merged: Boolean,

  draft: Boolean,

  // Author info
  author: {
    login: String,
    id: Number,
    avatarUrl: String,
  },

  // Branch info
  sourceBranch: String,

  targetBranch: String,

  headSha: String,

  baseSha: String,

  // GitHub URLs
  githubUrl: String,

  diffUrl: String,

  patchUrl: String,

  // PR statistics
  commits: Number,

  additions: Number,

  deletions: Number,

  changedFiles: Number,

  // Review info
  aiReviewed: {
    type: Boolean,
    default: false,
  },

  aiReview: String,

  // Timestamps
  createdAtGithub: Date,

  updatedAtGithub: Date,

  closedAtGithub: Date,

  mergedAtGithub: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export type PrType = InferSchemaType<typeof PrSchema>;
export const PrModel: Model<PrType> =
  mongoose.models.Pr || mongoose.model("Pr", PrSchema);
