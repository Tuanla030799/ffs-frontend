# Deploy FE lên Cloudflare Workers

FE (Nuxt SSR) chạy trên Cloudflare Workers. BE, database và xử lý ảnh chạy riêng trên Heroku;
Worker chỉ render HTML và phục vụ static assets.

## Hạ tầng production hiện tại

| Thành phần         | Cấu hình                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| FE                 | Worker `thepocketshoes-frontend`, Custom Domain `thepocketshoes.store`                            |
| URL test           | `https://thepocketshoes-frontend.thepocketshoes.workers.dev`                                      |
| `www`              | DNS `A www 192.0.2.1` (Proxied) + Redirect Rule 301 sang `https://thepocketshoes.store`, giữ path |
| BE                 | Heroku, FE gọi qua `NUXT_PUBLIC_API_BASE_URL`                                                     |
| VM `34.126.106.86` | Ngừng dùng. `deploy.yml` chỉ còn chạy tay, giữ lại để có thể quay về VM                           |
| Nhánh              | `dev`: phát triển. `dev_deploy_cloudflare`: nhánh release, deploy Cloudflare từ nhánh này         |

## Kiến trúc

| Thành phần                                 | Docker/VM (cũ, dự phòng)        | Cloudflare Workers                                            |
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
npm run deploy:cf   # wrangler deploy (cần đăng nhập/CLOUDFLARE_API_TOKEN), thay bản đang chạy production
```

Phát triển hằng ngày vẫn dùng `npm run dev`.

## Biến môi trường

Tất cả đều là giá trị **public** (được gửi xuống trình duyệt qua runtime config). Không đưa
secrets vào `NUXT_PUBLIC_*`.

| Biến                        | Ví dụ production                  | Ghi chú                                                                                                                                                                        |
| --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NUXT_PUBLIC_API_BASE_URL`  | `https://<app>.herokuapp.com/api` | Bắt buộc là URL HTTPS đầy đủ, gồm API root. Service chỉ khai báo `/products`, `/admin/...`.                                                                                    |
| `NUXT_PUBLIC_API_TIMEOUT`   | `15000`                           | Timeout Axios (ms).                                                                                                                                                            |
| `NUXT_PUBLIC_FILE_BASE_URL` | để trống hoặc origin kho ảnh      | Origin phục vụ `/files/...`. Để trống thì dùng origin của `NUXT_PUBLIC_API_BASE_URL`. Không thêm `/files` (nếu lỡ thêm, `resolveFileUrl` vẫn không ghép trùng `/files/files`). |
| `NUXT_PUBLIC_SITE_URL`      | `https://thepocketshoes.store`    | Domain FE cho canonical, `og:url`, `og:image`, `robots.txt`, `sitemap.xml`.                                                                                                    |

Cách giá trị đến Worker:

1. **Lúc build**: `nuxt.config.ts` đọc `process.env` và bake làm giá trị mặc định. `og:image`
   mặc định trong `app.head` **chỉ** lấy từ build, nên `NUXT_PUBLIC_SITE_URL` phải đúng lúc build.
2. **Lúc chạy**: Nitro đọc Worker vars mỗi request (`useRuntimeConfig(event)`), ghi đè giá trị build.
   Đã kiểm chứng bằng `wrangler dev`: build với một URL, `.dev.vars` với URL khác, robots/sitemap/
   canonical và các call API SSR dùng giá trị của `.dev.vars`.

Workflow `deploy-cloudflare.yml` dùng cùng một nguồn (GitHub Environment variables) cho cả hai bước.

Lưu ý: lúc SSR, `src/config/env.ts` đọc theo thứ tự: runtime config → Worker vars (`process.env`) →
giá trị lúc build (`vite.define`, `__BUILD_PUBLIC_ENV__`). Vì vậy nếu Worker lỡ mất vars (ví dụ
chạy `wrangler deploy` không kèm `--var`), SSR vẫn dùng URL BE lúc build. Vẫn nên deploy qua workflow
để vars trên dashboard khớp với build.

Preview local: tạo `.dev.vars` (đã gitignore) cùng format `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=https://<app>.herokuapp.com/api
NUXT_PUBLIC_API_TIMEOUT=15000
NUXT_PUBLIC_FILE_BASE_URL=
NUXT_PUBLIC_SITE_URL=https://thepocketshoes.store
```

## Yêu cầu CORS ở BE

Khi FE và BE khác origin, trình duyệt gửi preflight. BE cần (chỉnh ở repo BE, không thuộc repo này):

- `Access-Control-Allow-Origin`: liệt kê chính xác domain FE: `https://thepocketshoes.store`,
  `https://thepocketshoes-frontend.thepocketshoes.workers.dev` và các preview URL dạng
  `https://<version-prefix>-thepocketshoes-frontend.thepocketshoes.workers.dev` nếu dùng để test admin.
  `www` luôn redirect về apex nên không cần, nhưng thêm cũng không sao. Không dùng `*` cho route admin.
- `Access-Control-Allow-Methods`: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- `Access-Control-Allow-Headers`: `Authorization, Content-Type, Accept, X-Requested-With`.
- Trả `204/200` cho `OPTIONS` (gồm `/api/admin/auth/login`, `/api/admin/auth/refresh`,
  `/api/admin/files/upload`, `/api/admin/logs/stream`, `/api/orders`).
- Không cần `Access-Control-Allow-Credentials`: FE gửi token qua header `Authorization`,
  không dùng cookie (`withCredentials` không bật).
- `Vary: Origin` nếu BE trả origin động.
- `/files/*` phục vụ qua `<img>` nên không cần CORS, trừ khi sau này đọc ảnh bằng `fetch`/canvas.
- Log stream (`/api/admin/logs/stream`, SSE qua `fetch`): trên Heroku, router cắt kết nối nếu không có
  dữ liệu trong 55 giây, nên BE cần gửi heartbeat định kỳ.
- Upload: giới hạn kích thước body cấu hình ở BE (Nginx cũ đặt `client_max_body_size 20m`).

## Cache và SSR

- `swr: 300` của Nitro dùng storage `cache`, trên Workers mặc định là memory của từng isolate: không
  bền, không chia sẻ giữa isolate/PoP, có thể bị dọn bất cứ lúc nào. Vì vậy bản Cloudflare **tắt
  `swr`** và chỉ giữ header `cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400`
  cho `/products/**`, `/blogs/**`, `/collections/**`, `/brands/**`. Bản Docker vẫn bật `swr` như cũ.
- Không dùng KV làm cache: gói Free giới hạn 1.000 lượt ghi/ngày, mỗi URL (kể cả biến thể query
  `/products?...`) sẽ ghi lại mỗi 5 phút nên vượt hạn mức nhanh.
- **Edge cache HTML** (`server/plugins/edge-cache.ts`): trên Workers, HTML SSR của `/`, `/products`,
  `/products/<slug>`, `/collections[/<slug>]`, `/brands[/<slug>]`, `/blogs[/<slug>]` được lưu vào
  Cache API (`caches.default`) của từng data center trong **5 phút** để giảm CPU (render SSR đo được
  P50 ~67 ms, vượt 10 ms của gói Free). Header `x-edge-cache: HIT|MISS` cho biết trạng thái.
  - Không cache: URL có query (bộ lọc, phân trang), request có `Authorization`, response khác 200,
    response có `set-cookie`, và trang có lỗi khi lấy dữ liệu SSR (đánh dấu bởi
    `src/nuxt-plugins/edge-cache-guard.server.ts`), để lỗi BE tạm thời không bị giữ 5 phút.
  - Không áp dụng cho `/admin/**`, `/checkout`, `/order-success` (client-only).
  - Cache API không hoạt động trên `*.workers.dev`, chỉ có tác dụng trên `thepocketshoes.store`.
  - Hệ quả: sửa sản phẩm/bài viết trong admin có thể hiện chậm tối đa 5 phút. Giá và tồn kho ở trang
    chi tiết vẫn cập nhật vì trang gọi lại API sau khi tải.
  - Đổi thời gian: `EDGE_CACHE_TTL_SECONDS`. Tắt: xoá plugin hoặc để `CACHEABLE_PATHS` rỗng.
- `/about` và `/faq` render SSR như các trang public khác (nội dung do admin soạn ở BE), không
  render sẵn lúc build; HTML được cache edge như trên.
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

Rủi ro cần xử lý ở BE:

- **Ổ đĩa dyno Heroku là tạm thời**: file upload lưu trên dyno mất khi dyno khởi động lại (ít nhất
  mỗi ngày và mỗi lần deploy). Ảnh cần nằm ở object storage (R2, S3, Cloudinary...).
- **URL ảnh cũ trong rich text**: TinyMCE lưu URL ảnh tuyệt đối theo domain lúc upload
  (`relative_urls: false`, `remove_script_host: false`). Nội dung chứa
  `https://thepocketshoes.store/files/...` sẽ 404 vì domain giờ trỏ vào Worker, Worker không phục vụ
  `/files`. Xử lý bằng cách migrate URL trong DB, hoặc Redirect Rule `/files/*` sang nơi lưu ảnh mới.

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

Tài liệu Cloudflare ghi SSR thường tốn 10-20 ms CPU, tức có thể vượt 10 ms của gói Free. Theo dõi
CPU time trong Workers Logs (`observability.enabled = true` trong `wrangler.jsonc`) cho `/`, `/products`,
`/products/<slug>`, `/blogs/<slug>`. Nếu vượt, lỗi trả về là 1102 (`exceededCpu`); khi đó cần gói
Workers Paid hoặc giảm SSR. Dyno Heroku Eco ngủ sau 30 phút không có request; thời gian chờ BE thức
không tính vào CPU của Worker nhưng có thể chạm timeout 15 giây của Axios.

## GitHub Actions

- `ci.yml`: lint, typecheck, build Node và Docker trên PR và push `dev`.
- `ci-cloudflare.yml`: `npm run build:cf` và `wrangler deploy --dry-run` trên PR và push `dev`,
  `dev_deploy_cloudflare`. Không cần credentials.
- `deploy.yml`: deploy VM, **chỉ chạy tay** (đã bỏ trigger tự động sau khi ngừng dùng VM).
- `deploy-cloudflare.yml`: **chỉ chạy tay** (_Actions → Deploy Cloudflare → Run workflow_, chọn nhánh
  `dev_deploy_cloudflare`), input `target`:
  - `preview`: `wrangler versions upload` (tạo version + preview URL, không đổi bản đang chạy).
  - `production`: `wrangler deploy`.

Cấu hình cần tạo trong GitHub (Settings → Environments), không ghi token vào repo:

| Environment             | Secrets                                         | Variables                                                                                                  |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `cloudflare-preview`    | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `NUXT_PUBLIC_API_BASE_URL`, `NUXT_PUBLIC_API_TIMEOUT`, `NUXT_PUBLIC_FILE_BASE_URL`, `NUXT_PUBLIC_SITE_URL` |
| `cloudflare-production` | như trên (nên bật Required reviewers)           | như trên                                                                                                   |

API token tối thiểu (Cloudflare → My Profile → API Tokens → Custom token):

- Account → **Workers Scripts → Edit**, giới hạn đúng account.
- Không cần quyền zone vì Custom Domain được gắn trên dashboard, không khai báo trong `wrangler.jsonc`.

## Quy trình phát hành

1. Phát triển trên `dev` (PR vào `dev`, CI kiểm tra cả build Node lẫn build Cloudflare).
2. Phát hành: merge `dev` vào `dev_deploy_cloudflare` rồi push.
3. Deploy, chọn một cách:
   - Máy local (đã `npx wrangler login`):

     ```bash
     git checkout dev_deploy_cloudflare && git pull && npm ci
     export NUXT_PUBLIC_API_BASE_URL=https://<app>.herokuapp.com/api
     export NUXT_PUBLIC_API_TIMEOUT=15000
     export NUXT_PUBLIC_FILE_BASE_URL=
     export NUXT_PUBLIC_SITE_URL=https://thepocketshoes.store
     npm run build:cf
     npx wrangler deploy \
       --var NUXT_PUBLIC_API_BASE_URL:$NUXT_PUBLIC_API_BASE_URL \
       --var NUXT_PUBLIC_API_TIMEOUT:$NUXT_PUBLIC_API_TIMEOUT \
       --var NUXT_PUBLIC_FILE_BASE_URL:$NUXT_PUBLIC_FILE_BASE_URL \
       --var NUXT_PUBLIC_SITE_URL:$NUXT_PUBLIC_SITE_URL
     ```

   - GitHub Actions: _Deploy Cloudflare → Run workflow_, nhánh `dev_deploy_cloudflare`. Có thể chạy
     `preview` trước để kiểm tra trên preview URL rồi mới chạy `production`.

4. Kiểm tra `https://thepocketshoes.store`: trang chủ, `/products/<slug>` (xem source có nội dung và
   metadata), ảnh, `/robots.txt`, `/sitemap.xml`, admin login, upload. Theo dõi Workers Logs.

## Rollback

- Lỗi code: `npx wrangler deployments list` rồi `npx wrangler rollback <version-id>`, hoặc chọn version
  cũ trong dashboard (Worker → _Deployments_).
- Quay về VM: dựng VM, cập nhật secrets `VM_*`, chạy tay `deploy.yml`, gỡ Custom Domain của Worker và
  tạo lại bản ghi DNS `A thepocketshoes.store` trỏ về VM (Proxied). Khi quay lại, thay `ssh-keyscan`
  trong `deploy.yml` bằng host key cố định lưu trong secret.
