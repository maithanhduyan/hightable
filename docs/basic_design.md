# Backend Design cho HighTable Project (NestJS + TypeScript + SQLite)

## 1. Kiến trúc tổng thể
- **Framework:** NestJS (TypeScript)
- **Database:** SQLite (phù hợp MVP, dễ triển khai, không cần server DB riêng)
- **ORM:** Prisma ORM (hiện đại, type-safe, dễ mở rộng)
- **Kiểu kiến trúc:** Modular, RESTful API, JWT Auth

## 2. Các module chính
- **AuthModule:** Đăng ký, đăng nhập, xác thực JWT
- **UserModule:** Quản lý tài khoản người dùng (admin, hội viên)
- **OrganizationModule:** Quản lý tổ chức (tạo/sửa/xóa, cấu hình)
- **MembershipModule:** Quản lý thẻ hội viên, phát hành, nâng hạng, thu hồi
- **EventModule:** Tạo & quản lý sự kiện, check-in, điểm danh
- **PointModule:** Tích điểm, đổi thưởng, lịch sử điểm
- **NotificationModule:** Gửi thông báo cho hội viên
- **RewardModule:** Quản lý ưu đãi, mã giảm giá

## 3. Cấu trúc thư mục tổng thể dự án
```
hightable/
│
├── docs/                # Tài liệu dự án
│
├── backend/             # Source code backend NestJS + Prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── organization/
│   │   ├── membership/
│   │   ├── event/
│   │   ├── point/
│   │   ├── notification/
│   │   ├── reward/
│   │   ├── common/
│   │   └── main.ts
│   ├── prisma/          # Prisma schema & migration
│   │   └── schema.prisma
│   ├── package.json
│   └── ...
│
├── mobile/              # Source code mobile app (React Native/Flutter)
│   └── ...
│
├── web/                 # Source code dashboard web (nếu có)
│   └── ...
│
└── README.md
```

## 4. Các entity cơ bản (Prisma schema)
### User
- id, username, password, role (admin/hunter), profile...

### Organization
- id, name, ownerId (User), tierConfig, ...

### Membership
- id, userId, organizationId, tier, status, issuedAt, upgradedAt...

### Event
- id, organizationId, name, time, location, participants...

### Point
- id, userId, organizationId, amount, type (earn/spend), createdAt...

### Reward
- id, organizationId, name, description, pointCost, available...

## 5. Luồng nghiệp vụ chính
- **Đăng ký/Đăng nhập:** JWT, phân quyền
- **Tạo tổ chức:** Admin tạo, tối đa 2 tổ chức
- **Phát hành thẻ:** Admin phát hành cho hội viên, tối đa 10 thẻ/tổ chức
- **Check-in sự kiện:** Quét mã, ghi nhận điểm danh, cộng điểm
- **Tích điểm/Đổi thưởng:** Giao dịch điểm, đổi ưu đãi

## 6. Gợi ý package sử dụng
- `@prisma/client` + `prisma`+ `sqlite`
- `@nestjs/jwt`, `passport`
- `class-validator`, `class-transformer`

---

*Thiết kế hướng mở rộng, dễ bảo trì, phù hợp MVP và scale lên các DB khác khi cần. Prisma hỗ trợ migration, type-safe và dễ tích hợp với NestJS.*

---

## Đánh giá khả năng chịu tải ~10 triệu user

- **Cấu trúc hiện tại (NestJS + Prisma + SQLite)** phù hợp cho MVP, thử nghiệm, hoặc số lượng user nhỏ đến trung bình (vài ngàn đến vài chục ngàn user).
- **SQLite** không phù hợp cho production quy mô lớn hoặc concurrent write/read cao. Với gần 10 triệu user, cần chuyển sang các hệ quản trị CSDL mạnh hơn như PostgreSQL, MySQL, hoặc cloud database (Aurora, Cloud SQL...).
- **NestJS** và **Prisma** đều hỗ trợ tốt cho scale-out (horizontal scaling), microservices, clustering.
- **Để đạt hiệu năng cao:** 
  - Sử dụng database mạnh (PostgreSQL/MySQL/NoSQL).
  - Tách các service lớn thành microservice.
  - Sử dụng cache (Redis), queue (RabbitMQ/Kafka), load balancer.
  - Triển khai trên cloud, auto scaling, CDN cho static.
  - Tối ưu truy vấn, index, connection pool.

**Kết luận:**  
- Cấu trúc hiện tại là nền tảng tốt cho MVP và có thể mở rộng.
- Để phục vụ gần 10 triệu user thực tế, cần nâng cấp database, tối ưu backend, và triển khai hạ tầng phân tán.
