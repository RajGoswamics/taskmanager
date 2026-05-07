import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : role === 'admin' ? 'admin' : 'member';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const valid = await user.matchPassword(currentPassword);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
