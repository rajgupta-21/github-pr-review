import mongoose, { InferSchemaType, Model, Schema } from "mongoose";
const PrSchema = new Schema({
  repoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConnectedRepo",
  },

  githubPrNumber: Number,

  title: String,

  author: String,

  state: String,

  merged: Boolean,

  sourceBranch: String,

  targetBranch: String,

  headSha: String,

  baseSha: String,

  githubUrl: String,

  aiReviewed: {
    type: Boolean,
    default: false,
  },

  aiReview: String,

  createdAtGithub: Date,

  mergedAtGithub: Date,
});

export type PrType = InferSchemaType<typeof PrSchema>;
export const PrModel: Model<PrType> =
  mongoose.models.Pr || mongoose.model("Pr", PrSchema);
