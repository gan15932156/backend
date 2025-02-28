```
command


docker compose up -d (สำหรับติดตั้งฐานข้อมูล Postgres บนโปรแกรม Docker)

npm install (สำหรับติดตั้งแพ็จเกจต่างๆ ที่จำเป็นต่อระบบ(Nodejs lib))

npx drizzle-kit generate --name=init (เพื่อสร้างไฟล์ migration สำหรับสร้างตารางในฐานข้อมูล)

npx drizzle-kit generate --name=seed_users --custom (เพื่อสร้างไฟล์ migration สำหรับสร้างข้อมูลต้นแบบในฐานข้อมูล)

npx drizzle-kit migrate (เพื่ออ่านไฟล์ migration สำหรับย้ายข้อมูลตัวอย่างมาไว้ในฐานข้อมูล postgres ที่ติดตั้งอยู่ใน Docker container)

<!-- npx drizzle-kit push (สำหรับติดตั้งตารางข้อมูลในฐานข้อมูล Postgres) -->

npm run dev (สำหรับสั่งให้ระบบเริ่มต้นการทำงาน)


```
