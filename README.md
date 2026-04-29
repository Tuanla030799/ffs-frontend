# Fresh Shoes Frontend

Vue 3 + Vite + TypeScript frontend cho website ecommerce bán giày, dùng backend API có sẵn.

## Tech stack

- Vue 3 Composition API
- Vue Router route guard cho `/admin`
- Pinia lưu auth/session
- Axios client chung, tự attach `Bearer accessToken`, refresh token khi 401
- Tailwind CSS v4
- Editor.js cho `descriptionJson` trong admin product

## Cấu trúc module

```txt
src/modules
├── auth
├── catalog/category
├── catalog/product
├── catalog/sku
├── sales/order
├── promotion/coupon
├── content/banner
├── customer
├── file
└── shared
```

Mỗi domain có `api.ts`, `types.ts`, `hooks.ts` theo yêu cầu.

## Chạy local

```bash
cp .env.example .env
npm install
npm run build
npm run dev
```

`.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=15000
VITE_FILE_BASE_URL=http://localhost:8080
```

## Routes chính

Public:

- `/` trang chủ, gọi `GET /api/landing-banners`, `GET /api/products/featured?limit=12`, `GET /api/categories`
- `/products` danh sách sản phẩm, hỗ trợ filter query params
- `/products/:slug` chi tiết sản phẩm, chọn variant/SKU và đặt hàng nhanh bằng `POST /api/orders`

Admin:

- `/admin/login`
- `/admin/dashboard`
- `/admin/categories`
- `/admin/products`
- `/admin/orders`
- `/admin/coupons`
- `/admin/banners`
- `/admin/customers`
- `/admin/users`

## Ghi chú tích hợp backend

Axios `baseURL` là `VITE_API_BASE_URL`. Nếu backend đã prefix `/api`, đặt `VITE_API_BASE_URL=http://localhost:8080/api`. Nếu backend expose đúng như request (`/api/...`) qua reverse proxy, giữ nguyên `http://localhost:8080` và chỉnh endpoint ở `api.ts` khi cần.
