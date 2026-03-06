CREATE TYPE "public"."DiscountType" AS ENUM('FLAT', 'PERCENTAGE');--> statement-breakpoint
CREATE TYPE "public"."OrderStatus" AS ENUM('CREATED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"street" text NOT NULL,
	"city" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"country" varchar(100) DEFAULT 'India' NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"logo" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"cartId" varchar(36) NOT NULL,
	"productId" varchar(36) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"priceSnapshot" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36),
	"sessionId" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carts_userId_unique" UNIQUE("userId"),
	CONSTRAINT "carts_sessionId_unique" UNIQUE("sessionId")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"icon" varchar(255),
	"image" text,
	"showInNav" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"parentId" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"discountType" "DiscountType" NOT NULL,
	"value" integer NOT NULL,
	"minOrderValue" integer,
	"maxDiscount" integer,
	"usageLimit" integer,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"productId" varchar(36) NOT NULL,
	"dealPrice" integer NOT NULL,
	"startsAt" timestamp NOT NULL,
	"endsAt" timestamp NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_content" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"subtitle" text,
	"image" text NOT NULL,
	"ctaText" varchar(255),
	"ctaLink" varchar(500),
	"isActive" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_sections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"config" jsonb,
	"position" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"orderId" varchar(36) NOT NULL,
	"productId" varchar(36) NOT NULL,
	"productTitle" varchar(500) NOT NULL,
	"size" varchar(50),
	"quantity" integer NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"userId" varchar(36) NOT NULL,
	"subtotal" integer NOT NULL,
	"deliveryCharge" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"couponId" varchar(36),
	"paymentStatus" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"orderStatus" "OrderStatus" DEFAULT 'CREATED' NOT NULL,
	"paymentId" varchar(255),
	"paymentMethod" varchar(50),
	"addressSnapshot" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "OTP" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"basePrice" integer NOT NULL,
	"comparePrice" integer,
	"images" text[] DEFAULT '{}' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" varchar(100),
	"specifications" jsonb,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"deletedAt" timestamp,
	"categoryId" varchar(36),
	"brandId" varchar(36),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"productId" varchar(36) NOT NULL,
	"userId" varchar(36) NOT NULL,
	"userName" varchar(255) NOT NULL,
	"title" varchar(500),
	"rating" integer NOT NULL,
	"comment" text,
	"media" text[] DEFAULT '{}' NOT NULL,
	"adminReply" text,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"isApproved" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"role" "Role" DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_carts_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_categories_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_couponId_coupons_id_fk" FOREIGN KEY ("couponId") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_brands_id_fk" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "address_userId_idx" ON "addresses" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cartId_productId_key" ON "cart_items" USING btree ("cartId","productId");--> statement-breakpoint
CREATE INDEX "cart_items_cartId_idx" ON "cart_items" USING btree ("cartId");--> statement-breakpoint
CREATE INDEX "category_parentId_idx" ON "categories" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "category_showInNav_idx" ON "categories" USING btree ("showInNav");--> statement-breakpoint
CREATE INDEX "deal_isActive_idx" ON "deals" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "deal_endsAt_idx" ON "deals" USING btree ("endsAt");--> statement-breakpoint
CREATE INDEX "homepage_sections_isActive_idx" ON "homepage_sections" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "order_items_orderId_idx" ON "order_items" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "order_userId_idx" ON "orders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_orderStatus_idx" ON "orders" USING btree ("orderStatus");--> statement-breakpoint
CREATE INDEX "otp_email_idx" ON "OTP" USING btree ("email");--> statement-breakpoint
CREATE INDEX "product_categoryId_idx" ON "products" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "product_brandId_idx" ON "products" USING btree ("brandId");--> statement-breakpoint
CREATE INDEX "product_isActive_idx" ON "products" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "product_deletedAt_idx" ON "products" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "product_isFeatured_idx" ON "products" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "review_productId_idx" ON "reviews" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "review_userId_idx" ON "reviews" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "review_isFeatured_idx" ON "reviews" USING btree ("isFeatured");