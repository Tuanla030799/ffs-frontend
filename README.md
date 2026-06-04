# Thepocketshoes Frontend

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
NUXT_PUBLIC_API_BASE_URL=/api
NUXT_PUBLIC_API_TIMEOUT=15000
NUXT_PUBLIC_FILE_BASE_URL=
NUXT_PUBLIC_SITE_URL=http://thepocketshoes.store
FRONTEND_HTTP_PORT=80
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

Axios `baseURL` là `NUXT_PUBLIC_API_BASE_URL`. Khi deploy production nên dùng cùng domain qua reverse proxy, ví dụ `/api`; khi backend chạy ở domain riêng thì đặt thành URL đầy đủ của backend.

## Deploy bằng Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Compose chạy Nuxt SSR ở container nội bộ `fds-web:3000` và public qua Nginx ở port `FRONTEND_HTTP_PORT` mặc định là `80`.

Nginx container là reverse proxy public duy nhất:

- `/` và `/_nuxt/*` proxy sang frontend Nuxt service `fds-web:3000`
- `/api/*` proxy sang backend service `backend:8080`
- `/files/*` proxy sang backend service `backend:8080`

Backend container không cần publish port `80/443`. Khi chạy backend bằng Docker, cho backend join network `thepocketshoes_net` và đặt service name hoặc network alias là `backend`.
