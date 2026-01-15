const fs = require('fs/promises');
const path = require('path');
const User = require('../models/User');
const Content = require('../models/Content');
const Progress = require('../models/Progress');
const ReviewItem = require('../models/ReviewItem');
const Share = require('../models/Share');
const Notification = require('../models/Notification');
const AiSettings = require('../models/AiSettings');
const GamificationSettings = require('../models/GamificationSettings');
const AdminLog = require('../models/AdminLog');
const BackupRecord = require('../models/BackupRecord');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

const ensureBackupDir = async () => {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
};

const logAdminAction = async (adminId, action, details = {}) => {
    await AdminLog.create({
        admin: adminId,
        action,
        details
    });
};

const normalizeRestrictedTopics = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
        return input.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof input === 'string') {
        return input.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

// Users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await logAdminAction(req.user.id, 'update_user_status', { userId: user._id, status });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    if (!['student', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ success: false, message: 'Cannot remove the last admin' });
            }
        }

        user.role = role;
        await user.save();

        await logAdminAction(req.user.id, 'update_user_role', { userId: user._id, role });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await logAdminAction(req.user.id, 'delete_user', { userId: req.params.id });

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// AI Settings
exports.getAiSettings = async (req, res) => {
    try {
        let settings = await AiSettings.findOne();
        if (!settings) {
            settings = await AiSettings.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateAiSettings = async (req, res) => {
    const restrictedTopics = normalizeRestrictedTopics(req.body.restrictedTopics);
    const safetyMode = req.body.safetyMode || 'standard';

    if (!['standard', 'strict'].includes(safetyMode)) {
        return res.status(400).json({ success: false, message: 'Invalid safety mode' });
    }

    try {
        let settings = await AiSettings.findOne();
        if (!settings) {
            settings = new AiSettings();
        }
        settings.restrictedTopics = restrictedTopics;
        settings.safetyMode = safetyMode;
        settings.updatedBy = req.user.id;
        settings.updatedAt = new Date();
        await settings.save();

        await logAdminAction(req.user.id, 'update_ai_settings', { safetyMode, restrictedTopics });

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Gamification Settings
exports.getGamificationSettings = async (req, res) => {
    try {
        let settings = await GamificationSettings.findOne();
        if (!settings) {
            settings = await GamificationSettings.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateGamificationSettings = async (req, res) => {
    const { points, badges } = req.body;
    try {
        let settings = await GamificationSettings.findOne();
        if (!settings) {
            settings = new GamificationSettings();
        }
        const currentPoints = settings.points?.toObject ? settings.points.toObject() : (settings.points || {});
        const currentBadges = settings.badges?.toObject ? settings.badges.toObject() : (settings.badges || {});
        settings.points = { ...currentPoints, ...(points || {}) };
        settings.badges = { ...currentBadges, ...(badges || {}) };
        settings.updatedBy = req.user.id;
        settings.updatedAt = new Date();
        await settings.save();

        await logAdminAction(req.user.id, 'update_gamification_settings', { points, badges });

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Broadcast Notifications
exports.createBroadcast = async (req, res) => {
    const { message, expiresAt } = req.body;
    if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }
    try {
        const notification = await Notification.create({
            message,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            createdBy: req.user.id
        });

        await logAdminAction(req.user.id, 'create_broadcast', { message });

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getBroadcasts = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Reports
const toCsv = (rows, headers) => {
    const headerRow = headers.join(',');
    const dataRows = rows.map((row) => headers.map((key) => {
        const value = row[key] ?? '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
    }).join(','));
    return [headerRow, ...dataRows].join('\n');
};

exports.exportProgress = async (req, res) => {
    try {
        const records = await Progress.find().populate('user', 'email name');
        const rows = records.map((record) => ({
            userEmail: record.user?.email || '',
            userName: record.user?.name || '',
            activityType: record.activityType,
            pointsAwarded: record.pointsAwarded,
            createdAt: record.createdAt.toISOString()
        }));
        const csv = toCsv(rows, ['userEmail', 'userName', 'activityType', 'pointsAwarded', 'createdAt']);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="progress-report.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.exportLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find().populate('admin', 'email name').sort({ createdAt: -1 });
        const rows = logs.map((log) => ({
            adminEmail: log.admin?.email || '',
            adminName: log.admin?.name || '',
            action: log.action,
            createdAt: log.createdAt.toISOString()
        }));
        const csv = toCsv(rows, ['adminEmail', 'adminName', 'action', 'createdAt']);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="system-logs.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Backups
exports.listBackups = async (req, res) => {
    try {
        const backups = await BackupRecord.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: backups });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createBackup = async (req, res) => {
    try {
        await ensureBackupDir();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.json`;
        const filepath = path.join(BACKUP_DIR, filename);

        const backup = {
            users: await User.find().lean(),
            contents: await Content.find().lean(),
            progress: await Progress.find().lean(),
            reviewItems: await ReviewItem.find().lean(),
            shares: await Share.find().lean(),
            notifications: await Notification.find().lean(),
            aiSettings: await AiSettings.find().lean(),
            gamificationSettings: await GamificationSettings.find().lean(),
            adminLogs: await AdminLog.find().lean()
        };

        const json = JSON.stringify(backup, null, 2);
        await fs.writeFile(filepath, json, 'utf8');

        const stats = await fs.stat(filepath);
        const collections = Object.keys(backup);

        const record = await BackupRecord.create({
            filename,
            size: stats.size,
            collections,
            createdBy: req.user.id
        });

        await logAdminAction(req.user.id, 'create_backup', { filename });

        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.restoreBackup = async (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).json({ success: false, message: 'filename is required' });
    }

    try {
        const filepath = path.join(BACKUP_DIR, filename);
        const raw = await fs.readFile(filepath, 'utf8');
        const data = JSON.parse(raw);

        await User.deleteMany({});
        await Content.deleteMany({});
        await Progress.deleteMany({});
        await ReviewItem.deleteMany({});
        await Share.deleteMany({});
        await Notification.deleteMany({});
        await AiSettings.deleteMany({});
        await GamificationSettings.deleteMany({});
        await AdminLog.deleteMany({});

        if (data.users?.length) await User.insertMany(data.users, { ordered: false });
        if (data.contents?.length) await Content.insertMany(data.contents, { ordered: false });
        if (data.progress?.length) await Progress.insertMany(data.progress, { ordered: false });
        if (data.reviewItems?.length) await ReviewItem.insertMany(data.reviewItems, { ordered: false });
        if (data.shares?.length) await Share.insertMany(data.shares, { ordered: false });
        if (data.notifications?.length) await Notification.insertMany(data.notifications, { ordered: false });
        if (data.aiSettings?.length) await AiSettings.insertMany(data.aiSettings, { ordered: false });
        if (data.gamificationSettings?.length) await GamificationSettings.insertMany(data.gamificationSettings, { ordered: false });
        if (data.adminLogs?.length) await AdminLog.insertMany(data.adminLogs, { ordered: false });

        await logAdminAction(req.user.id, 'restore_backup', { filename });

        res.status(200).json({ success: true, message: 'Backup restored' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
