const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Check if MONGO_URI exists
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        console.log('🔄 Connecting to MongoDB...');
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        
        console.log("✅ Connected to MongoDB successfully");

        const db = mongoose.connection.db;

        // ── Cleanup 1: Drop stale unique indexes on the students collection ──
        try {
            const col = db.collection('students');
            const indexes = await col.indexes();
            for (const idx of indexes) {
                if (idx.name === '_id_') continue;
                if (idx.unique) {
                    await col.dropIndex(idx.name);
                    console.log(`🗑️  Dropped stale unique index on students: ${idx.name}`);
                }
            }
        } catch (idxErr) {
            console.warn("⚠️  Index cleanup skipped:", idxErr.message);
        }

        // ── Cleanup 2: Migrate auth-user records from students → users ────────
        try {
            const oldAuthDocs = await db.collection('students').find({
                password: { $exists: true },
            }).toArray();

            if (oldAuthDocs.length > 0) {
                for (const doc of oldAuthDocs) {
                    const alreadyExists = await db.collection('users').findOne({
                        $or: [{ username: doc.username }, { email: doc.email }],
                    });
                    if (!alreadyExists) {
                        await db.collection('users').insertOne({
                            username: doc.username,
                            email: doc.email,
                            password: doc.password,
                            role: doc.role || 'student',
                            createdAt: doc.createdAt || new Date(),
                            updatedAt: new Date(),
                        });
                        console.log(`📦 Migrated auth account "${doc.username}" to users collection.`);
                    }
                }
                await db.collection('students').deleteMany({ password: { $exists: true } });
                console.log(`🧹 Cleaned ${oldAuthDocs.length} old auth record(s) from students collection.`);
            }
        } catch (cleanErr) {
            console.warn("⚠️  Auth-user migration skipped:", cleanErr.message);
        }

    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        throw error; // Re-throw to be caught by server.js
    }
};

module.exports = connectDB;