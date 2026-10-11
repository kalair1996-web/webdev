import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  jdText: { type: String, required: true },
  score: { type: Number, required: true },
  present: { type: [String], default: [] },
  missing: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const Analysis = mongoose.model('Analysis', analysisSchema);

export function connectDB(uri) {
  return mongoose.connect(uri);
}
