const router = require('express').Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // เรียกตัวจัดการไฟล์มา
const fs = require('fs');

// 1. ดึงรายวิชาทั้งหมด
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ดึงรายวิชาเดียว (ตาม ID)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    .populate('reviews.user', 'name')      // <--- เพิ่มบรรทัดนี้ (ดึงชื่อคนรีวิว)
    .populate('files.uploadedBy', 'name'); // <--- เพิ่มบรรทัดนี้ (ดึงชื่อคนอัปไฟล์)
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. เพิ่มรายวิชาใหม่ (สำหรับ Admin หรือ Test)
router.post('/', async (req, res) => {
  const { courseCode, courseName, category, description, credits, instructor, fullDescription } = req.body;

  try {
    const newCourse = new Course({
      courseCode,
      courseName,
      category,
      description,
      credits,
      instructor,
      fullDescription
    });
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. เขียนรีวิว (POST Review)
// POST /api/courses/:id/reviews
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // 1. สร้างรีวิวใหม่
    const newReview = {
      user: req.user.id,
      rating: Number(rating),
      comment,
      postedAt: Date.now()
    };

    if (!course.reviews) course.reviews = [];
    course.reviews.unshift(newReview); // เพิ่มรีวิวเข้าไป

    // 2. +++ คำนวณคะแนนเฉลี่ยใหม่ (The Logic) +++
    // เอาคะแนนของทุกรีวิวมารวมกัน
    const totalScore = course.reviews.reduce((acc, review) => acc + review.rating, 0);
    // หารด้วยจำนวนรีวิวทั้งหมด (เก็บทศนิยม 1 ตำแหน่ง)
    course.averageRating = (totalScore / course.reviews.length).toFixed(1);

    await course.save(); // บันทึกทั้งรีวิวและคะแนนเฉลี่ยใหม่

    res.json(course.reviews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// 5. อัปโหลดไฟล์ (Upload File) *** จุดสำคัญ ***
router.post('/:id/upload', [auth, upload.single('file')], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // เช็คว่ามีไฟล์ส่งมาไหม
    if (!req.file) {
      return res.status(400).json({ msg: 'กรุณาเลือกไฟล์ด้วยครับ' });
    }

    const newFile = {
      fileName: req.body.fileName || req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      uploadedBy: req.user.id
    };

    if (!course.files) course.files = [];
    course.files.unshift(newFile);

    await course.save();
    res.json(course.files);
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload Error: ' + err.message);
  }
});

// DELETE /api/courses/:id/reviews/:reviewId (ลบรีวิว)
router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // 1. หา Review ที่จะลบ
    const review = course.reviews.find(r => r._id.toString() === req.params.reviewId);

    // 2. ถ้าไม่เจอรีวิว
    if (!review) return res.status(404).json({ msg: 'Review not found' });

    // 3. เช็คว่าเป็นเจ้าของรีวิวไหม? (User ID ตรงกันไหม)
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // 4. ลบรีวิวออก (ใช้ filter กรองเอาอันที่จะลบออกไป)
    course.reviews = course.reviews.filter(r => r._id.toString() !== req.params.reviewId);

    // 5. คำนวณคะแนนเฉลี่ยใหม่
    if (course.reviews.length > 0) {
      const totalScore = course.reviews.reduce((acc, r) => acc + r.rating, 0);
      course.averageRating = (totalScore / course.reviews.length).toFixed(1);
    } else {
      course.averageRating = 0;
    }

    await course.save();
    res.json(course.reviews);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id/files/:fileId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    // 1. หาไฟล์ที่จะลบ
    const file = course.files.find(f => f._id.toString() === req.params.fileId);
    if (!file) return res.status(404).json({ msg: 'File not found' });

    // 2. เช็คว่าเป็นคนอัปโหลดจริงไหม?
    if (file.uploadedBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'คุณไม่ใช่เจ้าของไฟล์นี้!' });
    }

    // 3. (Optional) ลบไฟล์จริงๆ ออกจากเครื่อง Server เพื่อประหยัดพื้นที่
    try {
      const fs = require('fs');
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (err) {
      console.error("ลบไฟล์จริงไม่สำเร็จ (แต่จะลบใน DB ให้)", err);
    }

    // 4. ลบข้อมูลออกจาก Database
    course.files = course.files.filter(f => f._id.toString() !== req.params.fileId);

    await course.save();
    res.json(course.files); // ส่งรายการไฟล์ล่าสุดกลับไป

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;