import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 5000,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    labels: [{ type: String, trim: true }],
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    estimatedHours: { type: Number, default: 0 },
    comments: [commentSchema],
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ dueDate: 1 });

taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'done' || this.status === 'cancelled') return false;
  return new Date(this.dueDate) < new Date();
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

export default mongoose.model('Task', taskSchema);
