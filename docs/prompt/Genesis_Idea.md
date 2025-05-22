# Genesis Project Design

## Mục tiêu
Xây dựng ứng dụng mastervip.vn nhằm xác thực và quản lý khách hàng VIP cho các tổ chức (hội, club, quán...). Ứng dụng giúp phát hành, quản lý thẻ hội viên VIP đa hạng, hỗ trợ tương tác, tích điểm, tham gia sự kiện và nhận ưu đãi.

## Đối tượng sử dụng
- **Admin tổ chức**: Quản lý hội viên, phát hành thẻ, tổ chức sự kiện, tạo ưu đãi.
- **Hội viên (Hunter)**: Sử dụng thẻ, tích điểm, tham gia sự kiện, nhận thưởng và ưu đãi.

## Các module chính dành cho Freemium
1. **Quản lý tổ chức**
   - Tạo/sửa/xóa tổ chức (tối đa 2 tổ chức/tài khoản admin)
   - Quản lý thông tin tổ chức, cấu hình hạng thẻ

2. **Phát hành & Quản lý thẻ VIP** 
   - Tạo thẻ theo hạng, phát hành cho hội viên (tối đa 10 thẻ/tổ chức)
   - Quản lý trạng thái thẻ, nâng hạng, thu hồi

3. **Quản lý hội viên**
   - Thêm/xóa/sửa hội viên
   - Quản lý điểm, lịch sử tham gia sự kiện, trạng thái thẻ

4. **Sự kiện & Check-in**
   - Tạo sự kiện, quản lý danh sách tham gia
   - Quét mã hội viên khi vào cổng, ghi nhận điểm danh

5. **Tích điểm & Ưu đãi**
   - Tích điểm khi tham gia sự kiện, sử dụng dịch vụ
   - Đổi điểm lấy phần thưởng, mã giảm giá, ưu đãi

6. **Thông báo & Tương tác**
   - Gửi thông báo cho hội viên
   - Tích hợp chat hoặc phản hồi nhanh

## Định hướng kiến trúc
- **Mobile App** (iOS/Android): Giao diện hội viên & admin
- **Backend API**: Quản lý dữ liệu, xác thực, xử lý nghiệp vụ
- **Dashboard Web**: Quản trị nâng cao cho admin

## Quy tắc hoạt động
- Mỗi admin có tối đa 2 tổ chức, mỗi tổ chức phát hành tối đa 10 thẻ.
- Hội viên dùng app để check-in, tích điểm, nhận ưu đãi, tham gia sự kiện.
- Admin kiểm soát phát hành thẻ, xác thực hội viên, tạo sự kiện và ưu đãi.

---
*Ý tưởng lấy cảm hứng từ High Table (John Wick) – xây dựng cộng đồng VIP với trải nghiệm đặc quyền, bảo mật và linh hoạt.*