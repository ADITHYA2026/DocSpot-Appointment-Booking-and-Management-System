const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🌱 Starting database seeding...');
console.log('📦 Connecting to MongoDB...');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = mongoose.connection.db;

    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    const usersDeleted = await db.collection('users').deleteMany({});
    const doctorsDeleted = await db.collection('doctors').deleteMany({});
    const appointmentsDeleted = await db.collection('appointments').deleteMany({});
    console.log(`   - Deleted ${usersDeleted.deletedCount} users`);
    console.log(`   - Deleted ${doctorsDeleted.deletedCount} doctors`);
    console.log(`   - Deleted ${appointmentsDeleted.deletedCount} appointments`);

    // Generate password hashes
    console.log('\n🔑 Generating password hashes...');
    const salt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    console.log('   ✅ Passwords hashed successfully');

    // ===========================================
    // STEP 1: CREATE USERS
    // ===========================================
    console.log('\n📝 Step 1: Creating users...');

    const users = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        password: userPassword,
        phone: "+1 (555) 123-4567",
        isDoctor: false,
        type: "user",
        notification: [],
        createdAt: new Date("2024-01-15"),
        __v: 0
      },
      {
        name: "Emma Watson",
        email: "emma.watson@example.com",
        password: userPassword,
        phone: "+1 (555) 234-5678",
        isDoctor: false,
        type: "user",
        notification: [],
        createdAt: new Date("2024-02-01"),
        __v: 0
      },
      {
        name: "Robert Johnson",
        email: "robert.johnson@example.com",
        password: userPassword,
        phone: "+1 (555) 345-6789",
        isDoctor: false,
        type: "user",
        notification: [],
        createdAt: new Date("2023-11-20"),
        __v: 0
      },
      {
        name: "Sophia Martinez",
        email: "sophia.martinez@example.com",
        password: userPassword,
        phone: "+1 (555) 456-7890",
        isDoctor: false,
        type: "user",
        notification: [],
        createdAt: new Date("2024-03-01"),
        __v: 0
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@doctor.com",
        password: userPassword,
        phone: "+1 (555) 567-8901",
        isDoctor: true,
        type: "doctor",
        notification: [],
        createdAt: new Date("2023-10-10"),
        __v: 0
      },
      {
        name: "Dr. Michael Chen",
        email: "michael.chen@doctor.com",
        password: userPassword,
        phone: "+1 (555) 678-9012",
        isDoctor: true,
        type: "doctor",
        notification: [],
        createdAt: new Date("2023-11-05"),
        __v: 0
      },
      {
        name: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@doctor.com",
        password: userPassword,
        phone: "+1 (555) 789-0123",
        isDoctor: true,
        type: "doctor",
        notification: [],
        createdAt: new Date("2023-12-12"),
        __v: 0
      },
      {
        name: "Admin User",
        email: "admin@docspot.com",
        password: adminPassword,
        phone: "+1 (555) 000-0000",
        isDoctor: false,
        type: "admin",
        notification: [],
        createdAt: new Date("2023-01-01"),
        __v: 0
      }
    ];

    const insertedUsers = await db.collection('users').insertMany(users);
    console.log(`   ✅ Created ${insertedUsers.insertedCount} users:`);
    console.log(`      - 4 Regular Patients`);
    console.log(`      - 3 Doctors`);
    console.log(`      - 1 Admin`);

    // FIX 3: insertMany returns insertedIds keyed by array index.
    // Map them back onto each user object so getUserId() works correctly.
    // Previously users[n]._id was always undefined, causing NULL foreign keys
    // in doctors and appointments collections.
    Object.entries(insertedUsers.insertedIds).forEach(([index, id]) => {
      users[parseInt(index)]._id = id;
    });

    // Helper function to get user IDs by email (now works correctly)
    const getUserId = (email) => {
      const user = users.find(u => u.email === email);
      return user ? user._id : null;
    };

    // ===========================================
    // STEP 2: CREATE DOCTOR PROFILES
    // ===========================================
    console.log('\n👨‍⚕️ Step 2: Creating doctor profiles...');

    const doctors = [
      {
        userId: getUserId("sarah.johnson@doctor.com"),
        fullName: "Dr. Sarah Johnson",
        email: "sarah.johnson@doctor.com",
        phone: "+1 (555) 567-8901",
        specialization: "Cardiologist",
        experience: 15,
        fees: 150,
        address: {
          street: "123 Heart Center",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          fullAddress: "123 Heart Center, New York, NY 10001"
        },
        bio: "Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating complex cardiovascular conditions. She specializes in preventive cardiology and heart disease management. She has been recognized as one of the top cardiologists in New York for 5 consecutive years.",
        qualifications: [
          { degree: "MD - Cardiology", institution: "Harvard Medical School", year: 2008 },
          { degree: "MBBS", institution: "Johns Hopkins University", year: 2004 },
          { degree: "Fellowship in Interventional Cardiology", institution: "Mayo Clinic", year: 2010 }
        ],
        timings: {
          monday: { start: "09:00", end: "17:00", available: true },
          tuesday: { start: "09:00", end: "17:00", available: true },
          wednesday: { start: "09:00", end: "17:00", available: true },
          thursday: { start: "09:00", end: "17:00", available: true },
          friday: { start: "09:00", end: "17:00", available: true },
          saturday: { start: "10:00", end: "14:00", available: true },
          sunday: { start: null, end: null, available: false }
        },
        status: "approved",
        rating: 4.8,
        totalReviews: 127,
        profileImage: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=200&background=0D6EFD&color=fff&bold=true&length=2",
        createdAt: new Date("2023-10-10"),
        __v: 0
      },
      {
        userId: getUserId("michael.chen@doctor.com"),
        fullName: "Dr. Michael Chen",
        email: "michael.chen@doctor.com",
        phone: "+1 (555) 678-9012",
        specialization: "Dermatologist",
        experience: 12,
        fees: 120,
        address: {
          street: "456 Skin Care Blvd",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          fullAddress: "456 Skin Care Blvd, Los Angeles, CA 90001"
        },
        bio: "Dr. Michael Chen is a renowned dermatologist specializing in medical and cosmetic dermatology. He has helped thousands of patients achieve healthy, beautiful skin. His expertise includes acne treatment, skin cancer screening, and cosmetic procedures.",
        qualifications: [
          { degree: "MD - Dermatology", institution: "Stanford University", year: 2011 },
          { degree: "MBBS", institution: "UCLA", year: 2007 },
          { degree: "Fellowship in Cosmetic Dermatology", institution: "NYU Langone", year: 2013 }
        ],
        timings: {
          monday: { start: "10:00", end: "18:00", available: true },
          tuesday: { start: "10:00", end: "18:00", available: true },
          wednesday: { start: "10:00", end: "18:00", available: true },
          thursday: { start: "10:00", end: "18:00", available: true },
          friday: { start: "10:00", end: "16:00", available: true },
          saturday: { start: null, end: null, available: false },
          sunday: { start: null, end: null, available: false }
        },
        status: "approved",
        rating: 4.9,
        totalReviews: 98,
        profileImage: "https://ui-avatars.com/api/?name=Michael+Chen&size=200&background=0D6EFD&color=fff&bold=true&length=2",
        createdAt: new Date("2023-11-05"),
        __v: 0
      },
      {
        userId: getUserId("emily.rodriguez@doctor.com"),
        fullName: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@doctor.com",
        phone: "+1 (555) 789-0123",
        specialization: "Pediatrician",
        experience: 10,
        fees: 130,
        address: {
          street: "789 Children's Way",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          fullAddress: "789 Children's Way, Chicago, IL 60601"
        },
        bio: "Dr. Emily Rodriguez is a compassionate pediatrician dedicated to providing comprehensive care for children from infancy through adolescence. She creates a warm, friendly environment that puts both children and parents at ease.",
        qualifications: [
          { degree: "MD - Pediatrics", institution: "Northwestern University", year: 2013 },
          { degree: "MBBS", institution: "University of Chicago", year: 2009 },
          { degree: "Fellowship in Pediatric Development", institution: "Lurie Children's Hospital", year: 2015 }
        ],
        timings: {
          monday: { start: "08:00", end: "16:00", available: true },
          tuesday: { start: "08:00", end: "16:00", available: true },
          wednesday: { start: "08:00", end: "16:00", available: true },
          thursday: { start: "08:00", end: "16:00", available: true },
          friday: { start: "08:00", end: "14:00", available: true },
          saturday: { start: null, end: null, available: false },
          sunday: { start: null, end: null, available: false }
        },
        status: "approved",
        rating: 4.7,
        totalReviews: 156,
        profileImage: "https://ui-avatars.com/api/?name=Emily+Rodriguez&size=200&background=0D6EFD&color=fff&bold=true&length=2",
        createdAt: new Date("2023-12-12"),
        __v: 0
      }
    ];

    const insertedDoctors = await db.collection('doctors').insertMany(doctors);
    console.log(`   ✅ Created ${insertedDoctors.insertedCount} doctor profiles:`);

    // FIX 3 (continued): Same fix applied to doctors array
    Object.entries(insertedDoctors.insertedIds).forEach(([index, id]) => {
      doctors[parseInt(index)]._id = id;
    });

    doctors.forEach((doc) => {
      console.log(`      - ${doc.fullName} (${doc.specialization}) → userId: ${doc.userId}`);
    });

    // Helper function to get doctor IDs by name (now works correctly)
    const getDoctorId = (name) => {
      const doctor = doctors.find(d => d.fullName === name);
      return doctor ? doctor._id : null;
    };

    // ===========================================
    // STEP 3: CREATE APPOINTMENTS
    // ===========================================
    console.log('\n📅 Step 3: Creating appointments...');

    const appointments = [
      {
        doctorId: getDoctorId("Dr. Sarah Johnson"),
        userId: getUserId("john.smith@example.com"),
        doctorInfo: {
          name: "Dr. Sarah Johnson",
          specialization: "Cardiologist",
          fees: 150
        },
        userInfo: {
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "+1 (555) 123-4567"
        },
        date: new Date("2024-03-20T10:30:00Z"),
        timeSlot: { start: "10:30", end: "11:00" },
        status: "approved",
        paymentStatus: "paid",
        reason: "Annual heart checkup and medication review",
        notes: "Patient has history of hypertension. Please bring latest blood reports and current medications.",
        documents: [],
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
        __v: 0
      },
      {
        doctorId: getDoctorId("Dr. Michael Chen"),
        userId: getUserId("emma.watson@example.com"),
        doctorInfo: {
          name: "Dr. Michael Chen",
          specialization: "Dermatologist",
          fees: 120
        },
        userInfo: {
          name: "Emma Watson",
          email: "emma.watson@example.com",
          phone: "+1 (555) 234-5678"
        },
        date: new Date("2024-03-21T14:00:00Z"),
        timeSlot: { start: "14:00", end: "14:30" },
        status: "pending",
        paymentStatus: "pending",
        reason: "Skin rash consultation on arms and face",
        notes: "New patient. Rash appeared 2 weeks ago, getting worse.",
        documents: [],
        createdAt: new Date("2024-03-16"),
        updatedAt: new Date("2024-03-16"),
        __v: 0
      },
      {
        doctorId: getDoctorId("Dr. Emily Rodriguez"),
        userId: getUserId("sophia.martinez@example.com"),
        doctorInfo: {
          name: "Dr. Emily Rodriguez",
          specialization: "Pediatrician",
          fees: 130
        },
        userInfo: {
          name: "Sophia Martinez",
          email: "sophia.martinez@example.com",
          phone: "+1 (555) 456-7890"
        },
        date: new Date("2024-03-19T09:30:00Z"),
        timeSlot: { start: "09:30", end: "10:00" },
        status: "completed",
        paymentStatus: "paid",
        reason: "Child's annual wellness check (age 5)",
        notes: "Bring vaccination records. Child is due for booster shots.",
        documents: [],
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-19"),
        __v: 0
      },
      {
        doctorId: getDoctorId("Dr. Sarah Johnson"),
        userId: getUserId("robert.johnson@example.com"),
        doctorInfo: {
          name: "Dr. Sarah Johnson",
          specialization: "Cardiologist",
          fees: 150
        },
        userInfo: {
          name: "Robert Johnson",
          email: "robert.johnson@example.com",
          phone: "+1 (555) 345-6789"
        },
        date: new Date("2024-03-25T16:00:00Z"),
        timeSlot: { start: "16:00", end: "16:30" },
        status: "pending",
        paymentStatus: "pending",
        reason: "Post-surgery follow-up (bypass surgery)",
        notes: "Patient had bypass surgery 3 months ago. Need to check recovery progress.",
        documents: [],
        createdAt: new Date("2024-03-17"),
        updatedAt: new Date("2024-03-17"),
        __v: 0
      },
      {
        doctorId: getDoctorId("Dr. Michael Chen"),
        userId: getUserId("john.smith@example.com"),
        doctorInfo: {
          name: "Dr. Michael Chen",
          specialization: "Dermatologist",
          fees: 120
        },
        userInfo: {
          name: "John Smith",
          email: "john.smith@example.com",
          phone: "+1 (555) 123-4567"
        },
        date: new Date("2024-03-22T11:00:00Z"),
        timeSlot: { start: "11:00", end: "11:30" },
        status: "approved",
        paymentStatus: "paid",
        reason: "Mole check - annual skin screening",
        notes: "Family history of skin cancer. Regular checkup.",
        documents: [],
        createdAt: new Date("2024-03-14"),
        updatedAt: new Date("2024-03-14"),
        __v: 0
      }
    ];

    const insertedAppointments = await db.collection('appointments').insertMany(appointments);
    console.log(`   ✅ Created ${insertedAppointments.insertedCount} appointments:`);
    appointments.forEach((app) => {
      console.log(`      - ${app.userInfo.name} with ${app.doctorInfo.name} (${app.status})`);
    });

    // ===========================================
    // STEP 4: ADD NOTIFICATIONS
    // ===========================================
    console.log('\n🔔 Step 4: Adding sample notifications...');

    const notifications = [
      {
        userId: getUserId("john.smith@example.com"),
        notifications: [
          {
            type: "appointment",
            message: "Your appointment with Dr. Sarah Johnson has been confirmed for March 20, 2024 at 10:30 AM",
            read: false,
            date: new Date("2024-03-15T10:30:00Z"),
            appointmentId: insertedAppointments.insertedIds[0]
          },
          {
            type: "reminder",
            message: "Reminder: You have an appointment with Dr. Michael Chen tomorrow at 11:00 AM",
            read: false,
            date: new Date("2024-03-21T09:00:00Z"),
            appointmentId: insertedAppointments.insertedIds[4]
          }
        ]
      },
      {
        userId: getUserId("sarah.johnson@doctor.com"),
        notifications: [
          {
            type: "appointment",
            message: "New appointment request from Robert Johnson for March 25, 2024",
            read: false,
            date: new Date("2024-03-17T13:20:00Z"),
            appointmentId: insertedAppointments.insertedIds[3]
          },
          {
            type: "approval",
            message: "Your profile has been approved! You can now start accepting appointments.",
            read: true,
            date: new Date("2023-10-12T09:00:00Z")
          }
        ]
      },
      {
        userId: getUserId("sophia.martinez@example.com"),
        notifications: [
          {
            type: "appointment",
            message: "Your appointment with Dr. Emily Rodriguez has been completed. View visit summary.",
            read: true,
            date: new Date("2024-03-19T10:30:00Z"),
            appointmentId: insertedAppointments.insertedIds[2]
          }
        ]
      }
    ];

    for (const notif of notifications) {
      await db.collection('users').updateOne(
        { _id: notif.userId },
        { $push: { notification: { $each: notif.notifications } } }
      );
    }
    console.log(`   ✅ Added notifications for 3 users`);

    // ===========================================
    // SUMMARY
    // ===========================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📋 DATABASE SUMMARY:');
    console.log(`   👤 Users: ${insertedUsers.insertedCount}`);
    console.log(`   👨‍⚕️ Doctors: ${insertedDoctors.insertedCount}`);
    console.log(`   📅 Appointments: ${insertedAppointments.insertedCount}`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   ' + '-'.repeat(40));
    console.log('   📌 ADMIN ACCESS:');
    console.log('      Email: admin@docspot.com');
    console.log('      Password: Admin@123');
    console.log('\n   📌 DOCTOR ACCESS (password: password123):');
    console.log('      sarah.johnson@doctor.com  (Cardiologist)');
    console.log('      michael.chen@doctor.com   (Dermatologist)');
    console.log('      emily.rodriguez@doctor.com (Pediatrician)');
    console.log('\n   📌 PATIENT ACCESS (password: password123):');
    console.log('      john.smith@example.com');
    console.log('      emma.watson@example.com');
    console.log('      robert.johnson@example.com');
    console.log('      sophia.martinez@example.com');

    console.log('\n✅ All data seeded successfully!');
    console.log('🚀 Start the app and login with any credentials above.\n');

  } catch (error) {
    console.error('\n❌ ERROR DURING SEEDING:');
    console.error('   ' + error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your MongoDB connection string in .env file');
    console.error('   2. Make sure your IP is whitelisted in MongoDB Atlas');
    console.error('   3. Verify your internet connection');
    console.error('   4. Check if MongoDB Atlas cluster is running');
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit();
  }
};

// Run the seeding function
seedDatabase();