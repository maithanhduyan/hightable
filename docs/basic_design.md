# Mô tả chức năng chi tiết Backend HighTable

## 1. Quản lý xác thực & người dùng (Auth & User)

- **Đăng ký/Đăng nhập:**
  - Người dùng đăng ký tài khoản (admin/hội viên) qua email/số điện thoại.
  - Đăng nhập sử dụng JWT, xác thực và phân quyền.
- **Quản lý tài khoản:**
  - Xem, cập nhật thông tin cá nhân, đổi mật khẩu.
  - Phân quyền: admin (quản lý tổ chức), hội viên (sử dụng thẻ, tích điểm).

## 2. Quản lý tổ chức (Organization)

- **Tạo/sửa/xóa tổ chức:**
  - Admin tạo tối đa 2 tổ chức, chỉnh sửa thông tin, xóa tổ chức.
- **Cấu hình tổ chức:**
  - Thiết lập hạng thẻ, quy tắc tích điểm, ưu đãi riêng cho từng tổ chức.

## 3. Quản lý thẻ hội viên (Membership)

- **Phát hành thẻ:**
  - Admin phát hành thẻ cho hội viên (tối đa 10 thẻ/tổ chức).
  - Chọn hạng thẻ, trạng thái (active, suspended, revoked).
- **Nâng hạng/Thu hồi:**
  - Nâng cấp hạng thẻ, thu hồi hoặc tạm ngưng thẻ hội viên.
- **Lịch sử thẻ:**
  - Theo dõi lịch sử phát hành, nâng hạng, thu hồi.

## 4. Quản lý hội viên (User Membership)

- **Thêm/xóa/sửa hội viên:**
  - Admin thêm mới, chỉnh sửa, xóa hội viên khỏi tổ chức.
- **Quản lý trạng thái:**
  - Theo dõi trạng thái thẻ, điểm, lịch sử tham gia sự kiện.

## 5. Sự kiện & Check-in (Event)

- **Tạo/sửa/xóa sự kiện:**
  - Admin tạo sự kiện, chỉnh sửa, xóa sự kiện cho tổ chức.
- **Quản lý tham gia:**
  - Quản lý danh sách hội viên tham gia, gửi lời mời.
- **Check-in/Điểm danh:**
  - Hội viên check-in bằng mã QR, ghi nhận điểm danh, cộng điểm.

## 6. Tích điểm & Đổi thưởng (Point & Reward)

- **Tích điểm:**
  - Hội viên tích điểm khi tham gia sự kiện, sử dụng dịch vụ.
- **Lịch sử điểm:**
  - Xem lịch sử giao dịch điểm (tích/tiêu).
- **Đổi thưởng:**
  - Đổi điểm lấy ưu đãi, mã giảm giá, phần thưởng do tổ chức cấu hình.

## 7. Thông báo & Tương tác (Notification)

- **Gửi thông báo:**
  - Admin gửi thông báo cho hội viên (push, in-app).
- **Lịch sử thông báo:**
  - Hội viên xem lịch sử nhận thông báo.

## 8. Dashboard & API

- **API RESTful:**
  - Cung cấp endpoint cho mobile/web app: xác thực, quản lý tổ chức, hội viên, sự kiện, điểm, thưởng, thông báo.
- **Dashboard web:**
  - Giao diện quản trị cho admin (nếu có).

---

_Thiết kế tập trung tối giản, loại bỏ chức năng dư thừa, đảm bảo dễ mở rộng và bảo trì. Mọi giới hạn (số tổ chức, số thẻ) đều cấu hình được để phù hợp nhiều mô hình kinh doanh._
