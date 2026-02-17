const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const showDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const doctors = await db.collection('doctors').find({ status: 'approved' }).toArray();
        
        console.log('\n📋 APPROVED DOCTORS IN DATABASE:');
        console.log('='.repeat(60));
        
        doctors.forEach((doc, index) => {
            console.log(`\n${index + 1}. ID: ${doc._id.toString()}`);
            console.log(`   Name: ${doc.fullName}`);
            console.log(`   Specialization: ${doc.specialization}`);
            console.log(`   ID Length: ${doc._id.toString().length} characters`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`Total: ${doctors.length} doctors`);
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

showDoctors();