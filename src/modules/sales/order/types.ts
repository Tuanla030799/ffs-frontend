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
  productName?: string
  skuCode?: string
  size?: string
  color?: string
  quantity: number
  price?: number
  subtotal?: number
}
export interface Order {
  id: string
  code?: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  shippingAddress?: string
  status: string
  paymentMethod?: string
  paymentStatus?: string
  shippingMethod?: string
  shippingStatus?: string
  trackingCode?: string
  totalAmount?: number
  createdAt?: string
  items?: OrderItem[]
}
export interface OrderStatusHistory {
  id: string
  status: string
  note?: string
  createdAt?: string
  createdBy?: string
}
