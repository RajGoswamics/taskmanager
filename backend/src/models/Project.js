import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 100,
    },
    key: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: 10,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
      },
    ],
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    startDate: Date,
    dueDate: Date,
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ team: 1 });

export default mongoose.model('Project', projectSchema);
