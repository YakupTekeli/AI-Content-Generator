const express = require('express');
const {
    getUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getAiSettings,
    updateAiSettings,
    getGamificationSettings,
    updateGamificationSettings,
    createBroadcast,
    getBroadcasts,
    cancelBroadcast,
    exportProgress,
    exportLogs,
    listBackups,
    createBackup,
    restoreBackup,
    deleteBackup
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/ai-settings', getAiSettings);
router.put('/ai-settings', updateAiSettings);

router.get('/gamification-settings', getGamificationSettings);
router.put('/gamification-settings', updateGamificationSettings);

router.post('/broadcasts', createBroadcast);
router.get('/broadcasts', getBroadcasts);
router.patch('/broadcasts/:id/cancel', cancelBroadcast);

router.get('/reports/progress', exportProgress);
router.get('/reports/logs', exportLogs);

router.get('/backups', listBackups);
router.post('/backups', createBackup);
router.post('/backups/restore', restoreBackup);
router.delete('/backups/:id', deleteBackup);

module.exports = router;
