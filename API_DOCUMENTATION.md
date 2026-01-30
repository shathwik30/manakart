# Ecommerce API Documentation

## Overview

This API powers the Ecommerce platform. It follows a RESTful design.

- **Base URL**: `/api`
- **Response Format**: All API responses follow a unified structure.

### Standard Response

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;          // Present if success is true
  error?: string;    // Present if success is false
}
```

### Authentication

Authentication is handled via **HTTP-Only Cookies**.
- **Token Name**: `token` (JWT)
- **Session Name**: `session_id` (For guest carts)
- **Flow**:
  1. `POST /api/auth/send-otp` with email.
  2. `POST /api/auth/verify-otp` with email & OTP.
  3. Server sets `token` cookie.
  4. Subsequent requests to protected routes (e.g., Account, Checkout) automatically send the cookie.

---

## 1. Authentication Module

### Send OTP
Initiates login or signup. Rate limited to 1 request per minute.

- **Endpoint**: `POST /api/auth/send-otp`
- **Public**: Yes
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": { "message": "OTP sent successfully" }
  }
  ```

### Verify OTP
Verifies the OTP and logs the user in. If the user is new, creates an account (Name & Phone required).

- **Endpoint**: `POST /api/auth/verify-otp`
- **Public**: Yes
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "name": "John Doe",  // Required for NEW users only
    "phone": "9876543210" // Required for NEW users only
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "message": "Logged in successfully",
      "user": {
        "id": "cuid...",
        "email": "user@example.com",
        "role": "USER"
      },
      "isNewUser": false
    }
  }
  ```

### Get Current User
Fetches the currently logged-in user's profile.

- **Endpoint**: `GET /api/auth/me`
- **Protected**: Yes (Requires Cookie)
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "user": { ... } // Full user object
    }
  }
  ```

### Logout
Clears the auth cookie.

- **Endpoint**: `POST /api/auth/logout`

---

## 2. Products & Shopping

### Get Products
List products with filtering.

- **Endpoint**: `GET /api/products`
- **Query Params**:
  - `category`: Filter by category slug (optional)
  - `active`: `true` (default) or `false`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "products": [
        {
          "id": "...",
          "title": "Classic Shirt",
          "slug": "classic-shirt",
          "basePrice": 1299,
          "availableSizes": ["S", "M", "L"],
          "stockPerSize": { "S": 10, "M": 5, "L": 0 },
          "images": ["url1", "url2"]
        }
      ]
    }
  }
  ```

### Get Product Details
- **Endpoint**: `GET /api/products/[id]`

### Get Outfits (Bundles)
List curated outfits.

- **Endpoint**: `GET /api/outfits`
- **Query Params**:
  - `type`: `GENTLEMEN` | `LADY` | `COUPLE`
  - `featured`: `true` | `false`
- **Response**: Returns outfits with nested `items` (products).

---

## 3. Cart & Checkout Flow

### Get Cart
Fetches the user's cart. Works for guests (via `session_id` cookie) and logged-in users.

- **Endpoint**: `GET /api/cart`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "cart": { "id": "...", "subtotal": 2500, "itemCount": 2 },
      "items": [
        {
          "id": "item_id",
          "type": "product",
          "product": { ... },
          "selectedSizes": { "size": "M" },
          "quantity": 1,
          "price": 1299
        },
        {
          "id": "bundle_id",
          "type": "outfit",
          "outfit": { ... },
          "selectedSizes": { "prod_id_1": "M", "prod_id_2": "L" }, // Map of product ID to size
          "quantity": 1,
          "price": 4999
        }
      ]
    }
  }
  ```

### Add to Cart
Adds a product OR an outfit to the cart. automatically merges quantities if item exists.

- **Endpoint**: `POST /api/cart/add`
- **Body for Product**:
  ```json
  {
    "productId": "prod_123",
    "quantity": 1,
    "selectedSizes": { "size": "M" } // Note the structure
  }
  ```
- **Body for Outfit**:
  ```json
  {
    "outfitId": "outfit_123",
    "isBundle": true,
    "quantity": 1,
    "selectedSizes": {
      "prod_id_1": "M",
      "prod_id_2": "L"
    }
  }
  ```

### Initialize Checkout
Validates cart stock and address before payment.

- **Endpoint**: `POST /api/checkout/init`
- **Body**:
  ```json
  {
    "address": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9999999999",
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    // OR
    "savedAddressId": "addr_123" // For logged-in users
  }
  ```
- **Response**: Returns `checkoutSession` with final totals (including delivery charge).

### Create Payment (Razorpay)
Creates an order on Razorpay.

- **Endpoint**: `POST /api/checkout/create-payment`
- **Body**:
  ```json
  {
    "cartId": "...",
    "address": { ... }, // Pass back the verified address
    "total": 129900,    // Amount in Paise
    "couponCode": "WELCOME10" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "razorpayOrderId": "order_rcptid_11",
      "amount": 129900,
      "currency": "INR",
      "checkoutData": { ... } // PAYLOAD TO SEND TO VERIFY ENDPOINT
    }
  }
  ```

### Verify Payment (Complete Order)
Call this after Razorpay success on frontend. This creates the actual order in DB.

- **Endpoint**: `POST /api/checkout/verify`
- **Body**:
  ```json
  {
    "razorpayOrderId": "...",
    "razorpayPaymentId": "...",
    "razorpaySignature": "...",
    "checkoutData": { ... } // The object received from create-payment
  }
  ```

---

## 4. Account Management

- `GET /api/account/profile`: Get user profile.
- `PATCH /api/account/profile`: Update name/phone.
- `GET /api/account/addresses`: List saved addresses.
- `POST /api/account/addresses`: Add new address.
- `GET /api/account/orders`: List past orders.

---

## 5. Admin API
**Headers**: Requires Admin Token.

### Manage Products
- `GET /api/admin/products`: List products with pagination (`page`, `limit`).
- `POST /api/admin/products`: Create product.
  ```json
  {
    "title": "New Shirt",
    "category": "shirts",
    "basePrice": 1500,
    "availableSizes": ["S", "M"],
    "stockPerSize": { "S": 10, "M": 10 },
    "images": ["..."]
  }
  ```

### Other Admin Resources
- `GET /api/admin/orders`: View all orders.
- `GET /api/admin/analytics`: View sales stats.
- `api/admin/coupons`: Manage discount codes.
- `api/admin/hero`: Manage homepage hero slider.
