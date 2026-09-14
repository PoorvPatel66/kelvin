import express from 'express';
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { uuidParam } from '../validators/adminOperationsValidators.js';

const router = express.Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', uuidParam, validateRequest, markNotificationRead);
router.delete('/:id', uuidParam, validateRequest, deleteNotification);
export default router;
