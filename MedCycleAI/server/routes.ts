import express, { type Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertUserSchema, insertMedicineSchema, insertCartSchema } from "@shared/schema";
import { aiVerifyUser, aiVerifyMedicine } from "./services/aiVerification";
import { extractMedicineData } from "./services/ocr";
import { calculateDistance } from "./services/geolocation";
import { stripeService } from './services/stripeService';

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";

// File upload configuration
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

  // Middleware for authentication
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Middleware for admin authentication
const authenticateAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: express.Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user with hashed password
      const userToCreate = {
        ...userData,
        password: hashedPassword,
      };

      // Set user as pending for admin approval (no AI verification for now)
      userToCreate.isVerified = false;
      userToCreate.role = "pending";

      const user = await storage.createUser(userToCreate);
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      res.status(201).json({
        message: "Registration submitted for admin approval",
        user: userResponse
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: express.Response) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: "Account not verified. Please wait for admin approval." });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      const { password: _, ...userResponse } = user;
      
      res.json({
        message: "Login successful",
        token,
        user: userResponse
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/admin-login", async (req: Request, res: express.Response) => {
    try {
      const { username, password } = req.body;

      // Default admin credentials
      if (username === "admin" && password === "admin") {
        const token = jwt.sign(
          { userId: "admin", email: "admin@medcycle.com", role: "admin" },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          message: "Admin login successful",
          token,
          user: {
            id: "admin",
            email: "admin@medcycle.com",
            organizationName: "MedCycle Admin",
            role: "admin"
          }
        });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (req.user.role === "admin") {
        res.json({
          id: "admin",
          email: "admin@medcycle.com",
          organizationName: "MedCycle Admin",
          role: "admin"
        });
        return;
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Medicine routes
  app.post("/api/medicines", authenticateToken, upload.single('medicineImage'), async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      // Parse boolean values correctly
      const medicineData = insertMedicineSchema.parse({
        ...req.body,
        senderId: req.user.userId,
        quantity: parseInt(req.body.quantity),
        isSealed: req.body.isSealed === 'true' || req.body.isSealed === true,
        isApproved: false, // Always set to false initially for admin approval
        costPerUnit: parseFloat(req.body.costPerUnit).toString(),
      });

      let aiVerificationResult = null;
      let ocrData = null;

      // Process uploaded image if available
      if (req.file) {
        try {
          // Extract OCR data
          ocrData = await extractMedicineData(req.file.path);
          
          // AI verification comparing form data with OCR data
          aiVerificationResult = await aiVerifyMedicine(medicineData, ocrData);
          
          medicineData.imageUrl = `/uploads/${req.file.filename}`;
          medicineData.aiVerificationData = { ocrData, aiVerificationResult };
        } catch (ocrError) {
          console.error("OCR processing error:", ocrError);
          // Continue without OCR data
        }
      }

      const medicine = await storage.createMedicine(medicineData);
      
      res.status(201).json({
        message: "Medicine submitted for admin approval",
        medicine,
        aiVerification: aiVerificationResult
      });
    } catch (error: any) {
      console.error("Create medicine error:", error);
      res.status(400).json({ message: error.message || "Failed to create medicine listing" });
    }
  });

  app.get("/api/medicines/search", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const filters = {
        name: req.query.name as string,
        pinCode: req.query.pinCode as string,
        minExpiryMonths: req.query.minExpiryMonths ? parseInt(req.query.minExpiryMonths as string) : undefined,
        dosage: req.query.dosage as string,
        minQuantity: req.query.minQuantity ? parseInt(req.query.minQuantity as string) : undefined,
        maxCost: req.query.maxCost ? parseFloat(req.query.maxCost as string) : undefined,
      };

      const medicines = await storage.searchMedicines(filters);
      
      // Calculate distances if user pinCode is provided
      if (filters.pinCode) {
        const medicinesWithDistance = await Promise.all(
          medicines.map(async (medicine: any) => {
            try {
              const distance = await calculateDistance(filters.pinCode!, medicine.senderPinCode);
              return { ...medicine, distance };
            } catch (error) {
              return { ...medicine, distance: null };
            }
          })
        );
        
        // Sort by distance
        medicinesWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        res.json(medicinesWithDistance);
      } else {
        res.json(medicines);
      }
    } catch (error: any) {
      console.error("Search medicines error:", error);
      res.status(500).json({ message: "Failed to search medicines" });
    }
  });

  app.get("/api/medicines/my-medicines", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const medicines = await storage.getMedicinesBySender(req.user.userId);
      res.json(medicines);
    } catch (error: any) {
      console.error("Get my medicines error:", error);
      res.status(500).json({ message: "Failed to get medicines" });
    }
  });

  // Cart routes
  app.post("/api/cart", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const cartData = insertCartSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });

      const cartItem = await storage.addToCart(cartData);
      res.status(201).json(cartItem);
    } catch (error: any) {
      console.error("Add to cart error:", error);
      res.status(400).json({ message: error.message || "Failed to add to cart" });
    }
  });

  app.get("/api/cart", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const cartItems = await storage.getCartByUser(req.user.userId);
      res.json(cartItems);
    } catch (error: any) {
      console.error("Get cart error:", error);
      res.status(500).json({ message: "Failed to get cart" });
    }
  });

  app.put("/api/cart/:id", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error: any) {
      console.error("Update cart error:", error);
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.post("/api/orders", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const { deliveryAddress } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartByUser(req.user.userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total
      let totalAmount = 0;
      for (const item of cartItems) {
        totalAmount += parseFloat(item.unitPrice || '0') * item.quantity;
      }

      // Create order
      const order = await storage.createOrder({
        buyerId: req.user.userId,
        totalAmount: totalAmount.toString(),
        deliveryAddress,
      });

      // Add order items
      for (const item of cartItems) {
        const unitPrice = parseFloat(item.unitPrice || '0');
        const totalPrice = unitPrice * item.quantity;
        
        await storage.addOrderItem({
          orderId: order.id,
          medicineId: item.medicineId,
          senderId: item.senderId || '',
          quantity: item.quantity,
          unitPrice: unitPrice.toString(),
          totalPrice: totalPrice.toString(),
        });
      }

      // Clear cart
      await storage.clearCart(req.user.userId);

      res.status(201).json({
        message: "Order created successfully",
        order
      });
    } catch (error: any) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const orders = await storage.getOrdersByUser(req.user.userId);
      res.json(orders);
    } catch (error: any) {
      console.error("Get orders error:", error);
      res.status(500).json({ message: "Failed to get orders" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      console.error("Get order error:", error);
      res.status(500).json({ message: "Failed to get order" });
    }
  });

  // Create Stripe payment intent
  app.post("/api/create-payment-intent", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { amount, orderId } = req.body;
    
    if (!amount || !orderId) {
      return res.status(400).json({ message: "Amount and orderId are required" });
    }

    const paymentIntent = await stripeService.createPaymentIntent({
      amount: parseFloat(amount),
      orderId,
      customerEmail: req.user!.email,
    });

    res.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Failed to create payment intent" });
  }
});

  // New endpoint: Create order with Stripe payment (atomic operation)
  app.post("/api/create-order-with-payment", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { deliveryAddress, cartItems, paymentMethodId } = req.body;
      
      if (!cartItems?.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Calculate total
      const totalAmount = cartItems.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.unitPrice || '0') * item.quantity), 0);

      // Create payment intent FIRST
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: totalAmount,
        orderId: 'temp_' + Date.now(),
        customerEmail: req.user!.email,
      });

      // Create order only after successful payment intent
      const order = await storage.createOrder({
        buyerId: req.user!.userId,
        totalAmount: totalAmount.toString(),
        deliveryAddress,
      });

      // Add order items
      for (const item of cartItems) {
        await storage.addOrderItem({
          orderId: order.id,
          medicineId: item.medicineId,
          senderId: item.senderId || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice || '0',
          totalPrice: (parseFloat(item.unitPrice || '0') * item.quantity).toString(),
        });
      }

      // Clear cart
      await storage.clearCart(req.user!.userId);

      res.json({
        clientSecret: paymentIntent.clientSecret,
        orderId: order.id,
        message: "Order created successfully with payment"
      });

    } catch (error: any) {
      console.error("Create order with payment error:", error);
      res.status(500).json({ message: "Failed to create order with payment" });
    }
  });

  // Stripe webhook endpoint for payment confirmations
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req: Request, res: express.Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata.orderId) {
          await storage.updateOrderPayment(
            paymentIntent.metadata.orderId,
            paymentIntent.id,
            'paid'
          );
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        if (failedPayment.metadata.orderId) {
          await storage.updateOrderPayment(
            failedPayment.metadata.orderId,
            failedPayment.id,
            'failed'
          );
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

// Confirm Stripe payment
  app.post("/api/orders/:id/confirm-payment", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    const paymentResult = await stripeService.confirmPayment(paymentIntentId);
    
    if (paymentResult.success) {
      const order = await storage.updateOrderPayment(
        req.params.id,
        paymentResult.paymentId,
        "paid"
      );
      
      res.json({
        message: "Payment confirmed successfully",
        order,
        paymentId: paymentResult.paymentId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
      });
    } else {
      res.status(400).json({ message: paymentResult.error });
    }
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

// Legacy payment endpoint (deprecated - use Stripe instead)
  app.post("/api/orders/:id/payment", authenticateToken, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
        const { paymentMethod } = req.body;
      
      let paymentId: string;
      let paymentStatus: string;
      
      // Process regular payment (test mode)
      paymentId = `pay_${Date.now()}`;
      paymentStatus = "paid";
      
      const order = await storage.updateOrderPayment(req.params.id, paymentId, paymentStatus);
      
      res.json({
        message: "Payment processed successfully",
        order,
        paymentId,
        paymentMethod
      });
    } catch (error: any) {
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error: any) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get system stats" });
    }
  });

  app.get("/api/admin/pending-users", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error: any) {
      console.error("Get pending users error:", error);
      res.status(500).json({ message: "Failed to get pending users" });
    }
  });

  app.post("/api/admin/users/:id/approve", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const user = await storage.approveUser(req.params.id, req.user.userId);
      res.json({
        message: "User approved successfully",
        user
      });
    } catch (error: any) {
      console.error("Approve user error:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });

  app.post("/api/admin/users/:id/reject", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const user = await storage.rejectUser(req.params.id);
      res.json({
        message: "User rejected successfully",
        user
      });
    } catch (error: any) {
      console.error("Reject user error:", error);
      res.status(500).json({ message: "Failed to reject user" });
    }
  });

  app.get("/api/admin/pending-medicines", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const pendingMedicines = await storage.getPendingMedicines();
      res.json(pendingMedicines);
    } catch (error: any) {
      console.error("Get pending medicines error:", error);
      res.status(500).json({ message: "Failed to get pending medicines" });
    }
  });

  // New endpoints for getting all users and medicines
  app.get("/api/admin/users", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/admin/medicines", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const medicines = await storage.getAllMedicines();
      res.json(medicines);
    } catch (error: any) {
      console.error("Get all medicines error:", error);
      res.status(500).json({ message: "Failed to get medicines" });
    }
  });

app.post("/api/admin/medicines/:id/approve", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res) => {
    try {
const medicine = await storage.approveMedicine(req.params.id, req.user.userId); // Ensure this user ID exists
      res.json({
        message: "Medicine approved successfully",
        medicine
      });
    } catch (error: any) {
      console.error("Approve medicine error:", error);
      res.status(500).json({ message: "Failed to approve medicine" });
    }
  });

  app.post("/api/admin/medicines/:id/reject", authenticateToken, authenticateAdmin, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      const medicine = await storage.rejectMedicine(req.params.id);
      res.json({
        message: "Medicine rejected successfully",
        medicine
      });
    } catch (error: any) {
      console.error("Reject medicine error:", error);
      res.status(500).json({ message: "Failed to reject medicine" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
