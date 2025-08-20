import {
  users,
  medicines,
  cart,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type Medicine,
  type InsertMedicine,
  type Cart,
  type InsertCart,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getPendingUsers(): Promise<User[]>;
  approveUser(id: string, approvedBy: string): Promise<User>;
  rejectUser(id: string): Promise<User>;

  // Medicine operations
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  getMedicine(id: string): Promise<Medicine | undefined>;
  getMedicinesBySender(senderId: string): Promise<Medicine[]>;
  searchMedicines(filters: {
    name?: string;
    pinCode?: string;
    minExpiryMonths?: number;
    dosage?: string;
    minQuantity?: number;
    maxCost?: number;
  }): Promise<Medicine[]>;
  updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine>;
  getPendingMedicines(): Promise<Medicine[]>;
  approveMedicine(id: string, approvedBy: string): Promise<Medicine>;
  rejectMedicine(id: string): Promise<Medicine>;

  // Cart operations
  addToCart(cartItem: InsertCart): Promise<Cart>;
  getCartByUser(userId: string): Promise<Cart[]>;
  updateCartItem(id: string, quantity: number): Promise<Cart>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderPayment(id: string, paymentId: string, status: string): Promise<Order>;
  updateOrderDelivery(id: string, status: string): Promise<Order>;

  // Admin operations
  getSystemStats(): Promise<{
    totalUsers: number;
    pendingApprovals: number;
    totalMedicines: number;
    totalOrders: number;
  }>;
  getAllUsers(): Promise<User[]>;
  getAllMedicines(): Promise<Medicine[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db().select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db().insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db()
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPendingUsers(): Promise<User[]> {
    return await db()
      .select()
      .from(users)
      .where(eq(users.role, "pending"))
      .orderBy(desc(users.createdAt));
  }

  async approveUser(id: string, approvedBy: string): Promise<User> {
    const [user] = await db()
      .update(users)
      .set({ isVerified: true, role: "sender_receiver", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async rejectUser(id: string): Promise<User> {
    const [user] = await db()
      .update(users)
      .set({ role: "rejected", updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Medicine operations
  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const [medicine] = await db().insert(medicines).values(insertMedicine).returning();
    return medicine;
  }

  async getMedicine(id: string): Promise<Medicine | undefined> {
    const [medicine] = await db().select().from(medicines).where(eq(medicines.id, id));
    return medicine;
  }

  async getMedicinesBySender(senderId: string): Promise<Medicine[]> {
    return await db()
      .select()
      .from(medicines)
      .where(eq(medicines.senderId, senderId))
      .orderBy(desc(medicines.createdAt));
  }

  async searchMedicines(filters: {
    name?: string;
    pinCode?: string;
    minExpiryMonths?: number;
    dosage?: string;
    minQuantity?: number;
    maxCost?: number;
  }): Promise<Medicine[]> {
    let query = db()
      .select({
        id: medicines.id,
        senderId: medicines.senderId,
        name: medicines.name,
        company: medicines.company,
        expiryDate: medicines.expiryDate,
        batchNumber: medicines.batchNumber,
        quantity: medicines.quantity,
        costPerUnit: medicines.costPerUnit,
        imageUrl: medicines.imageUrl,
        isSealed: medicines.isSealed,
        isApproved: medicines.isApproved,
        approvedBy: medicines.approvedBy,
        aiVerificationData: medicines.aiVerificationData,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
        senderName: users.organizationName,
        senderPinCode: users.pinCode,
      })
      .from(medicines)
      .innerJoin(users, eq(medicines.senderId, users.id))
      .where(eq(medicines.isApproved, true));

    const conditions = [];

    if (filters.name) {
      conditions.push(like(medicines.name, `%${filters.name}%`));
    }

    if (filters.pinCode) {
      conditions.push(eq(users.pinCode, filters.pinCode));
    }

    if (filters.minExpiryMonths) {
      const minExpiryDate = new Date();
      minExpiryDate.setMonth(minExpiryDate.getMonth() + filters.minExpiryMonths);
      conditions.push(gte(medicines.expiryDate, minExpiryDate));
    }

    if (filters.minQuantity) {
      conditions.push(gte(medicines.quantity, filters.minQuantity));
    }

    if (filters.maxCost) {
      conditions.push(lte(medicines.costPerUnit, filters.maxCost.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(asc(medicines.expiryDate));
  }

  async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine> {
    const [medicine] = await db()
      .update(medicines)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(medicines.id, id))
      .returning();
    return medicine;
  }

  async getPendingMedicines(): Promise<Medicine[]> {
    return await db()
      .select({
        id: medicines.id,
        senderId: medicines.senderId,
        name: medicines.name,
        company: medicines.company,
        expiryDate: medicines.expiryDate,
        batchNumber: medicines.batchNumber,
        quantity: medicines.quantity,
        costPerUnit: medicines.costPerUnit,
        imageUrl: medicines.imageUrl,
        isSealed: medicines.isSealed,
        isApproved: medicines.isApproved,
        approvedBy: medicines.approvedBy,
        aiVerificationData: medicines.aiVerificationData,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
        senderName: users.organizationName,
      })
      .from(medicines)
      .leftJoin(users, eq(medicines.senderId, users.id))
      .where(eq(medicines.isApproved, false))
      .orderBy(desc(medicines.createdAt));
  }

  async approveMedicine(id: string, approvedBy: string): Promise<Medicine> {
    // For admin approval, handle the special admin case by setting approvedBy to null
    // This avoids foreign key constraint issues when admin is not a real user
    const [medicine] = await db()
      .update(medicines)
      .set({ 
        isApproved: true, 
        approvedBy: approvedBy === "admin" ? null : approvedBy, 
        updatedAt: new Date() 
      })
      .where(eq(medicines.id, id))
      .returning();
    return medicine;
  }

  async rejectMedicine(id: string): Promise<Medicine> {
    const [medicine] = await db()
      .update(medicines)
      .set({ isApproved: false, updatedAt: new Date() })
      .where(eq(medicines.id, id))
      .returning();
    return medicine;
  }

  // Cart operations
  async addToCart(cartItem: InsertCart): Promise<Cart> {
    // Check if item already exists in cart
    const [existingItem] = await db()
      .select()
      .from(cart)
      .where(and(eq(cart.userId, cartItem.userId), eq(cart.medicineId, cartItem.medicineId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db()
        .update(cart)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cart.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [newItem] = await db().insert(cart).values(cartItem).returning();
    return newItem;
  }

  async getCartByUser(userId: string): Promise<Cart[]> {
    return await db()
      .select({
        id: cart.id,
        userId: cart.userId,
        medicineId: cart.medicineId,
        quantity: cart.quantity,
        createdAt: cart.createdAt,
        medicineName: medicines.name,
        medicineCompany: medicines.company,
        medicinePrice: medicines.costPerUnit,
        senderName: users.organizationName,
        senderId: medicines.senderId,
      })
      .from(cart)
      .innerJoin(medicines, eq(cart.medicineId, medicines.id))
      .innerJoin(users, eq(medicines.senderId, users.id))
      .where(eq(cart.userId, userId))
      .orderBy(desc(cart.createdAt));
  }

  async updateCartItem(id: string, quantity: number): Promise<Cart> {
    const [cartItem] = await db()
      .update(cart)
      .set({ quantity })
      .where(eq(cart.id, id))
      .returning();
    return cartItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db().delete(cart).where(eq(cart.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db().delete(cart).where(eq(cart.userId, userId));
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db().insert(orders).values(insertOrder).returning();
    return order;
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db().insert(orderItems).values(orderItem).returning();
    return item;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db().select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db()
      .select()
      .from(orders)
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderPayment(id: string, paymentId: string, status: string): Promise<Order> {
    const [order] = await db()
      .update(orders)
      .set({ paymentId, paymentStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async updateOrderDelivery(id: string, status: string): Promise<Order> {
    const [order] = await db()
      .update(orders)
      .set({ deliveryStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Admin operations
  async getSystemStats(): Promise<{
    totalUsers: number;
    pendingApprovals: number;
    totalMedicines: number;
    totalOrders: number;
  }> {
    const [totalUsersResult] = await db()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isVerified, true));

    const [pendingApprovalsResult] = await db()
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "pending"));

    const [totalMedicinesResult] = await db()
      .select({ count: sql<number>`count(*)` })
      .from(medicines)
      .where(eq(medicines.isApproved, true));

    const [totalOrdersResult] = await db()
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    return {
      totalUsers: totalUsersResult.count,
      pendingApprovals: pendingApprovalsResult.count,
      totalMedicines: totalMedicinesResult.count,
      totalOrders: totalOrdersResult.count,
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db()
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getAllMedicines(): Promise<Medicine[]> {
    return await db()
      .select({
        id: medicines.id,
        senderId: medicines.senderId,
        name: medicines.name,
        company: medicines.company,
        expiryDate: medicines.expiryDate,
        batchNumber: medicines.batchNumber,
        quantity: medicines.quantity,
        costPerUnit: medicines.costPerUnit,
        imageUrl: medicines.imageUrl,
        isSealed: medicines.isSealed,
        isApproved: medicines.isApproved,
        approvedBy: medicines.approvedBy,
        aiVerificationData: medicines.aiVerificationData,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
        senderName: users.organizationName,
      })
      .from(medicines)
      .leftJoin(users, eq(medicines.senderId, users.id))
      .orderBy(desc(medicines.createdAt));
  }
}

export const storage = new DatabaseStorage();
