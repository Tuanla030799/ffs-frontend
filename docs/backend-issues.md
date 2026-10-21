# Các vấn đề cần BE xử lý

Danh sách các điểm phía backend cần sửa hoặc hỗ trợ, phát hiện trong đợt review FE ngày
2026-10-22. Mọi hiện trạng bên dưới đều đã được kiểm chứng bằng request thật tới API production.

Với mỗi mục, phần **FE đang xử lý tạm** cho biết chỗ FE phải đoán hoặc làm thay. Khi BE sửa xong,
FE cần dọn đúng chỗ đó (xem phần **Sau khi BE sửa**).

Lệnh thử dùng chung:

```bash
API=https://api.thepocketshoes.store/api
```

## Tóm tắt

| #   | Vấn đề                                                               | Mức độ     |
| --- | -------------------------------------------------------------------- | ---------- |
| 1   | Không tìm thấy bản ghi trả 400 thay vì 404                           | Cao        |
| 2   | Response lỗi không có mã lỗi, message tiếng Anh hiện thẳng cho khách | Trung bình |
| 3   | API danh sách sản phẩm không hỗ trợ sắp xếp                          | Trung bình |
| 4   | Thiếu trường `updatedAt`                                             | Trung bình |
| 5   | Chưa làm sạch HTML rich text khi lưu                                 | Trung bình |
| 6   | Refresh token trả trong JSON, FE phải lưu ở `localStorage`           | Trung bình |
| 7   | Kiểm tra mã giảm giá sai trả 400 thay vì `valid: false`              | Thấp       |
| 8   | Hình dạng response danh sách chưa thống nhất                         | Thấp       |
| 9   | Cần xác nhận: tên trường mã đơn và việc tính lại giá khi tạo đơn     | Thấp       |
| 10  | Cần xác nhận: API public chỉ trả dữ liệu đang bán/đã xuất bản        | Thấp       |
| 11  | (Tuỳ chọn) Endpoint nhẹ cho sitemap                                  | Thấp       |

## 1. Không tìm thấy bản ghi trả 400 thay vì 404

**Hiện trạng:** các endpoint chi tiết trả HTTP 400 khi slug không tồn tại.

| Request                       | Response                                                             |
| ----------------------------- | -------------------------------------------------------------------- |
| `GET /products/<slug-sai>`    | `400 {"success":false,"message":"Product not found","data":null}`    |
| `GET /blogs/<slug-sai>`       | `400 {"success":false,"message":"Blog post not found","data":null}`  |
| `GET /collections/<slug-sai>` | `400 {"success":false,"message":"Collection not found","data":null}` |
| `GET /brands/<slug-sai>`      | `400 {"success":false,"message":"Brand not found","data":null}`      |

```bash
curl -i "$API/products/slug-khong-ton-tai"
```

**Mong muốn:** trả `404` (kèm mã lỗi, xem mục 2). `400` chỉ dùng cho request sai định dạng.

**Ảnh hưởng:** FE cần trả HTTP 404 cho trang không tồn tại, nếu không Google sẽ coi là "soft 404"
và index trang lỗi. Vì BE trả 400, FE phải đoán "không tìm thấy" dựa vào nội dung message.

**FE đang xử lý tạm:** `isNotFoundError` trong `src/composables/useNotFoundStatus.ts` coi
`status 400` + message khớp `/not found|không tìm thấy|không tồn tại/i` là 404.

**Sau khi BE sửa:** bỏ nhánh kiểm tra 400 + message trong `isNotFoundError`, chỉ giữ 404.

## 2. Response lỗi không có mã lỗi, message tiếng Anh hiện thẳng cho khách

**Hiện trạng:** body lỗi chỉ có `{ success, message, data }`, không có trường mã lỗi; message là
tiếng Anh, ví dụ `Product not found`, `Coupon is invalid`,
`limit must be less than or equal to 100`, `Invalid credentials`.

**Mong muốn:**

- Thêm trường `code` ổn định, máy đọc được, ví dụ `PRODUCT_NOT_FOUND`, `COUPON_INVALID`,
  `COUPON_EXPIRED`, `COUPON_MIN_SUBTOTAL`, `OUT_OF_STOCK`, `VALIDATION_ERROR`,
  `AUTH_INVALID_CREDENTIALS`.
- Lỗi validate kèm chi tiết theo field, ví dụ `errors: [{ field: "limit", message: "..." }]`.
- Message hiển thị cho khách nên là tiếng Việt, hoặc để FE tự dịch theo `code`.

**Ảnh hưởng:** FE hiển thị nguyên `message` cho khách (ví dụ ô mã giảm giá ở trang đặt hàng
hiện "Coupon is invalid" trên giao diện tiếng Việt) và không phân biệt được từng loại lỗi để
xử lý riêng.

**FE đang xử lý tạm:** `getErrorMessage` (`src/modules/shared/hooks.ts`) hiển thị nguyên
`message`; trường hợp không tìm thấy thì đoán theo mục 1.

**Sau khi BE sửa:** FE map `code` sang thông báo tiếng Việt và xử lý riêng theo từng mã.

## 3. API danh sách sản phẩm không hỗ trợ sắp xếp

**Hiện trạng:** `GET /products` bỏ qua mọi tham số sắp xếp đã thử (`sort=price_asc`,
`sort=-price`, `sortBy=minPrice&sortDir=desc`, `orderBy=name`): thứ tự trả về giống hệt mặc định.

**Mong muốn:** hỗ trợ một tham số, ví dụ
`sort=featured | newest | price_asc | price_desc | name_asc`. Giá sắp xếp theo giá thực bán
thấp nhất của sản phẩm (`minSalePrice`, nếu không giảm giá thì `minPrice`). Sắp xếp phải áp dụng
trên toàn bộ kết quả trước khi phân trang.

**Ảnh hưởng:** người dùng chọn "Giá: thấp đến cao" nhưng chỉ 12 sản phẩm của trang hiện tại được
sắp xếp, các trang sau vẫn lộn xộn.

**FE đang xử lý tạm:** `sortedProducts` trong `src/pages/public/ProductListPage.vue` sắp xếp phía
client trong phạm vi trang hiện tại.

**Sau khi BE sửa:** thêm `sort` vào `listParams()` của `ProductListPage.vue` và bỏ sắp xếp phía
client.

## 4. Thiếu trường `updatedAt`

**Hiện trạng:** danh sách và chi tiết sản phẩm, bộ sưu tập, blog chỉ có `createdAt` (blog có thêm
`publishedAt`), không có `updatedAt`.

**Mong muốn:** thêm `updatedAt` cho sản phẩm (cả danh sách lẫn chi tiết), bộ sưu tập và blog.
Với sản phẩm, `updatedAt` nên đổi cả khi sửa SKU, tồn kho, giá, ảnh hoặc biến thể.

**Ảnh hưởng:** `sitemap.xml` đang dùng `createdAt`/`publishedAt` làm `lastmod`, nên Google không
biết trang đã được cập nhật và chậm cập nhật giá/nội dung trên kết quả tìm kiếm.

**FE đang xử lý tạm:** `server/routes/sitemap.xml.ts` dùng `createdAt` (blog dùng
`publishedAt || createdAt`).

**Sau khi BE sửa:** đổi sang `updatedAt` trong `server/routes/sitemap.xml.ts`.

## 5. Chưa làm sạch HTML rich text khi lưu

**Hiện trạng:** `descriptionHtml` (sản phẩm, bộ sưu tập) và `contentHtml` (blog) được lưu và trả về
nguyên văn những gì admin gửi lên.

**Mong muốn:** làm sạch HTML ở BE khi tạo/cập nhật (allowlist thẻ và thuộc tính), không tin tưởng
nội dung từ client. Allowlist FE đang dùng nằm trong `src/lib/sanitizeHtml.ts` (`ALLOWED_TAGS`,
`ALLOWED_ATTR`, chỉ cho phép URL `http`, `https`, `mailto`, `tel`).

**Ảnh hưởng:** đây là lớp phòng thủ thứ hai. FE đã làm sạch trước khi render (cả SSR lẫn trình
duyệt), nhưng mọi nơi khác dùng chung dữ liệu (email, app, công cụ khác) vẫn có nguy cơ XSS nếu
nội dung bẩn được lưu vào DB.

**Sau khi BE sửa:** FE vẫn giữ bước làm sạch khi render.

## 6. Refresh token trả trong JSON, FE phải lưu ở `localStorage`

**Hiện trạng:** `POST /admin/auth/login` và `/admin/auth/refresh` trả `accessToken` và
`refreshToken` trong body; FE lưu cả hai vào `localStorage` (`src/stores/app.ts`).

**Mong muốn (dài hạn):** refresh token đặt trong cookie `HttpOnly; Secure; SameSite=Lax` (hoặc
`Strict`), `Path=/api/admin/auth`; access token ngắn hạn chỉ giữ trong bộ nhớ. CORS cần cho phép
`credentials` với origin cụ thể (`https://thepocketshoes.store`), không dùng `*`.

**Ảnh hưởng:** nếu có lỗ XSS ở bất kỳ trang nào cùng domain, kẻ tấn công đọc được token admin trong
`localStorage`.

**Sau khi BE sửa:** FE bật `withCredentials` cho các request auth, bỏ lưu refresh token trong
`src/stores/app.ts` và cập nhật luồng refresh trong `src/lib/http/httpClient.ts`.

## 7. Kiểm tra mã giảm giá sai trả 400 thay vì `valid: false`

**Hiện trạng:**

```bash
curl -i -X POST "$API/coupons/validate" -H 'content-type: application/json' \
  -d '{"code":"MA-KHONG-TON-TAI","subtotalAmount":1000000}'
# 400 {"success":false,"message":"Coupon is invalid","data":null}
```

**Mong muốn:** mã không hợp lệ là kết quả nghiệp vụ bình thường, nên trả
`200 { data: { valid: false, code, message } }` với lý do cụ thể (không tồn tại, hết hạn, chưa đủ
giá trị đơn tối thiểu, hết lượt dùng). Mã hợp lệ trả `valid: true` kèm `discountAmount` tính theo
`subtotalAmount` gửi lên.

**Ảnh hưởng:** trình duyệt ghi lỗi 400 vào console ở mỗi lần nhập sai mã; FE không biết lý do để
gợi ý cho khách.

**FE đang xử lý tạm:** `CheckoutPage.vue` xử lý được cả hai kiểu (lỗi 400 lẫn `valid: false`).

**Sau khi BE sửa:** không cần sửa FE, chỉ cần hiển thị thêm lý do nếu có `code`.

## 8. Hình dạng response danh sách chưa thống nhất

**Hiện trạng:** `GET /products/featured` trả mảng trong `data`, còn `/landing-banners`,
`/products`, `/blogs`, `/collections`, `/brands` trả object phân trang
`{ items, page, limit, total, totalPages }`.

**Mong muốn:** thống nhất một quy ước và ghi vào tài liệu API: endpoint danh sách luôn trả object
phân trang, hoặc tách rõ endpoint nào trả mảng.

**FE đang xử lý tạm:** `unwrapList` (`src/modules/shared/types.ts`) nhận cả hai dạng.

## 9. Cần xác nhận: tên trường mã đơn và việc tính lại giá khi tạo đơn

- `POST /orders` trả mã đơn trong trường nào (`orderCode` hay `code`)? FE đang đọc
  `orderCode || code || id` (`src/pages/public/CheckoutPage.vue`,
  `src/pages/admin/sales/OrderAdminPage.vue`). Nên thống nhất một trường.
- BE có tính lại giá, giảm giá và kiểm tra tồn kho khi tạo đơn không? Số tiền FE hiển thị (tạm
  tính, giảm giá, tổng) chỉ để tham khảo; BE phải là nguồn đúng duy nhất.

## 10. Cần xác nhận: API public chỉ trả dữ liệu đang bán/đã xuất bản

API public vẫn trả trường `status` cho biến thể và SKU. Hiện toàn bộ đều `ACTIVE` (127 biến thể,
125 SKU), nên chưa kiểm chứng được BE có lọc hay không. Cần xác nhận các endpoint public **không**
trả:

- sản phẩm, biến thể, SKU ở trạng thái `INACTIVE`/`DRAFT`;
- bài blog chưa xuất bản (`publishedAt` trong tương lai hoặc trạng thái nháp);
- banner ngoài khoảng `startsAt`–`endsAt`.

FE vẫn lọc phòng thủ biến thể/SKU theo `isSellableStatus`
(`src/modules/catalog/product/helpers.ts`).

## 11. (Tuỳ chọn) Endpoint nhẹ cho sitemap

`sitemap.xml` hiện gọi lần lượt toàn bộ danh sách sản phẩm, bộ sưu tập và blog (mỗi trang tối đa
100 bản ghi) rồi cache 1 giờ. Khi số sản phẩm tăng nhiều, nên có endpoint gọn, ví dụ
`GET /sitemap-entries` trả `{ type, slug, updatedAt, imageUrl }` cho sản phẩm, bộ sưu tập và blog.

## Hợp đồng API mà FE đang dựa vào

Đổi các điểm sau sẽ làm hỏng FE, cần báo trước:

- Response bọc trong `{ success, message, data }`.
- Danh sách phân trang trả `data = { items, page, limit, total, totalPages }`; `limit` tối đa 100
  (lớn hơn trả 400), FE tự lấy nhiều trang khi cần đủ dữ liệu.
- Item trong `GET /products` có `minPrice`, `minSalePrice`, `totalStock`, `primaryImageUrl`;
  khi không giảm giá thì `minSalePrice` bằng `minPrice`.
- Chi tiết sản phẩm có `skus[].price`, `skus[].salePrice` (`null` khi không giảm giá),
  `skus[].stock`, `variants[]`, `images[]`.
- Danh mục hiện không bán theo size: mỗi sản phẩm một SKU với `size = "DEFAULT"`.
- Đường dẫn file/ảnh có thể là URL tuyệt đối hoặc đường dẫn `/files/...`.

## Dữ liệu cần bổ sung qua trang admin (không phải lỗi code)

- 93/125 sản phẩm chưa có `shortDescription`. FE đang tự tạo meta description từ đoạn đầu của mô
  tả; điền `shortDescription` sẽ kiểm soát được câu hiển thị trên Google.
- Cả 6 bộ sưu tập chưa có `excerpt` và ảnh, nên card bộ sưu tập hiện ảnh mặc định.
- 3 bộ sưu tập chưa có sản phẩm nào: nên thêm sản phẩm hoặc ẩn đi.
