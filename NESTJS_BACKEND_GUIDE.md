# Hướng dẫn cấu trúc Backend NestJS kết nối MongoDB (Database: `sac_viet`)

Tài liệu này được soạn sẵn để khi bạn bắt đầu xây dựng Backend bằng **NestJS**, bạn chỉ cần copy các Schema và cấu hình sau là kết nối ngay với cơ sở dữ liệu đã tạo.

---

## 1. Cài đặt các gói trong NestJS

```bash
npm install @nestjs/mongoose mongoose bcrypt class-validator class-transformer @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/bcrypt @types/passport-jwt
```

---

## 2. Kết nối MongoDB trong `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EthnicModule } from './ethnic/ethnic.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sac_viet'),
    EthnicModule,
    ProductModule,
    UserModule,
    OrderModule,
  ],
})
export class AppModule {}
```

---

## 3. NestJS Mongoose Schemas (Khớp 100% với database)

### A. Ethnic Schema (`src/ethnic/schemas/ethnic.schema.ts`)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EthnicDocument = Ethnic & Document;

@Schema({ timestamps: true, collection: 'ethnics' })
export class Ethnic {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  altNames?: string;

  @Prop({ required: true, enum: ['bac', 'trung', 'nam'], index: true })
  region: string;

  @Prop({ required: true })
  population: number;

  @Prop({ required: true })
  languageFamily: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  blurb: string;

  @Prop({ required: true })
  detail: string;

  @Prop([String])
  culture: string[];
}

export const EthnicSchema = SchemaFactory.createForClass(Ethnic);
```

### B. Product Schema (`src/product/schemas/product.schema.ts`)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true, index: true })
  ethnicSlug: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  inStock: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
```

### C. User Schema (`src/user/schemas/user.schema.ts`)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop([String])
  savedEthnics: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
```

### D. Order Schema (`src/order/schemas/order.schema.ts`)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 1 })
  qty: number;

  @Prop()
  image?: string;

  @Prop()
  category?: string;
}

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  shippingFee: number;

  @Prop({ required: true })
  total: number;

  @Prop({ enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Prop()
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
```

---

## 4. Các Endpoints API gợi ý cần viết trong NestJS

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/ethnic` | Lấy danh sách 54 dân tộc (lọc `?region=...&q=...`) |
| `GET` | `/api/ethnic/:slug` | Chi tiết 1 dân tộc |
| `GET` | `/api/products` | Danh sách sản phẩm (lọc `?ethnicSlug=...`) |
| `POST` | `/api/auth/register` | Đăng ký tài khoản (băm password bcrypt) |
| `POST` | `/api/auth/login` | Đăng nhập trả về JWT token |
| `GET` | `/api/auth/me` | Lấy profile người dùng theo JWT |
| `POST` | `/api/orders` | Tạo đơn hàng mới từ giỏ hàng |
| `GET` | `/api/orders` | Xem lịch sử đơn hàng |

