# Deploy FE lên Cloudflare Workers

Tài liệu cho nhánh chuẩn bị chuyển FE (Nuxt SSR) sang Cloudflare Workers. BE, database và
xử lý ảnh vẫn chạy ở server riêng; Worker chỉ render HTML và phục vụ static assets.

## Kiến trúc

| Thành phần                                 | Docker/VM (hiện tại)            | Cloudflare Workers                                            |
| ------------------------------------------ | ------------------------------- | ------------------------------------------------------------- |
| Nitro preset                               | `node-server` (`npm run build`) | `cloudflare_module` (`npm run build:cf`)                      |
| Trang public                               | SSR                             | SSR                                                           |
| `/admin/**`, `/checkout`, `/order-success` | `ssr: false`                    | `ssr: false` (giữ nguyên)                                     |
| `/api`, `/files`                           | Nginx proxy sang BE             | Không có proxy: trình duyệt và SSR gọi thẳng URL HTTPS của BE |
| Cache `swr: 300`                           | Bật (cache trong process Node)  | Tắt, chỉ giữ header `cache-control` (xem mục Cache)           |

Phiên bản đã xác minh: Nuxt 4.4.5, nitropack 2.13.4, wrangler 4.x.

File liên quan:

- `wrangler.jsonc`: `main` = `.output/server/index.mjs`, `assets.directory` = `.output/public/`,
  `compatibility_flags: ["nodejs_compat"]`, `compatibility_date: "2026-05-11"`.
- `nuxt.config.ts`: `nitro.cloudflare = { deployConfig: false, nodeCompat: true }`. Preset chỉ được
  chọn qua `NITRO_PRESET` trong script `build:cf`, nên `npm run dev`, `npm run build` và Docker không đổi.

## Scripts

```bash
npm run build:cf    # NITRO_PRESET=cloudflare_module nuxt build
npm run preview:cf  # wrangler dev: chạy bản build trên runtime workerd local
npm run deploy:cf   # wrangler deploy (cần đăng nhập/CLOUDFLARE_API_TOKEN). Không chạy tay khi chưa sẵn sàng.
```

Phát triển hằng ngày vẫn dùng `npm run dev`.

## Biến môi trường

Tất cả đều là giá trị **public** (được gửi xuống trình duyệt qua runtime config). Không đưa
secrets vào `NUXT_PUBLIC_*`.

| Biến                        | Ví dụ production                       | Ghi chú                                                                                                                                                                        |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NUXT_PUBLIC_API_BASE_URL`  | `https://api.thepocketshoes.store/api` | Bắt buộc là URL HTTPS đầy đủ, gồm API root. Service chỉ khai báo `/products`, `/admin/...`.                                                                                    |
| `NUXT_PUBLIC_API_TIMEOUT`   | `15000`                                | Timeout Axios (ms).                                                                                                                                                            |
| `NUXT_PUBLIC_FILE_BASE_URL` | `https://api.thepocketshoes.store`     | Origin phục vụ `/files/...`. Để trống thì dùng origin của `NUXT_PUBLIC_API_BASE_URL`. Không thêm `/files` (nếu lỡ thêm, `resolveFileUrl` vẫn không ghép trùng `/files/files`). |
| `NUXT_PUBLIC_SITE_URL`      | `https://thepocketshoes.store`         | Domain FE cho canonical, `og:url`, `og:image`, `robots.txt`, `sitemap.xml`.                                                                                                    |

Cách giá trị đến Worker:

1. **Lúc build**: `nuxt.config.ts` đọc `process.env` và bake làm giá trị mặc định. `og:image`
   mặc định trong `app.head` **chỉ** lấy từ build, nên `NUXT_PUBLIC_SITE_URL` phải đúng lúc build.
2. **Lúc chạy**: Nitro đọc Worker vars mỗi request (`useRuntimeConfig(event)`), ghi đè giá trị build.
   Đã kiểm chứng bằng `wrangler dev`: build với một URL, `.dev.vars` với URL khác, robots/sitemap/
   canonical và các call API SSR dùng giá trị của `.dev.vars`.

Workflow `deploy-cloudflare.yml` dùng cùng một nguồn (GitHub Environment variables) cho cả hai bước.

Preview local: tạo `.dev.vars` (đã gitignore) cùng format `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=https://api.thepocketshoes.store/api
NUXT_PUBLIC_API_TIMEOUT=15000
NUXT_PUBLIC_FILE_BASE_URL=
NUXT_PUBLIC_SITE_URL=https://thepocketshoes.store
```

## Yêu cầu CORS ở BE

Khi FE và BE khác origin, trình duyệt gửi preflight. BE cần (chỉnh ở repo BE, không thuộc repo này):

- `Access-Control-Allow-Origin`: liệt kê chính xác domain FE, ví dụ `https://thepocketshoes.store`,
  `https://www.thepocketshoes.store`, domain preview `https://<worker>.<subdomain>.workers.dev` và các
  preview URL dạng `https://<version-prefix>-<worker>.<subdomain>.workers.dev` nếu dùng để test admin.
  Không dùng `*` cho route admin.
- `Access-Control-Allow-Methods`: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- `Access-Control-Allow-Headers`: `Authorization, Content-Type, Accept, X-Requested-With`.
- Trả `204/200` cho `OPTIONS` (gồm `/api/admin/auth/login`, `/api/admin/auth/refresh`,
  `/api/admin/files/upload`, `/api/admin/logs/stream`, `/api/orders`).
- Không cần `Access-Control-Allow-Credentials`: FE gửi token qua header `Authorization`,
  không dùng cookie (`withCredentials` không bật).
- `Vary: Origin` nếu BE trả origin động.
- `/files/*` phục vụ qua `<img>` nên không cần CORS, trừ khi sau này đọc ảnh bằng `fetch`/canvas.
- Log stream (`/api/admin/logs/stream`, SSE qua `fetch`) cần BE tắt buffering như cấu hình Nginx
  hiện tại (`proxy_buffering off`, timeout dài) ở reverse proxy phía BE.
- Upload: giới hạn body ở reverse proxy phía BE (hiện Nginx đặt `client_max_body_size 20m`).

## Cache và SSR

- `swr: 300` của Nitro dùng storage `cache`, trên Workers mặc định là memory của từng isolate: không
  bền, không chia sẻ giữa isolate/PoP, có thể bị dọn bất cứ lúc nào. Vì vậy bản Cloudflare **tắt
  `swr`** và chỉ giữ header `cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400`
  cho `/products/**`, `/blogs/**`, `/collections/**`, `/brands/**`. Bản Docker vẫn bật `swr` như cũ.
- Không dùng KV làm cache: gói Free giới hạn 1.000 lượt ghi/ngày, mỗi URL (kể cả biến thể query
  `/products?...`) sẽ ghi lại mỗi 5 phút nên vượt hạn mức nhanh.
- Response do Worker sinh ra **không** tự được CDN Cloudflare cache theo `s-maxage`. Nếu cần cache
  HTML ở edge sau này, cân nhắc Cache API trong Worker hoặc Cache Rules và chỉ áp dụng cho route
  public ở trên. Không cache `/admin/**`, `/checkout`, `/order-success`.
- SSR không mang dữ liệu cá nhân: token admin chỉ nằm ở `localStorage` và được nạp ở plugin client;
  Pinia được Nuxt tạo theo từng request. Biến module-level `refreshPromise` chỉ dùng khi có refresh
  token (client). `useToast` dùng `ref` module-level nhưng chỉ được gọi ở trang client-only (checkout).
- `ProductDetailPage.vue` gọi `refreshProduct()` trong `onMounted`: đây là cách cập nhật giá/tồn kho
  sau khi HTML có thể đã được cache (trình duyệt `max-age=60`, Docker `swr` 300s). **Giữ nguyên.**
- `HomePage.vue` và `ProductListPage.vue` tải dữ liệu trong `onMounted`, nên HTML SSR của `/` và
  `/products` chỉ có khung trang và metadata, **không** có danh sách sản phẩm. Trang chi tiết sản phẩm,
  blog, collection lấy dữ liệu bằng `useAsyncData` nên SSR có nội dung. Chưa refactor trong đợt này.

## Ảnh và đường dẫn file

`resolveFileUrl`:

- URL tuyệt đối (`https://`, `//`), `data:`, `blob:` giữ nguyên.
- Đường dẫn tương đối (`/files/...`) được ghép với `NUXT_PUBLIC_FILE_BASE_URL`, nếu trống thì với
  origin của `NUXT_PUBLIC_API_BASE_URL` (khi là URL tuyệt đối). Docker với `/api` giữ hành vi cũ.

Rủi ro dữ liệu cũ: nội dung rich text (blog, mô tả sản phẩm) được TinyMCE lưu với URL ảnh tuyệt đối
theo domain lúc upload (`relative_urls: false`, `remove_script_host: false`). Nếu DB đang chứa
`https://thepocketshoes.store/files/...`, sau khi domain chính trỏ vào Worker các ảnh này sẽ 404 vì
Worker không phục vụ `/files`. Cần kiểm tra DB trước khi chuyển domain. Phương án (cần kiểm chứng
trên dashboard):

- Gắn Worker bằng **Workers Routes** (`thepocketshoes.store/*`) thay vì Custom Domain, và thêm route
  cụ thể hơn `thepocketshoes.store/files/*` không gắn Worker để request đi về origin (VM/BE hiện tại).
- Hoặc Redirect Rule `/files/*` sang domain BE.
- Hoặc migrate URL trong DB (thuộc phạm vi BE).

## Hạn mức Workers Free (theo tài liệu Cloudflare hiện hành)

| Hạn mức            | Free                                                     | Hiện trạng bản build                                                         |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Request/ngày       | 100.000 (request vào static assets miễn phí, không tính) | Chỉ HTML SSR, `robots.txt`, `sitemap.xml` và URL không khớp asset gọi Worker |
| CPU/request        | 10 ms                                                    | **Chưa đo trên Cloudflare**                                                  |
| Memory/isolate     | 128 MB                                                   | Chưa đo                                                                      |
| Subrequest/request | 50                                                       | SSR mỗi trang gọi 1-2 API                                                    |
| Kích thước Worker  | 64 MiB (uncompressed)                                    | 2.157 KiB, gzip 463 KiB (`wrangler deploy --dry-run`)                        |
| Startup time       | 1 s                                                      | Chưa đo                                                                      |
| Static assets      | 20.000 file/version, 25 MiB/file                         | 96 file                                                                      |

Tài liệu Cloudflare ghi SSR thường tốn 10-20 ms CPU, tức có thể vượt 10 ms của gói Free. Sau khi
deploy preview, đo CPU time trong Workers Logs (`observability.enabled = true` trong `wrangler.jsonc`)
cho `/`, `/products`, `/products/<slug>`, `/blogs/<slug>` trước khi chuyển domain. Nếu vượt, lỗi trả về
là 1102 (`exceededCpu`); khi đó cần gói Workers Paid hoặc giảm SSR.

## GitHub Actions

- `ci.yml` và `deploy.yml` (deploy VM sau khi "CI" thành công trên `dev`) **không đổi**.
- `ci-cloudflare.yml`: workflow riêng chạy `npm run build:cf` và `wrangler deploy --dry-run` trên PR và
  push `dev`. Tách riêng để lỗi build Cloudflare không chặn deploy VM.
- `deploy-cloudflare.yml`: **chỉ `workflow_dispatch`**, input `target`:
  - `preview`: `wrangler versions upload` (tạo version + preview URL, không đổi bản đang live).
  - `production`: `wrangler deploy`.

Cấu hình cần tạo trong GitHub (Settings → Environments), không ghi token vào repo:

| Environment             | Secrets                                         | Variables                                                                                                  |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `cloudflare-preview`    | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `NUXT_PUBLIC_API_BASE_URL`, `NUXT_PUBLIC_API_TIMEOUT`, `NUXT_PUBLIC_FILE_BASE_URL`, `NUXT_PUBLIC_SITE_URL` |
| `cloudflare-production` | như trên (nên bật Required reviewers)           | như trên, với domain production                                                                            |

API token tối thiểu (Cloudflare → My Profile → API Tokens → Custom token):

- Account → **Workers Scripts → Edit**, giới hạn đúng account.
- Chỉ khi Wrangler quản lý route/custom domain trong `wrangler.jsonc`: thêm Zone → **Workers Routes → Edit**
  cho zone `thepocketshoes.store`. Nếu gắn domain trên dashboard thì không cần quyền zone.

## Các bước deploy

### 1. Preview trên `*.workers.dev`

1. BE: bật CORS cho domain workers.dev theo mục CORS.
2. Tạo GitHub Environments, secrets, variables như trên.
3. Lần đầu: chạy workflow **Deploy Cloudflare** với `target = production` khi Worker chưa gắn domain
   nào; bản này chỉ public ở `https://thepocketshoes-frontend.<subdomain>.workers.dev`.
   (`wrangler versions upload` yêu cầu Worker đã tồn tại, cần kiểm chứng lần đầu.)
4. Các lần sau dùng `target = preview` để lấy preview URL cho từng version.
5. Kiểm tra trên URL workers.dev: trang chủ, `/products`, `/products/<slug>`, refresh trực tiếp URL
   lồng nhau, ảnh, `/robots.txt`, `/sitemap.xml`, `/admin/login`, refresh token, upload, log stream,
   checkout với dữ liệu thử (không tạo đơn thật trên BE production).
6. Đo CPU time trong Workers Logs.

### 2. Gắn domain production

1. Kiểm tra DB về URL ảnh tuyệt đối theo domain FE (mục Ảnh).
2. Đặt `NUXT_PUBLIC_SITE_URL=https://thepocketshoes.store` và URL BE thật trong `cloudflare-production`.
3. Chọn cách gắn:
   - **Custom Domain** (Workers → Settings → Domains & Routes): Cloudflare tự tạo DNS record và cert;
     phải xóa DNS record hiện có (A/CNAME) của hostname trước. Toàn bộ path đi vào Worker.
   - **Workers Routes** `thepocketshoes.store/*` trên DNS record proxied hiện có: giữ được origin VM
     cho các path loại trừ (ví dụ `/files/*`).
     Làm tương tự cho `www` hoặc tạo Redirect Rule `www` → apex.
4. Theo dõi lỗi và CPU; rollback bằng cách gỡ custom domain/route (DNS về VM) hoặc
   `wrangler rollback` về version trước.

### 3. Khi chính thức chuyển hosting

Để tránh một lần push deploy cả hai nơi:

1. Tắt trigger `workflow_run` trong `deploy.yml` (giữ `workflow_dispatch` một thời gian để rollback).
2. Nếu muốn tự động deploy Cloudflare, thêm trigger cho `deploy-cloudflare.yml` (ví dụ `workflow_run`
   sau "CI Cloudflare" trên `dev`) trong cùng PR đó.
3. Sau giai đoạn ổn định mới xóa Docker/Nginx khỏi luồng production.
