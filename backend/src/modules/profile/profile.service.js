import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import * as repo from './profile.repository.js';
import { createNotification } from '../notifications/notifications.service.js';

// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && 
            process.env.CLOUDINARY_API_KEY && 
            process.env.CLOUDINARY_API_SECRET);
};

export const getProfile = async (userId) => {
  const profile = await repo.getProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  return profile;
};

export const updateProfile = async (userId, data) => {
  const updated = await repo.updateProfile(userId, data);
  
  // Create system notification
  await createNotification(userId, {
    title: 'Profile Updated',
    message: 'Your profile information has been updated successfully.',
    category: 'SYSTEM',
    priority: 'LOW'
  });

  // Log activity
  await repo.insertActivityLog(userId, 'PROFILE_UPDATED', userId, { fields: Object.keys(data) });

  return updated;
};

export const uploadAvatar = async (userId, file) => {
  if (!file) {
    throw new Error('No avatar file provided');
  }

  let imageUrl = '';

  if (isCloudinaryConfigured()) {
    try {
      // Upload to Cloudinary using buffer stream
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'assetflow_avatars', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
      imageUrl = await uploadPromise;
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local storage:', err);
    }
  }

  // Fallback to local storage if Cloudinary not configured or failed
  if (!imageUrl) {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const extension = path.extname(file.originalname) || '.png';
    const fileName = `avatar-${userId}-${Date.now()}${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  // Retrieve old profile image URL to delete later if needed
  const currentProfile = await repo.getProfile(userId);
  const oldImageUrl = currentProfile?.profile_image_url;

  // Update in DB
  const result = await repo.updateProfileImage(userId, imageUrl);

  // Attempt to delete old local files
  if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
    const oldPath = path.join(process.cwd(), 'public', oldImageUrl);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error('Failed to delete old avatar file:', err);
      }
    }
  }

  // Log activity & create notification
  await repo.insertActivityLog(userId, 'PROFILE_IMAGE_UPDATED', userId, { imageUrl });
  await createNotification(userId, {
    title: 'Avatar Updated',
    message: 'Your profile picture has been updated successfully.',
    category: 'SYSTEM',
    priority: 'LOW'
  });

  return result;
};

export const deleteAvatar = async (userId) => {
  const currentProfile = await repo.getProfile(userId);
  const oldImageUrl = currentProfile?.profile_image_url;

  if (!oldImageUrl) {
    throw new Error('No profile picture exists to delete');
  }

  await repo.removeProfileImage(userId);

  // Attempt to delete local file
  if (oldImageUrl.startsWith('/uploads/')) {
    const oldPath = path.join(process.cwd(), 'public', oldImageUrl);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error('Failed to delete avatar file:', err);
      }
    }
  }

  await repo.insertActivityLog(userId, 'PROFILE_IMAGE_DELETED', userId, {});
  await createNotification(userId, {
    title: 'Avatar Removed',
    message: 'Your profile picture has been removed.',
    category: 'SYSTEM',
    priority: 'LOW'
  });

  return { success: true };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const currentHash = await repo.getPasswordHash(userId);
  if (!currentHash) {
    throw new Error('User not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, currentHash);
  if (!isMatch) {
    const err = new Error('Invalid current password');
    err.status = 400;
    throw err;
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);
  await repo.changePassword(userId, newHash);

  // Invalidate all other sessions (security best practice)
  await repo.deleteAllSessions(userId);

  // Log activity & create notification
  await repo.insertActivityLog(userId, 'PASSWORD_CHANGED', userId, {});
  await createNotification(userId, {
    title: 'Password Changed',
    message: 'Your password was changed successfully. Other active sessions have been terminated.',
    category: 'SECURITY',
    priority: 'HIGH'
  });

  return { success: true };
};

export const getPreferences = async (userId) => {
  return repo.getPreferences(userId);
};

export const updatePreferences = async (userId, data) => {
  const updated = await repo.updatePreferences(userId, data);
  await repo.insertActivityLog(userId, 'PREFERENCES_UPDATED', userId, data);
  return updated;
};

export const getSessions = async (userId) => {
  return repo.getSessions(userId);
};

export const logoutSession = async (sessionId, userId) => {
  const deleted = await repo.deleteSession(sessionId, userId);
  if (!deleted) {
    throw new Error('Session not found or already terminated');
  }
  await repo.insertActivityLog(userId, 'SESSION_TERMINATED', sessionId, { device: deleted.device_name });
  return { success: true };
};

export const logoutAllSessions = async (userId, currentSessionId = null) => {
  await repo.deleteAllSessions(userId, currentSessionId);
  await repo.insertActivityLog(userId, 'ALL_SESSIONS_TERMINATED', userId, {});
  return { success: true };
};
