const router = require('express').Router();
const Course = require('../models/Course');

// 1. ดึงรายวิชาทั้งหมด (GET /api/courses) [cite: 13]
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. เพิ่มรายวิชาใหม่ (POST /api/courses) - เอาไว้เทสก่อน
router.post('/', async (req, res) => {
  const { courseCode, courseName, category, description } = req.body;
  const newCourse = new Course({ courseCode, courseName, category, description });

  try {
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;