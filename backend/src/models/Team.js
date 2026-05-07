import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });

export default mongoose.model('Team', teamSchema);
