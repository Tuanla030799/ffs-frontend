import { ApiError } from '@/types/http'

// Thông báo tiếng Việt theo `code` của BE (danh mục mã: docs/API.md của backend). Các mã khách
// hay gặp như OUT_OF_STOCK, SKU_UNAVAILABLE, COUPON_* không có ở đây vì BE đã trả message tiếng
// Việt kèm chi tiết (tên sản phẩm, số tiền tối thiểu).
const ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: 'Yêu cầu không hợp lệ.',
  INVALID_REQUEST_BODY: 'Dữ liệu gửi lên không hợp lệ.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  CONFLICT: 'Dữ liệu bị trùng.',
  DUPLICATE_VALUE: 'Dữ liệu bị trùng.',
  CONCURRENT_UPDATE: 'Dữ liệu vừa được thay đổi bởi thao tác khác, vui lòng thử lại.',
  PAYLOAD_TOO_LARGE: 'Dữ liệu gửi lên quá lớn.',
  TOO_MANY_REQUESTS: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.',
  ACCESS_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
  SERVICE_UNAVAILABLE: 'Hệ thống đang bận, vui lòng thử lại sau.',
  INTERNAL_ERROR: 'Đã có lỗi xảy ra, vui lòng thử lại sau.',

  AUTH_REQUIRED: 'Vui lòng đăng nhập.',
  AUTH_TOKEN_INVALID: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  AUTH_REFRESH_TOKEN_INVALID: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  AUTH_REGISTRATION_DISABLED: 'Chức năng đăng ký tài khoản quản trị đang tắt.',
  ADMIN_USER_NOT_FOUND: 'Không tìm thấy tài khoản quản trị.',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng.',

  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm.',
  VARIANT_NOT_FOUND: 'Không tìm thấy biến thể.',
  SKU_NOT_FOUND: 'Không tìm thấy SKU.',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục.',
  BRAND_NOT_FOUND: 'Không tìm thấy thương hiệu.',
  SIZE_NOT_FOUND: 'Không tìm thấy size.',
  SIZE_INACTIVE: 'Size đang ngừng sử dụng.',
  DEFAULT_SIZE_NOT_CONFIGURED: 'Chưa cấu hình size mặc định.',
  COLOR_NOT_FOUND: 'Không tìm thấy màu.',
  COLOR_INACTIVE: 'Màu đang ngừng sử dụng.',
  SLUG_ALREADY_EXISTS: 'Slug đã tồn tại.',
  SKU_CODE_ALREADY_EXISTS: 'Mã SKU đã tồn tại.',
  SIZE_ALREADY_EXISTS: 'Size đã tồn tại.',
  COLOR_ALREADY_EXISTS: 'Màu đã tồn tại.',

  BLOG_POST_NOT_FOUND: 'Không tìm thấy bài viết.',
  COLLECTION_NOT_FOUND: 'Không tìm thấy bộ sưu tập.',
  BANNER_NOT_FOUND: 'Không tìm thấy banner.',
  SITE_PAGE_NOT_FOUND: 'Không tìm thấy trang nội dung.',
  FAQ_NOT_FOUND: 'Không tìm thấy câu hỏi.',

  FILE_NOT_FOUND: 'Không tìm thấy file.',
  FILE_UNAVAILABLE: 'File không còn sử dụng được.',
  FILE_EMPTY: 'File rỗng.',
  FILE_TYPE_NOT_SUPPORTED: 'Định dạng file không được hỗ trợ.',
  FILE_TOO_LARGE: 'File quá lớn.',
  IMAGE_TOO_LARGE: 'Ảnh có kích thước quá lớn.',
  IMAGE_CORRUPTED: 'Ảnh bị lỗi, không đọc được.',
  STORAGE_UNAVAILABLE: 'Kho lưu trữ file đang gặp sự cố, vui lòng thử lại sau.',
  SERVER_BUSY: 'Hệ thống đang bận, vui lòng thử lại sau.',

  CUSTOMER_NOT_FOUND: 'Không tìm thấy khách hàng.',
  PHONE_ALREADY_EXISTS: 'Số điện thoại đã được sử dụng.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng.',
  COUPON_CODE_ALREADY_EXISTS: 'Mã giảm giá đã tồn tại.',
}

interface FieldError {
  field?: unknown
  message?: unknown
}

// Lỗi validate: BE trả danh sách lỗi theo trường trong `errors`.
function validationMessage(details: unknown) {
  const errors = (details as { errors?: unknown } | undefined)?.errors
  if (!Array.isArray(errors) || !errors.length) return ''

  const fields = (errors as FieldError[])
    .map((item) => (typeof item.field === 'string' ? `${item.field}: ${item.message}` : ''))
    .filter(Boolean)
  return fields.length ? `Dữ liệu không hợp lệ (${fields.join('; ')}).` : ''
}

export function apiErrorMessage(error: ApiError) {
  if (error.code === 'VALIDATION_ERROR') {
    return validationMessage(error.details) || error.message || 'Dữ liệu không hợp lệ.'
  }
  return (error.code && ERROR_MESSAGES[error.code]) || error.message
}
