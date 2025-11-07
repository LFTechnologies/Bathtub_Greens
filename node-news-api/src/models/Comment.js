import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', index: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  status: { type: String, enum: ['visible','hidden','pending'], default: 'visible', index: true },
  flags: [{ by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, reason: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true })

export default mongoose.model('Comment', commentSchema)