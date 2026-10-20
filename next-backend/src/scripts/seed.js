// src/scripts/seed.js
import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

// Read .env.local manually if not in process.env
if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (e) {
    console.warn("Could not read .env.local directly:", e.message);
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not defined in .env.local or environment.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully.");
    const db = client.db("wad_final");

    // Clear existing collections
    await db.collection("users").deleteMany({});
    await db.collection("courses").deleteMany({});
    console.log("Cleared existing users and courses collections.");

    // Hash passwords
    const teacherPasswordHash = await bcrypt.hash("teacher123", 10);
    const studentPasswordHash = await bcrypt.hash("student123", 10);

    // 1. Create 10 Teacher Users (teacher-1 to teacher-10)
    const teachers = [];
    for (let i = 1; i <= 10; i++) {
      teachers.push({
        username: `teacher-${i}`,
        email: `teacher-${i}@wad.ac.th`,
        password: teacherPasswordHash,
        role: "Teacher",
        createdAt: new Date(),
      });
    }

    // 2. Create 10 Student Users (student-1 to student-10)
    const students = [];
    for (let i = 1; i <= 10; i++) {
      students.push({
        username: `student-${i}`,
        email: `student-${i}@wad.ac.th`,
        password: studentPasswordHash,
        role: "Student",
        createdAt: new Date(),
      });
    }

    const insertedTeachers = await db.collection("users").insertMany(teachers);
    const insertedStudents = await db.collection("users").insertMany(students);
    console.log(`Inserted ${insertedTeachers.insertedCount} teachers and ${insertedStudents.insertedCount} students.`);

    // Map IDs for course creation and enrollment
    const teacherIds = [];
    for (let i = 0; i < 10; i++) {
      teacherIds.push(insertedTeachers.insertedIds[i].toString());
    }

    const studentRecords = [];
    for (let i = 0; i < 10; i++) {
      studentRecords.push({
        studentId: insertedStudents.insertedIds[i].toString(),
        username: `student-${i + 1}`,
        email: `student-${i + 1}@wad.ac.th`,
        enrolledAt: new Date(Date.now() - (10 - i) * 86400000),
      });
    }

    // 3. Create Sample Courses across all 10 Teachers
    const courses = [
      // Teacher 1 courses
      {
        courseName: "Full-Stack Web Development with React & Next.js",
        duration: 30,
        topics: ["React", "Next.js", "REST APIs", "Tailwind CSS"],
        price: 4500,
        maxStudents: 20,
        status: "Open",
        teacherId: teacherIds[0],
        teacherName: "teacher-1",
        teacherEmail: "teacher-1@wad.ac.th",
        enrolledStudents: [studentRecords[0], studentRecords[1], studentRecords[2]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseName: "Advanced State Management & Redux Toolkit",
        duration: 15,
        topics: ["Redux", "Zustand", "Context API", "React Query"],
        price: 2500,
        maxStudents: 10,
        status: "Open",
        teacherId: teacherIds[0],
        teacherName: "teacher-1",
        teacherEmail: "teacher-1@wad.ac.th",
        enrolledStudents: [studentRecords[0], studentRecords[3]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 2 courses
      {
        courseName: "MongoDB Mastery & Database Architecture",
        duration: 20,
        topics: ["MongoDB", "Aggregation", "Indexes", "Schema Design"],
        price: 3200,
        maxStudents: 2, // Full capacity course: 2/2
        status: "Open",
        teacherId: teacherIds[1],
        teacherName: "teacher-2",
        teacherEmail: "teacher-2@wad.ac.th",
        enrolledStudents: [studentRecords[1], studentRecords[4]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseName: "PostgreSQL & Relational Data Modeling",
        duration: 25,
        topics: ["PostgreSQL", "SQL", "Prisma ORM", "Transactions"],
        price: 3500,
        maxStudents: 15,
        status: "Open",
        teacherId: teacherIds[1],
        teacherName: "teacher-2",
        teacherEmail: "teacher-2@wad.ac.th",
        enrolledStudents: [], // 0 enrolled -> can be deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 3 courses
      {
        courseName: "Cloud Computing & DevOps Essentials",
        duration: 21,
        topics: ["Docker", "Kubernetes", "CI/CD", "AWS"],
        price: 4000,
        maxStudents: 15,
        status: "Open",
        teacherId: teacherIds[2],
        teacherName: "teacher-3",
        teacherEmail: "teacher-3@wad.ac.th",
        enrolledStudents: [studentRecords[2], studentRecords[5]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseName: "Serverless Microservices Architecture",
        duration: 18,
        topics: ["Serverless", "AWS Lambda", "API Gateway", "Node.js"],
        price: 3800,
        maxStudents: 12,
        status: "Open",
        teacherId: teacherIds[2],
        teacherName: "teacher-3",
        teacherEmail: "teacher-3@wad.ac.th",
        enrolledStudents: [studentRecords[5]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 4 courses
      {
        courseName: "UI/UX Design Systems for Modern Web",
        duration: 14,
        topics: ["Figma", "Design Systems", "Prototyping", "Accessibility"],
        price: 2200,
        maxStudents: 12,
        status: "Close", // Close status: visible to students but NOT enrollable
        teacherId: teacherIds[3],
        teacherName: "teacher-4",
        teacherEmail: "teacher-4@wad.ac.th",
        enrolledStudents: [studentRecords[3], studentRecords[6]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 5 courses
      {
        courseName: "Cybersecurity & Ethical Hacking Fundamentals",
        duration: 28,
        topics: ["OWASP Top 10", "Network Security", "Penetration Testing"],
        price: 5200,
        maxStudents: 10,
        status: "Cancel", // Cancel status: hidden from student catalog
        teacherId: teacherIds[4],
        teacherName: "teacher-5",
        teacherEmail: "teacher-5@wad.ac.th",
        enrolledStudents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseName: "Web Security & Penetration Defense",
        duration: 16,
        topics: ["Cryptography", "JWT Security", "CORS", "Security Headers"],
        price: 3600,
        maxStudents: 8,
        status: "Open",
        teacherId: teacherIds[4],
        teacherName: "teacher-5",
        teacherEmail: "teacher-5@wad.ac.th",
        enrolledStudents: [studentRecords[4], studentRecords[7]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 6 courses
      {
        courseName: "Python for Data Science & Machine Learning",
        duration: 35,
        topics: ["Python", "Pandas", "Scikit-Learn", "Data Analysis"],
        price: 4800,
        maxStudents: 25,
        status: "Open",
        teacherId: teacherIds[5],
        teacherName: "teacher-6",
        teacherEmail: "teacher-6@wad.ac.th",
        enrolledStudents: [studentRecords[6], studentRecords[8]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 7 courses
      {
        courseName: "Modern Mobile App Development with Flutter",
        duration: 30,
        topics: ["Flutter", "Dart", "Cross-Platform", "State Management"],
        price: 4200,
        maxStudents: 18,
        status: "Open",
        teacherId: teacherIds[6],
        teacherName: "teacher-7",
        teacherEmail: "teacher-7@wad.ac.th",
        enrolledStudents: [studentRecords[7], studentRecords[9]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 8 courses
      {
        courseName: "Mobile Development with React Native & Expo",
        duration: 24,
        topics: ["React Native", "Expo", "iOS", "Android"],
        price: 3900,
        maxStudents: 16,
        status: "Open",
        teacherId: teacherIds[7],
        teacherName: "teacher-8",
        teacherEmail: "teacher-8@wad.ac.th",
        enrolledStudents: [studentRecords[8]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 9 courses
      {
        courseName: "Artificial Intelligence & LLM Application Engineering",
        duration: 28,
        topics: ["Gemini API", "OpenAI", "LangChain", "RAG Systems"],
        price: 5500,
        maxStudents: 20,
        status: "Open",
        teacherId: teacherIds[8],
        teacherName: "teacher-9",
        teacherEmail: "teacher-9@wad.ac.th",
        enrolledStudents: [studentRecords[0], studentRecords[9]],
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Teacher 10 courses
      {
        courseName: "Software Engineering Best Practices & Clean Architecture",
        duration: 20,
        topics: ["Clean Code", "Design Patterns", "TDD", "Refactoring"],
        price: 3400,
        maxStudents: 15,
        status: "Open",
        teacherId: teacherIds[9],
        teacherName: "teacher-10",
        teacherEmail: "teacher-10@wad.ac.th",
        enrolledStudents: [], // 0 enrolled -> can be deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedCourses = await db.collection("courses").insertMany(courses);
    console.log(`Inserted ${insertedCourses.insertedCount} sample courses across 10 teachers.`);

    console.log("\n================ SEED COMPLETED ================");
    console.log("Teachers (Password: teacher123):");
    for (let i = 1; i <= 10; i++) {
      console.log(`  teacher-${i} | teacher-${i}@wad.ac.th`);
    }
    console.log("\nStudents (Password: student123):");
    for (let i = 1; i <= 10; i++) {
      console.log(`  student-${i} | student-${i}@wad.ac.th`);
    }
    console.log("================================================\n");

  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
  }
}

seed();
