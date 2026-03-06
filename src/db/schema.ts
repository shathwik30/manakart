import { pgTable, pgEnum, varchar, text, integer, boolean, timestamp, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@/db/utils";

// ─── Enums ───

export const roleEnum = pgEnum("Role", ["USER", "ADMIN"]);
export const paymentStatusEnum = pgEnum("PaymentStatus", ["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const orderStatusEnum = pgEnum("OrderStatus", ["CREATED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);
export const discountTypeEnum = pgEnum("DiscountType", ["FLAT", "PERCENTAGE"]);

// ─── Users ───

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: roleEnum().default("USER").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  addresses: many(addresses),
  orders: many(orders),
  cart: one(carts),
  reviews: many(reviews),
}));

// ─── OTPs ───

export const otps = pgTable("OTP", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: boolean("verified").default(false).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("otp_email_idx").on(table.email),
]);

// ─── Addresses ───

export const addresses = pgTable("addresses", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  street: text("street").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  country: varchar("country", { length: 100 }).default("India").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("address_userId_idx").on(table.userId),
]);

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

// ─── Categories (Hierarchical) ───

export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 255 }),
  image: text("image"),
  showInNav: boolean("showInNav").default(false).notNull(),
  position: integer("position").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  parentId: varchar("parentId", { length: 36 }).references((): any => categories.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("category_parentId_idx").on(table.parentId),
  index("category_showInNav_idx").on(table.showInNav),
]);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: "CategoryTree" }),
  children: many(categories, { relationName: "CategoryTree" }),
  products: many(products),
}));

// ─── Brands ───

export const brands = pgTable("brands", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logo: text("logo"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

// ─── Products ───

export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  description: text("description"),
  basePrice: integer("basePrice").notNull(),
  comparePrice: integer("comparePrice"),
  images: text("images").array().notNull().default([]),
  stock: integer("stock").default(0).notNull(),
  sku: varchar("sku", { length: 100 }),
  specifications: jsonb("specifications"),
  hasVariants: boolean("hasVariants").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  deletedAt: timestamp("deletedAt"),
  categoryId: varchar("categoryId", { length: 36 }).references(() => categories.id, { onDelete: "set null" }),
  brandId: varchar("brandId", { length: 36 }).references(() => brands.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("product_categoryId_idx").on(table.categoryId),
  index("product_brandId_idx").on(table.brandId),
  index("product_isActive_idx").on(table.isActive),
  index("product_deletedAt_idx").on(table.deletedAt),
  index("product_isFeatured_idx").on(table.isFeatured),
]);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  options: many(productOptions),
  variants: many(productVariants),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  deals: many(deals),
}));

// ─── Product Options ───

export const productOptions = pgTable("product_options", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("product_options_productId_idx").on(table.productId),
]);

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, { fields: [productOptions.productId], references: [products.id] }),
  values: many(productOptionValues),
}));

// ─── Product Option Values ───

export const productOptionValues = pgTable("product_option_values", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  optionId: varchar("optionId", { length: 36 }).notNull().references(() => productOptions.id, { onDelete: "cascade" }),
  value: varchar("value", { length: 255 }).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("product_option_values_optionId_idx").on(table.optionId),
]);

export const productOptionValuesRelations = relations(productOptionValues, ({ one }) => ({
  option: one(productOptions, { fields: [productOptionValues.optionId], references: [productOptions.id] }),
}));

// ─── Product Variants ───

export const productVariants = pgTable("product_variants", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }),
  price: integer("price").notNull(),
  comparePrice: integer("comparePrice"),
  stock: integer("stock").default(0).notNull(),
  images: text("images").array().notNull().default([]),
  optionValues: jsonb("optionValues").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("product_variants_productId_idx").on(table.productId),
  index("product_variants_sku_idx").on(table.sku),
]);

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

// ─── Carts ───

export const carts = pgTable("carts", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  userId: varchar("userId", { length: 36 }).unique().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("sessionId", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

// ─── Cart Items ───

export const cartItems = pgTable("cart_items", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  cartId: varchar("cartId", { length: 36 }).notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: varchar("productId", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: varchar("variantId", { length: 36 }).references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  priceSnapshot: integer("priceSnapshot").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("cart_items_cartId_idx").on(table.cartId),
]);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

// ─── Orders ───

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  userId: varchar("userId", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  subtotal: integer("subtotal").notNull(),
  deliveryCharge: integer("deliveryCharge").default(0).notNull(),
  discount: integer("discount").default(0).notNull(),
  total: integer("total").notNull(),
  couponId: varchar("couponId", { length: 36 }).references(() => coupons.id, { onDelete: "set null" }),
  paymentStatus: paymentStatusEnum().default("PENDING").notNull(),
  orderStatus: orderStatusEnum().default("CREATED").notNull(),
  paymentId: varchar("paymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  addressSnapshot: jsonb("addressSnapshot").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("order_userId_idx").on(table.userId),
  index("order_orderStatus_idx").on(table.orderStatus),
  index("order_couponId_idx").on(table.couponId),
]);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  coupon: one(coupons, { fields: [orders.couponId], references: [coupons.id] }),
  items: many(orderItems),
}));

// ─── Order Items ───

export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  orderId: varchar("orderId", { length: 36 }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("productId", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  productTitle: varchar("productTitle", { length: 500 }).notNull(),
  size: varchar("size", { length: 50 }),
  variantId: varchar("variantId", { length: 36 }),
  variantSnapshot: jsonb("variantSnapshot"),
  productImage: text("productImage"),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
}, (table) => [
  index("order_items_orderId_idx").on(table.orderId),
]);

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// ─── Coupons ───

export const coupons = pgTable("coupons", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: discountTypeEnum().notNull(),
  value: integer("value").notNull(),
  minOrderValue: integer("minOrderValue"),
  maxDiscount: integer("maxDiscount"),
  usageLimit: integer("usageLimit"),
  usedCount: integer("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const couponsRelations = relations(coupons, ({ many }) => ({
  orders: many(orders),
}));

// ─── Reviews ───

export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("userName", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  media: text("media").array().notNull().default([]),
  adminReply: text("adminReply"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("review_productId_idx").on(table.productId),
  index("review_userId_idx").on(table.userId),
  index("review_isFeatured_idx").on(table.isFeatured),
  index("review_productId_isApproved_idx").on(table.productId, table.isApproved),
]);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

// ─── Deals ───

export const deals = pgTable("deals", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  productId: varchar("productId", { length: 36 }).notNull().references(() => products.id, { onDelete: "cascade" }),
  dealPrice: integer("dealPrice").notNull(),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("deal_isActive_idx").on(table.isActive),
  index("deal_endsAt_idx").on(table.endsAt),
  index("deal_productId_idx").on(table.productId),
]);

export const dealsRelations = relations(deals, ({ one }) => ({
  product: one(products, { fields: [deals.productId], references: [products.id] }),
}));

// ─── Homepage Sections ───

export const homepageSections = pgTable("homepage_sections", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  config: jsonb("config"),
  position: integer("position").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("homepage_sections_isActive_idx").on(table.isActive),
]);

// ─── Hero Content ───

export const heroContents = pgTable("hero_content", {
  id: varchar("id", { length: 36 }).$defaultFn(createId).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  ctaText: varchar("ctaText", { length: 255 }),
  ctaLink: varchar("ctaLink", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
