CREATE INDEX "deal_productId_idx" ON "deals" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "order_couponId_idx" ON "orders" USING btree ("couponId");--> statement-breakpoint
CREATE INDEX "review_productId_isApproved_idx" ON "reviews" USING btree ("productId","isApproved");