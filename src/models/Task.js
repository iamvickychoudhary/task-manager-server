import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
