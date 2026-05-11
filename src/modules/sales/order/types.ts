export interface OrderItemPayload {
  skuId: string
  quantity: number
}
export interface CreateOrderPayload {
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  shippingAddress: string
  note?: string
  couponCode?: string
  paymentMethod?: string
  shippingMethod?: string
  shippingFee: number
  items: OrderItemPayload[]
}
export interface OrderItem {
  id?: string
  orderId?: string
  skuId?: string
  productName?: string
  skuCode?: string
  variantName?: string
  size?: string
  color?: string
  unitPrice?: number
  quantity: number
  lineTotal?: number
  price?: number
  subtotal?: number
}
export interface Order {
  id: string
  orderCode?: string
  code?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  shippingAddress?: string
  note?: string
  status: string
  couponId?: string | null
  customerId?: string | null
  paymentMethod?: string
  paymentStatus?: string
  paidAt?: string | null
  shippingMethod?: string
  shippingStatus?: string
  trackingCode?: string
  internalNote?: string
  subtotalAmount?: number
  discountAmount?: number
  shippingFee?: number
  totalAmount?: number
  createdAt?: string
  items?: OrderItem[]
}
export interface OrderDetail {
  order: Order
  items: OrderItem[]
}
export interface OrderStatusHistory {
  id: string
  orderId?: string
  oldStatus?: string | null
  newStatus?: string
  status?: string
  note?: string
  createdAt?: string
  createdBy?: string
}
