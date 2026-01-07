const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // ตัวช่วยเข้ารหัส
const jwt = require('jsonwebtoken'); // ตัวช่วยทำบัตรผ่าน

// -----------------------------------------------------
// 1. REGISTER (สมัครสมาชิก) -> POST /api/auth/register
// -----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // A. เช็คว่ากรอกมาครบไหม
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "กรอกข้อมูลให้ครบสิครับ!" });
    }

    // B. เช็คว่าอีเมลนี้เคยสมัครหรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "อีเมลนี้มีคนใช้แล้ว ไปใช้อันอื่น!" });
    }

    // C. เข้ารหัส Password (Hashing) **สำคัญมาก**
    const salt = await bcrypt.genSalt(10); // สร้างเกลือ (ตัวสุ่ม)
    const hashedPassword = await bcrypt.hash(password, salt); // คลุกเกลือแล้วทอด

    // D. สร้าง User ใหม่แล้วบันทึก
    const newUser = new User({
      name,
      email,
      password: hashedPassword // เก็บตัวที่ Hash แล้วเท่านั้น!
    });
    
    await newUser.save();

    res.status(201).json({ msg: "สมัครสมาชิกสำเร็จ! ยินดีต้อนรับสู่ StudyShare" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 2. LOGIN (เข้าสู่ระบบ) -> POST /api/auth/login
// -----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. หา User จากอีเมล
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "อีเมลหรือรหัสผ่านผิด (ไม่บอกหรอกว่าอันไหนผิด)" });
    }

    // B. เทียบรหัสผ่าน (User พิมพ์มา vs ใน Database ที่ Hash ไว้)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "อีเมลหรือรหัสผ่านผิด" });
    }

    // C. สร้าง Token (บัตรผ่าน) ส่งกลับไปให้ Frontend
    console.log("JWT_SECRET is:", process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user._id, role: user.role }, // ข้อมูลที่จะฝังในบัตร
      process.env.JWT_SECRET,            // กุญแจลับ
      { expiresIn: '1h' }                // บัตรหมดอายุใน 1 ชั่วโมง
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;