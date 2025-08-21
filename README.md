# 📱 Hệ Thống Quản Lý Bán Hàng Công Nghệ Trực Tuyến

## 📝 Giới thiệu

Dự án là một website thương mại điện tử chuyên bán các sản phẩm điện tử như điện thoại, laptop, phụ kiện, kết hợp với chatbot thông minh hỗ trợ tư vấn khách hàng. Chatbot sử dụng AI hoặc Rule-based để trả lời các câu hỏi về sản phẩm, thông tin bảo hành, tra cứu đơn hàng và hỗ trợ khách hàng trong quá trình mua sắm. Ngoài ra, hệ thống còn cung cấp giao diện quản trị giúp quản trị viên dễ dàng quản lý sản phẩm, đon hàng, xem thống kê, doanh thu,... 

## 🔧 Các chức năng chính

### Đối với khách hàng:

| Nhóm chức năng                | Mô tả chi tiết                                                           |
| ----------------------------- | ------------------------------------------------------------------------ |
| Đăng ký / Đăng nhập           | Email, SĐT, Google/Facebook; lưu session bằng JWT                        |
| Quản lý tài khoản cá nhân     | Cập nhật thông tin, đổi mật khẩu, lịch sử đơn hàng                       |
| Duyệt danh mục sản phẩm       | Xem danh sách sản phẩm theo danh mục (Điện thoại, Laptop, Phụ kiện…)     |
| Tìm kiếm sản phẩm             | Theo tên, hãng, giá, mức đánh giá, hoặc gợi ý thông minh (autocomplete)  |
| Xem chi tiết sản phẩm         | Ảnh, mô tả, thông số kỹ thuật, đánh giá, giá, tình trạng hàng            |
| Đánh giá sản phẩm             | Đăng bình luận, chấm sao, hình ảnh thực tế sau khi mua hàng              |
| Thêm vào giỏ hàng             | Tăng/giảm số lượng, xóa khỏi giỏ                                         |
| Đặt hàng                      | Điền thông tin nhận hàng, phương thức thanh toán                         |
| Thanh toán                    | Tích hợp Momo, ZaloPay, VNPAY hoặc thanh toán khi nhận hàng (COD)        |
| Theo dõi đơn hàng             | Xem trạng thái đơn hàng (đang xử lý, đang giao, đã giao, hủy)            |
| Hủy đơn hàng (trước khi giao) | Có điều kiện thời gian trước khi xử lý đơn                               |
| Trò chuyện với Chatbot        | Hỏi về: gợi ý sản phẩm, thời gian giao hàng, đổi trả, thông số kỹ thuật… |
| Nhận khuyến mãi, thông báo    | Nhận popup/banner/Email hoặc chatbot push về khuyến mãi mới nhất         |


### Đối với quản trị viên (admin):



| Nhóm chức năng               | Mô tả chi tiết                                                            |
| ---------------------------- | ------------------------------------------------------------------------- |
| Quản lý sản phẩm             | Thêm/sửa/xóa sản phẩm, cập nhật tồn kho, thay ảnh, mô tả, giá, khuyến mãi |
| Quản lý danh mục sản phẩm    | Điện thoại, Laptop, Phụ kiện...                                           |
| Quản lý đơn hàng             | Xem danh sách đơn, cập nhật trạng thái đơn hàng (xử lý, giao, hủy…)       |
| Quản lý người dùng           | Khóa/mở tài khoản người dùng vi phạm                                      |
| Quản lý bình luận / đánh giá | Xóa bình luận không phù hợp hoặc ẩn khỏi trang                            |
| Quản lý khuyến mãi           | Tạo mã giảm giá, flash sale, giảm giá theo số lượng hoặc combo            |
| Quản lý nội dung chatbot     | Thêm/sửa câu hỏi – trả lời mặc định, huấn luyện thêm dữ liệu FAQ          |
| Thống kê – báo cáo           | Tổng số đơn hàng, doanh thu, sản phẩm bán chạy, số lượng tồn kho          |

## 🏗️ Công nghệ sử dụng

- Frontend: ReactJS, HTML, CSS, Javascript
- Backend: Java Spring Boot ( JDK 21 )
- Database: MySQL


Cách chạy dự án

Link demo chức năng quan trọng đã có: https://e-commerce-web-ashy.vercel.app/
(Do không có request trong một khoản thời gian nên hệ thống sẽ sleep sau đó hãy chờ 1-2p để hệ thống hoạt động trở lại )
Hướng dẫn cài đặt, cấu hình môi trường, tích hợp chatbot và thanh toán sẽ được cập nhật chi tiết ở phần sau.
