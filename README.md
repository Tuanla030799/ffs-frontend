# Thepocketshoes Frontend

Frontend Nuxt 4 (SSR) cho website bán giày The Pocket Shoes, gồm storefront và trang quản trị,
dùng backend API có sẵn (chạy riêng, không nằm trong repo này).

Quy ước làm việc với repo (cấu trúc, UI, commit, kiểm thử): xem [AGENTS.md](AGENTS.md).

## Tech stack

- Nuxt 4 + Nitro: SSR cho trang public, build cho Node (Docker) hoặc Cloudflare Workers
- Vue 3.5 Composition API, TypeScript
- Pinia lưu phiên đăng nhập admin, theme và trạng thái loading
- Axios client chung: tự gắn `Bearer accessToken`, refresh token khi gặp 401
- Tailwind CSS v4 (`@tailwindcss/vite`), design token `--ui-*` trong `src/style.css`
- TinyMCE 7 soạn nội dung rich text trong admin (mô tả sản phẩm, blog)
- DOMPurify (trình duyệt) và bộ lọc HTML riêng cho SSR (`src/lib/sanitizeHtml.ts`)
- Swiper cho slider trang chủ và gallery sản phẩm

## Cấu trúc thư mục

`srcDir` là `src/`, một số thư mục Nuxt được đổi tên trong `nuxt.config.ts`:

```txt
src
├── nuxt-pages        # route (file-based), chỉ khai báo meta/SEO rồi render page component
├── pages             # page component thật: public/, admin/, system/
├── nuxt-layouts      # public, admin, default
├── nuxt-middleware   # admin (bắt đăng nhập), guest-admin
├── nuxt-plugins
├── components
│   ├── ui            # Ui* design system (export trong index.ts)
│   ├── common        # component dùng chung (SafeHtmlContent, BreadcrumbNav, ...)
│   ├── storefront    # header, footer, card, ảnh sản phẩm
│   ├── home          # slider trang chủ
│   └── admin
├── modules           # theo domain: api.ts, types.ts (+ hooks.ts/helpers.ts)
├── lib               # httpClient, sanitizeHtml, fileUrl, seo, richText, dateTime
├── composables       # useCart, useToast, useDialog, useNotFoundStatus, ...
├── config            # env.ts, brand.ts, adminNav.ts
├── stores            # Pinia store
└── style.css
server                # Nitro: edge cache, robots.txt, sitemap.xml
```

Domain trong `src/modules`: `auth`, `catalog/{category,color,product,size,sku}`,
`content/{banner,blog,brand,collection}`, `customer`, `file`, `promotion/coupon`, `sales/order`,
`shared` (master data, helper phân trang).

## Chạy local

```bash
cp .env.example .env
npm ci
npm run dev          # http://localhost:3000
```

Biến môi trường (đều là giá trị public, không chứa secrets), ý nghĩa chi tiết xem trong
`.env.example`:

```env
NUXT_PUBLIC_API_BASE_URL=/api
NUXT_PUBLIC_API_TIMEOUT=15000
NUXT_PUBLIC_FILE_BASE_URL=
NUXT_PUBLIC_SITE_URL=http://thepocketshoes.store
FRONTEND_HTTP_PORT=80
```

Khi chạy local không có reverse proxy, đặt `NUXT_PUBLIC_API_BASE_URL` là URL đầy đủ của BE, ví dụ
`https://api.example.com/api`.

## Scripts

| Lệnh                                      | Mô tả                                                  |
| ----------------------------------------- | ------------------------------------------------------ |
| `npm run dev`                             | Dev server có HMR                                      |
| `npm run lint` / `npm run lint:fix`       | ESLint                                                 |
| `npm run typecheck`                       | Kiểm tra kiểu (vue-tsc qua `nuxt typecheck`)           |
| `npm run format` / `npm run format:check` | Prettier (kèm sắp xếp class Tailwind)                  |
| `npm run build` / `npm run preview`       | Build và chạy bản Node (dùng cho Docker)               |
| `npm run build:cf` / `npm run preview:cf` | Build và chạy bản Cloudflare Workers (runtime workerd) |
| `npm run deploy:cf`                       | Deploy Worker bằng Wrangler                            |

CI (`.github/workflows`) chạy lint, typecheck, build Node, build Docker, và build Cloudflare kèm
`wrangler deploy --dry-run`.

## Routes chính

Public (SSR, có dữ liệu ngay trong HTML):

- `/`: banner (`GET /landing-banners`), sản phẩm nổi bật (`GET /products/featured`), bộ sưu tập
  (`GET /collections`) và một bài blog (`GET /blogs`)
- `/products`: danh sách sản phẩm (`GET /products`, `GET /master-data`). Bộ lọc danh mục, thương
  hiệu, giới tính, size, màu, khoảng giá và cách sắp xếp đồng bộ với query trên URL
- `/products/:slug`: chi tiết sản phẩm, chọn màu, hướng dẫn chọn size, thêm vào giỏ hàng
- `/collections`, `/collections/:slug`, `/blogs`, `/blogs/:slug`, `/brands`, `/about`
- `/brands/:slug`: chuyển hướng 301 sang `/products?brand=:slug`
- `/robots.txt`, `/sitemap.xml` (sinh từ API: toàn bộ sản phẩm kèm ảnh, bộ sưu tập, bài blog; cache
  1 giờ)

Slug không tồn tại trả về HTTP 404 kèm trang "không tìm thấy".

Chỉ chạy phía client (`ssr: false`):

- `/checkout`: giỏ hàng lưu trong `localStorage`, kiểm tra mã giảm giá (`POST /coupons/validate`),
  đặt hàng COD (`POST /orders`)
- `/order-success`
- `/admin/**`: `login`, `dashboard`, `categories`, `sizes`, `colors`, `brands`, `products`
  (danh sách, tạo, sửa), `collections`, `blogs` (danh sách, tạo, sửa), `orders`, `coupons`,
  `banners`, `customers`, `users`, `logs` (log BE qua SSE)

## Ghi chú tích hợp backend

- Axios `baseURL` là `NUXT_PUBLIC_API_BASE_URL` và phải bao gồm API root. Service chỉ khai báo
  đường dẫn tài nguyên như `/products` hoặc `/admin/products`, không lặp lại `/api`.
- Response có dạng `{ success, message, data }`. API danh sách trả về
  `data = { items, page, limit, total, totalPages }` (dùng `unwrapList`), và `limit` tối đa là 100.
- BE trả 400 kèm message "... not found" cho slug không tồn tại; FE nhận diện trường hợp này và
  trả 404 (`isNotFoundError` trong `src/composables/useNotFoundStatus.ts`).
- Đường dẫn file/ảnh tương đối (`/files/...`) được ghép với `NUXT_PUBLIC_FILE_BASE_URL`, hoặc origin
  của API khi API là URL tuyệt đối (`src/lib/fileUrl.ts`).
- Nội dung HTML từ BE (mô tả sản phẩm, blog, bộ sưu tập) luôn đi qua `sanitizeHtml` trước khi
  render, kể cả khi SSR.
- Các điểm BE cần sửa và cách FE đang xử lý tạm: [docs/backend-issues.md](docs/backend-issues.md).

## Deploy bằng Docker (VM, hiện ngừng dùng)

Giữ lại để có thể quay về VM. Workflow `deploy.yml` chỉ còn chạy tay.

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
Network `thepocketshoes_net` là Docker network dùng chung bên ngoài Compose. Tạo một lần trên server nếu chưa có:

```bash
docker network inspect thepocketshoes_net >/dev/null 2>&1 || docker network create thepocketshoes_net
```

## Deploy lên Cloudflare Workers (production)

Production chạy trên Cloudflare Workers (`thepocketshoes.store`), BE chạy trên Heroku. Build riêng
với preset `cloudflare_module`, giữ SSR cho trang public; FE gọi URL HTTPS đầy đủ của BE qua
`NUXT_PUBLIC_API_BASE_URL`.

```bash
npm run build:cf    # build Worker vào .output/
npm run preview:cf  # chạy trên runtime workerd local, đọc biến từ .dev.vars
```

HTML của trang public được cache tại edge 5 phút (chỉ trên custom domain), khoá cache gắn với
build ID nên mỗi lần deploy sẽ không trả lại HTML của bản cũ.

Phát hành: merge `dev` vào `dev_deploy_cloudflare`, sau đó deploy thủ công (local bằng Wrangler hoặc
workflow `Deploy Cloudflare`). Chi tiết env, CORS, cache, hạn mức và các
bước gắn domain: [docs/cloudflare-workers.md](docs/cloudflare-workers.md).
