const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully");

        const db = mongoose.connection.db;

        // ── Cleanup 1: Drop stale unique indexes on the students collection ──
        // The old user.model.js had unique:true on `username` and `email` and
        // mistakenly used mongoose.model("student",...), leaving behind stale
        // unique indexes (username_1, email_1) in the students collection.
        // We drop ALL unique indexes here (except _id) so student records
        // can be added freely without false "duplicate" errors.
        try {
            const col = db.collection('students');
            const indexes = await col.indexes();
            for (const idx of indexes) {
                if (idx.name === '_id_') continue;
                if (idx.unique) {
                    await col.dropIndex(idx.name);
                    console.log(`Dropped stale unique index on students: ${idx.name}`);
                }
            }
        } catch (idxErr) {
            console.warn("Index cleanup skipped:", idxErr.message);
        }

        // ── Cleanup 2: Migrate auth-user records from students → users ────────
        // The old user.model.js used mongoose.model("student", ...) which caused
        // warden/auth accounts to be saved into the students collection.
        // We now MIGRATE any such docs (those with a `password` field) to the
        // `users` collection before removing them from `students`.
        try {
            const oldAuthDocs = await db.collection('students').find({
                password: { $exists: true },
            }).toArray();

            if (oldAuthDocs.length > 0) {
                for (const doc of oldAuthDocs) {
                    // Only insert if not already present in users (by username or email)
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
                        console.log(`Migrated auth account "${doc.username}" to users collection.`);
                    }
                }
                // Now safe to remove them from students
                await db.collection('students').deleteMany({ password: { $exists: true } });
                console.log(`Cleaned ${oldAuthDocs.length} old auth record(s) from students collection.`);
            }
        } catch (cleanErr) {
            console.warn("Auth-user migration skipped:", cleanErr.message);
        }

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

module.exports = connectDB;