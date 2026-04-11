## System Requirements — E-Commerce Web Application
## Full Stack Project · ระบบร้านค้าออนไลน์ DaviDice

## 📊 Project Metrics
User Roles: 2

Modules: 6

Functional Req.: 28

Non-Functional Req.: 8

## 1. Project Overview
วัตถุประสงค์
พัฒนาระบบร้านค้าออนไลน์ (E-Commerce) แบบ Full Stack สำหรับการซื้อ-ขายสินค้าทั่วไป

รองรับผู้ใช้งาน 3 ประเภท ได้แก่ Guest, Customer, และ Admin

ระบบสามารถจัดการสินค้า ออเดอร์ และการชำระเงินได้แบบครบวงจร

Tech Stack
Frontend: React.js / Next.js

Backend: Node.js + Express 

Database: PostgreSQL 

Authentication: JWT Token


## 2. User Roles & Actors

Customer (ลูกค้า): จัดการโปรไฟล์, เพิ่มสินค้าลงตะกร้า, สั่งซื้อ/ชำระเงิน และติดตามสถานะออเดอร์

Admin (ผู้ดูแลระบบ): จัดการสินค้าและหมวดหมู่, อัปเดตสถานะออเดอร์, และดูรายงานยอดขาย

## 3. Functional Requirements
FR-01 · Authentication & User Management
FR-01.1: สมัครสมาชิกด้วย Email และ Password

FR-01.2: ตรวจสอบ Email ซ้ำและความปลอดภัยของ Password

FR-01.3: ระบบล็อกอิน / ล็อกเอาท์

FR-01.4: แก้ไขข้อมูลส่วนตัว (ชื่อ, ที่อยู่, เบอร์โทร)

FR-01.5: จัดการ Session / Token (JWT)

FR-02 · Product Management
FR-02.1: แสดงรายการสินค้าพร้อมรูปภาพ ราคา และสต็อก

FR-02.2: ค้นหาสินค้าด้วย Keyword

FR-02.3: กรองสินค้าตามหมวดหมู่และราคา

FR-02.4: แสดงหน้ารายละเอียดสินค้า

FR-02.5: Admin เพิ่ม/แก้ไข/ลบสินค้าได้ผ่าน Dashboard

FR-02.6: Admin สามารถอัปโหลดรูปภาพสินค้าได้

FR-03 · Shopping Cart
FR-03.1: เพิ่ม/ลบ/แก้ไขจำนวนสินค้าในตะกร้า

FR-03.2: แสดงราคารวมแบบ Real-time

FR-03.3: ตรวจสอบสต็อกสินค้าก่อนเพิ่มลงตะกร้า

FR-03.4: ตะกร้าคงอยู่เมื่อกลับมาล็อกอินใหม่ (Optional)

FR-04 · Order Management
FR-04.1: สั่งซื้อสินค้าจากตะกร้า

FR-04.2: บันทึกข้อมูลออเดอร์ (สินค้า, จำนวน, ราคา, ที่อยู่จัดส่ง)

FR-04.3: ลดสต็อกสินค้าทันทีเมื่อมีการสั่งซื้อ

FR-04.4: ดูประวัติและสถานะออเดอร์

FR-04.5: Admin อัปเดตสถานะออเดอร์ (Pending → Processing → Shipped → Delivered)

FR-05 · Payment
FR-05.1: รองรับการชำระเงิน (Mock Payment หรือ Stripe Sandbox)

FR-05.2: แสดงสรุปรายการก่อนยืนยันการชำระเงิน

FR-05.3: ออก Order Confirmation หลังชำระเงินสำเร็จ

FR-06 · Admin Dashboard
FR-06.1: ล็อกอินผ่าน Route แยกจาก Customer

FR-06.2: ดูรายการออเดอร์ทั้งหมด

FR-06.3: ดูสรุปยอดขาย (จำนวนออเดอร์, รายได้รวม)

FR-06.4: จัดการหมวดหมู่สินค้า

## 4. Non-Functional Requirements
NFR-01 Security: Hash Password ด้วย bcrypt, API มี Authentication

NFR-02 Performance: หน้า Product List โหลดภายใน 3 วินาที

NFR-03 Usability: รองรับ Responsive Design (Desktop & Mobile)

NFR-04 Reliability: จัดการ Error และแสดงข้อความแจ้งเตือนผู้ใช้

NFR-05 Maintainability: โครงสร้าง Code ชัดเจน แยก Layer ชัดเจน

NFR-06 Data Integrity: ใช้ Transaction เมื่อสั่งซื้อเพื่อป้องกัน Stock ผิดพลาด

NFR-07 Scalability: ออกแบบ API แบบ RESTful

NFR-08 Documentation: มี API Documentation (Postman หรือ Swagger)

## 5. Data Entities (Core Tables)
Users: id, name, email, password_hash, role, address, phone, created_at

Categories: id, name, description

Products: id, category_id, name, description, price, stock_qty, image_url

Cart: id, user_id, product_id, quantity

Orders: id, user_id, total_price, status, shipping_address, created_at

Order_Items: id, order_id, product_id, quantity, unit_price

Payments: id, order_id, amount, method, status, paid_at

## 6. Assumptions & Constraints
เป็นโปรเจกต์ MVP สำหรับส่งงานวิชาเรียน ไม่ใช่ Production จริง

ไม่บังคับระบบ Email Notification

รองรับภาษาไทยและอังกฤษ

ระบบ Single Vendor (มีผู้ขายรายเดียวคือ Admin)

ใช้ Mock/Sandbox สำหรับการชำระเงิน

ไม่รองรับ Social Login ในเวอร์ชันนี้
