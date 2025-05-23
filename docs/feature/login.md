# Thiết kế chức năng Đăng nhập

## 1. Mục tiêu
- Cho phép người dùng (admin, hội viên) đăng nhập vào hệ thống bằng username/password.
- Xác thực thông tin, trả về JWT token để truy cập các API bảo vệ.

## 2. Luồng nghiệp vụ
1. Người dùng gửi yêu cầu đăng nhập (username, password) lên API `/auth/login`.
2. Backend kiểm tra username tồn tại, so khớp password (hash).
3. Nếu hợp lệ, sinh JWT token chứa thông tin userId, role, thời hạn.
4. Trả về token cho client, client lưu token để sử dụng cho các request tiếp theo.

## 3. API mẫu
- **POST** `/auth/login`
  - Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "access_token": "jwt-token", "user": { ... } }`

## 4. Xử lý backend (NestJS + Prisma)
- Sử dụng Prisma để truy vấn user theo username.
- So sánh password đã hash (bcrypt).
- Sinh JWT bằng `@nestjs/jwt`.
- Trả về access_token và thông tin user (ẩn password).

## 5. Lưu ý bảo mật
- Password lưu ở DB phải được hash (bcrypt).
- JWT nên có thời hạn ngắn (ví dụ 1h).
- Có thể bổ sung refresh token nếu cần.

## 6. Ví dụ Prisma schema (User)
```prisma
model User {
  id        Int     @id @default(autoincrement())
  username  String  @unique
  password  String
  role      String
  // ... các trường khác ...
}
```

## 7. Ví dụ đoạn mã xử lý (NestJS)
```typescript
const user = await prisma.user.findUnique({ where: { username } });
if (!user || !(await bcrypt.compare(password, user.password))) {
  throw new UnauthorizedException('Invalid credentials');
}
const payload = { sub: user.id, role: user.role };
const access_token = this.jwtService.sign(payload);
return { access_token, user: { ...user, password: undefined } };
```