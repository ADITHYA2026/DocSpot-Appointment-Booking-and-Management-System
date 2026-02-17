const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MongoDB Atlas connection options - REMOVED deprecated options
        const options = {
            autoIndex: true, // Build indexes
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

        // Create indexes for better performance
        await createIndexes();
        
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB Atlas: ${error.message}`);
        
        // Specific error messages for common Atlas issues
        if (error.message.includes('ENOTFOUND')) {
            console.error('\n🔧 DNS Lookup Failed. Check:');
            console.error('1. Your internet connection');
            console.error('2. If cluster hostname is correct');
            console.error('3. If cluster is accessible from your network');
        } else if (error.message.includes('Authentication failed')) {
            console.error('\n🔧 Authentication Failed. Check:');
            console.error('1. Username and password in connection string');
            console.error('2. Database user permissions in Atlas');
            console.error('3. If user is created in correct project');
        } else if (error.message.includes('timed out')) {
            console.error('\n🔧 Connection Timeout. Check:');
            console.error('1. Network Access IP whitelist in Atlas');
            console.error('2. Firewall settings');
            console.error('3. VPN or proxy settings');
        }
        
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        const db = mongoose.connection;
        
        // Check if collections exist before creating indexes
        const collections = await db.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Users collection indexes
        if (collectionNames.includes('users')) {
            await db.collection('users').createIndex({ email: 1 }, { unique: true });
            await db.collection('users').createIndex({ type: 1 });
            console.log('✅ Users indexes created');
        }
        
        // Doctors collection indexes
        if (collectionNames.includes('doctors')) {
            await db.collection('doctors').createIndex({ specialization: 1 });
            await db.collection('doctors').createIndex({ status: 1 });
            await db.collection('doctors').createIndex({ 'address.city': 1 });
            await db.collection('doctors').createIndex({ fees: 1 });
            await db.collection('doctors').createIndex({ experience: -1 });
            console.log('✅ Doctors indexes created');
        }
        
        // Appointments collection indexes
        if (collectionNames.includes('appointments')) {
            await db.collection('appointments').createIndex({ doctorId: 1, date: 1 });
            await db.collection('appointments').createIndex({ userId: 1, date: -1 });
            await db.collection('appointments').createIndex({ status: 1 });
            console.log('✅ Appointments indexes created');
        }
        
    } catch (error) {
        console.log('⚠️ Index creation warning:', error.message);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectDB;