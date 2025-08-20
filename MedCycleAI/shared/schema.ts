import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for healthcare entities
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  pinCode: varchar("pin_code", { length: 10 }).notNull(),
  userType: varchar("user_type", { length: 50 }).notNull(), // hospital, pharmacy, medical_shop, admin
  govIdNumber: varchar("gov_id_number", { length: 100 }),
  aadhaarNumber: varchar("aadhaar_number", { length: 12 }),
  isVerified: boolean("is_verified").default(false),
  role: varchar("role", { length: 50 }).default("pending"), // pending, sender_receiver, rejected, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medicines table for listings
export const medicines = pgTable("medicines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  batchNumber: varchar("batch_number", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  isSealed: boolean("is_sealed").default(true),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  aiVerificationData: jsonb("ai_verification_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart table for shopping cart items
export const cart = pgTable("cart", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table for completed purchases
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // pending, paid, failed
  paymentId: varchar("payment_id", { length: 255 }),
  deliveryStatus: varchar("delivery_status", { length: 50 }).default("pending"), // pending, in_transit, delivered
  deliveryAddress: text("delivery_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table for individual items in orders
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  medicineId: varchar("medicine_id").notNull().references(() => medicines.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentMedicines: many(medicines),
  orders: many(orders),
  cartItems: many(cart),
}));

export const medicinesRelations = relations(medicines, ({ one, many }) => ({
  sender: one(users, {
    fields: [medicines.senderId],
    references: [users.id],
  }),
  cartItems: many(cart),
  orderItems: many(orderItems),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(users, {
    fields: [cart.userId],
    references: [users.id],
  }),
  medicine: one(medicines, {
    fields: [cart.medicineId],
    references: [medicines.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  medicine: one(medicines, {
    fields: [orderItems.medicineId],
    references: [medicines.id],
  }),
  sender: one(users, {
    fields: [orderItems.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  costPerUnit: z.coerce.string(),
  expiryDate: z.coerce.date(),
});

export const insertCartSchema = createInsertSchema(cart).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Cart = typeof cart.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
