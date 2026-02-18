const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. ดึง Token มาจาก Header (ที่ชื่อว่า x-auth-token)
  const token = req.header('x-auth-token');

  // 2. ถ้าไม่มี Token ก็ถีบออกไปเลย
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied (ไม่มีบัตรผ่าน ห้ามเข้า!)' });
  }

  // 3. ถ้ามี Token ก็ลองแกะดูซิว่าของจริงไหม
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // แกะเสร็จแล้ว แปะข้อมูล user ไว้ใน req ให้ไปใช้ต่อได้
    next(); // ผ่าน! เชิญไปด่านต่อไปได้
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid (บัตรปลอมนี่หว่า!)' });
  }
};