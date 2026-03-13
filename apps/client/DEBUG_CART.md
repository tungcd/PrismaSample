# Debug Cart Issue

## Vấn đề

API đang gọi `/cart/items/undefined` - `item.id` là undefined

## Các khả năng

### 1. Backend API chưa trả về đúng structure

Backend `/cart` endpoint có thể không trả về `id` cho cart items.

**Cần kiểm tra:**

- Reload trang cart và xem Console log
- Kiểm tra Network tab response của `/cart` endpoint
- Xem structure thực tế của cart items

### 2. Backend sử dụng field name khác

Có thể backend dùng:

- `cartItemId` thay vì `id`
- `_id` (nếu dùng MongoDB)
- Hoặc không có ID riêng cho cart items

### 3. Backend API chưa chạy hoặc chưa implement

Kiểm tra:

```bash
# Vào folder backend
cd apps/server

# Check nếu server đang chạy
npm run dev
```

## Solution tạm thời

Nếu backend dùng `productId` thay vì cart item `id`, có thể sửa:

1. Thay đổi cart.api.ts để dùng productId
2. Hoặc sửa backend để trả về ID đúng cho cart items

## Next Steps

1. Check console log để xem cart structure
2. Check backend Prisma schema cho CartItem model
3. Check backend controller trả về cart như thế nào
