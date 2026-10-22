# Các vấn đề cần BE xử lý

Danh sách các điểm phía backend cần sửa hoặc hỗ trợ, phát hiện trong đợt review FE ngày
2026-10-22. Hợp đồng API đầy đủ nằm ở `docs/API.md` của repo backend.

**Trạng thái (2026-10-22):**

- BE đã sửa các mục 1–4, 6, 7, 9 và 10 trên nhánh `dev` (commit `d62cfb9`).
- FE đã chuyển sang hợp đồng mới và bỏ các workaround tương ứng.
- **Phải deploy BE lên production trước rồi mới deploy FE.** Với BE cũ:
  - Trang chi tiết có slug không tồn tại sẽ hiện lỗi và trả 200 thay vì 404.
  - Sắp xếp sản phẩm không có tác dụng.
  - Phiên admin hết hạn sau khi tải lại trang, vì BE cũ không đọc refresh token từ cookie.

## Tóm tắt

| #   | Vấn đề                                                               | Trạng thái                          |
| --- | -------------------------------------------------------------------- | ----------------------------------- |
| 1   | Không tìm thấy bản ghi trả 400 thay vì 404                           | Đã sửa                              |
| 2   | Response lỗi không có mã lỗi, message tiếng Anh hiện thẳng cho khách | Đã sửa                              |
| 3   | API danh sách sản phẩm không hỗ trợ sắp xếp                          | Đã sửa                              |
| 4   | Thiếu trường `updatedAt`                                             | Đã sửa                              |
| 5   | Chưa làm sạch HTML rich text khi lưu                                 | BE đã có, cần deploy và dọn dữ liệu |
| 6   | Refresh token trả trong JSON, FE phải lưu ở `localStorage`           | Đã sửa                              |
| 7   | Kiểm tra mã giảm giá sai trả 400 thay vì `valid: false`              | Đã sửa                              |
| 8   | Hình dạng response danh sách chưa thống nhất                         | Đã ghi vào tài liệu API             |
| 9   | Tên trường mã đơn và việc tính lại giá khi tạo đơn                   | Đã xác nhận                         |
| 10  | API public chỉ trả dữ liệu đang bán/đã xuất bản                      | Đã sửa                              |
| 11  | (Tuỳ chọn) Endpoint nhẹ cho sitemap                                  | Chưa làm                            |
| 12  | `shippingFee` do client gửi lên                                      | Mở                                  |
| 13  | Upload file không cần đăng nhập                                      | Mở                                  |

## Đã xử lý và thay đổi phía FE

1. **404:** BE trả 404 kèm mã (`PRODUCT_NOT_FOUND`, `BLOG_POST_NOT_FOUND`...).
   `isNotFoundError` (`src/composables/useNotFoundStatus.ts`) chỉ còn kiểm tra status 404.
2. **Mã lỗi:**
   - Body lỗi là `{ success: false, code, message, data: null, errors? }`.
   - `getErrorMessage` dịch `code` sang tiếng Việt qua `src/modules/shared/errors.ts`. Lỗi validate liệt kê các trường trong `errors[]`.
   - Các mã cho khách (`OUT_OF_STOCK`, `SKU_UNAVAILABLE`, `COUPON_*`) dùng luôn message tiếng Việt của BE.
3. **Sắp xếp:**
   - `ProductListPage.vue` gửi `sort` (`featured`, `price-asc`, `price-desc`, `name-asc`) và bỏ sắp xếp phía client.
   - Đổi cách sắp xếp thì tải lại từ trang 1.
   - FE luôn gửi `sort`, vì mặc định của BE là `newest`.
4. **`updatedAt`:**
   - `server/routes/sitemap.xml.ts` lấy `lastmod` là mốc muộn nhất của `updatedAt` và `createdAt`. Blog tính thêm `publishedAt`.
   - `updatedAt` của sản phẩm đổi cả khi sửa SKU, biến thể và khi tồn kho giảm vì có đơn.
5. **Refresh token:**
   - BE đặt cookie `fss_refresh_token` (HttpOnly, Secure, SameSite=Strict, `Path=/api/admin/auth`).
   - `auth.service.ts` gọi login/refresh/logout với `withCredentials`.
   - `src/stores/app.ts` chỉ giữ refresh token trong bộ nhớ và xoá key cũ `fds-refresh-token` khỏi `localStorage`.
   - Khi gặp 401, FE luôn thử refresh. Không có token trong bộ nhớ thì BE đọc từ cookie.
   - Lưu ý khi chạy local: FE và API phải cùng site (ví dụ `localhost:3000` và `localhost:8080`) thì cookie mới được gửi. Trỏ FE local vào API production thì sau khi tải lại trang phải đăng nhập lại.
6. **Mã giảm giá:**
   - `POST /coupons/validate` luôn trả 200 với `valid`, `code` (lý do), `message` (tiếng Việt), `couponCode`, `discountAmount`, `finalAmount`.
   - Trang đặt hàng hiển thị `message` và lưu `couponCode` đã chuẩn hoá.
7. **Danh sách:** chỉ `/products/featured` và `/admin/orders/{id}/status-history` trả mảng, còn lại đều phân trang. `unwrapList` vẫn nhận cả hai dạng.
8. **Mã đơn:**
   - `POST /orders` trả `{ order, items }`, mã đơn ở `order.orderCode`.
   - Trước đây FE đọc `orderCode` ở cấp ngoài nên trang đặt hàng thành công không hiện mã đơn. `orderApi.create` giờ trả `{ order, items }`.
   - BE tự tính lại giá, giảm giá và tồn kho trong một transaction.
9. **API public:**
   - Chỉ trả biến thể/SKU `ACTIVE`; giá, tồn kho, bộ lọc và sắp xếp chỉ tính các SKU đó.
   - Đặt SKU đã ẩn trả `SKU_UNAVAILABLE`.
   - Blog hẹn giờ/nháp và banner ngoài khung giờ không được trả.
   - FE vẫn lọc phòng thủ bằng `isSellableStatus`.

## 5. Làm sạch HTML rich text

BE đã làm sạch `descriptionHtml`/`contentHtml` theo whitelist khi lưu. Production còn cần:

- Deploy bản BE mới.
- Lưu lại (hoặc chạy script làm sạch) các nội dung cũ đã lưu trước đó.

FE vẫn giữ bước làm sạch khi render.

## 11. (Tuỳ chọn) Endpoint nhẹ cho sitemap

`sitemap.xml` gọi lần lượt toàn bộ danh sách sản phẩm, bộ sưu tập và blog (mỗi trang tối đa 100
bản ghi) rồi cache 1 giờ. Khi số sản phẩm tăng nhiều, nên có endpoint gọn, ví dụ
`GET /sitemap-entries` trả `{ type, slug, updatedAt, imageUrl }`.

## 12. `shippingFee` do client gửi lên

BE dùng nguyên `shippingFee` trong request khi tạo đơn. Nên tính phí vận chuyển ở BE theo
`shippingMethod`.

## 13. Upload file không cần đăng nhập

`POST /files/upload` không yêu cầu token admin. Nên giới hạn cho admin, hoặc ít nhất giới hạn tần
suất.

## Dữ liệu cần bổ sung qua trang admin (không phải lỗi code)

- 93/125 sản phẩm chưa có `shortDescription`. FE đang tự tạo meta description từ đoạn đầu của mô
  tả; điền `shortDescription` sẽ kiểm soát được câu hiển thị trên Google.
- Cả 6 bộ sưu tập chưa có `excerpt` và ảnh, nên card bộ sưu tập hiện ảnh mặc định.
- 3 bộ sưu tập chưa có sản phẩm nào: nên thêm sản phẩm hoặc ẩn đi.
