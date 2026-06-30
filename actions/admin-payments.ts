"use server";

import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Payment } from "@/models/Payment";
import { Pricing } from "@/models/Pricing";
import { Website } from "@/models/Website";

// Helper to check admin authentication
async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload;
}

// ----------------------------------------------------
// 1. PAYMENT STATS & ANALYTICS
// ----------------------------------------------------
export async function getPaymentStats() {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access.");
  }

  try {
    await connectToDatabase();

    const now = new Date();
    
    // Date boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    // Revenue aggregations helper
    const getRevenueSum = async (query: any) => {
      const result = await Payment.aggregate([
        { $match: { status: "Paid", ...query } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      return result.length > 0 ? result[0].total : 0;
    };

    // Revenue metrics
    const totalRevenue = await getRevenueSum({});
    const todayRevenue = await getRevenueSum({ createdAt: { $gte: startOfToday } });
    const weeklyRevenue = await getRevenueSum({ createdAt: { $gte: startOfWeek } });
    const monthlyRevenue = await getRevenueSum({ createdAt: { $gte: startOfMonth } });
    const yearlyRevenue = await getRevenueSum({ createdAt: { $gte: startOfYear } });

    // Payment counts by status
    const totalSuccessful = await Payment.countDocuments({ status: "Paid" });
    const totalPending = await Payment.countDocuments({ status: "Pending" });
    const totalFailed = await Payment.countDocuments({ status: "Failed" });
    const totalRefunded = await Payment.countDocuments({ status: "Refunded" });
    const totalPaymentsCount = await Payment.countDocuments();

    // Average transaction value
    const averageTransactionValue = totalSuccessful > 0 ? totalRevenue / totalSuccessful : 0;

    // Conversion rate (Successful / Total Payments)
    const conversionRate = totalPaymentsCount > 0 ? (totalSuccessful / totalPaymentsCount) * 100 : 0;

    // Daily Revenue for Chart (Last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenueRaw = await Payment.aggregate([
      {
        $match: {
          status: "Paid",
          createdAt: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly Revenue for Chart (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenueRaw = await Payment.aggregate([
      {
        $match: {
          status: "Paid",
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category revenue distribution
    const categoryRevenueRaw = await Payment.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: "$category", revenue: { $sum: "$amount" } } }
    ]);

    // Theme (Template) revenue distribution
    const themeRevenueRaw = await Payment.aggregate([
      { $match: { status: "Paid" } },
      { $group: { _id: "$theme", revenue: { $sum: "$amount" } } }
    ]);

    // Highs and Lows
    const dailyRevenuesList = dailyRevenueRaw.map(d => d.revenue);
    const highestRevenueDay = dailyRevenuesList.length > 0 ? Math.max(...dailyRevenuesList) : 0;
    const lowestRevenueDay = dailyRevenuesList.length > 0 ? Math.min(...dailyRevenuesList) : 0;
    const averageDailyRevenue = dailyRevenuesList.length > 0 ? dailyRevenuesList.reduce((a, b) => a + b, 0) / dailyRevenuesList.length : 0;

    // Get current publish price
    const currentPriceDoc = await Pricing.findOne().sort({ updatedAt: -1 }).lean();
    const currentPrice = currentPriceDoc ? currentPriceDoc.currentPrice : 1.00;

    return {
      success: true,
      stats: {
        totalRevenue,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        yearlyRevenue,
        totalSuccessful,
        totalPending,
        totalFailed,
        totalRefunded,
        averageTransactionValue,
        conversionRate,
        revenueGrowthPercentage: 12.5, // Mocked growth percentage for premium view
        grossRevenue: totalRevenue,
        netRevenue: totalRevenue * 0.98, // Mocked net after PG fee (approx 2% fee)
        highestRevenueDay,
        lowestRevenueDay,
        averageDailyRevenue,
        currentPrice,
      },
      charts: {
        dailyRevenue: dailyRevenueRaw,
        monthlyRevenue: monthlyRevenueRaw,
        categoryRevenue: categoryRevenueRaw,
        themeRevenue: themeRevenueRaw,
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch payment dashboard analytics:", error);
    return { success: false, error: error.message || "Failed to load payment statistics." };
  }
}

// ----------------------------------------------------
// 2. TRANSACTION TABLE & FILTERS
// ----------------------------------------------------
interface GetTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  method?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

export async function getTransactions(params: GetTransactionsParams) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access.");
  }

  try {
    await connectToDatabase();
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      category = "all",
      method = "all",
      minAmount,
      maxAmount,
      startDate,
      endDate
    } = params;

    const query: any = {};

    // Search query (Slug, customerName, Payment ID, Order ID)
    if (search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { websiteSlug: searchRegex },
        { customerName: searchRegex },
        { paymentId: searchRegex },
        { razorpayPaymentId: searchRegex },
        { razorpayOrderId: searchRegex }
      ];
    }

    // Status filter
    if (status !== "all") {
      query.status = status;
    }

    // Category filter
    if (category !== "all") {
      query.category = category;
    }

    // Payment Method filter
    if (method !== "all") {
      query.paymentMethod = method;
    }

    // Amount Range
    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = Number(maxAmount);
    }

    // Date Range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const totalCount = await Payment.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const transactions = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(transactions)),
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      }
    };
  } catch (error: any) {
    console.error("Failed to query transactions:", error);
    return { success: false, error: error.message || "Failed to query transactions." };
  }
}

// ----------------------------------------------------
// 3. PAYMENT DETAIL VIEW
// ----------------------------------------------------
export async function getPaymentDetails(id: string) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access.");
  }

  try {
    await connectToDatabase();

    const payment = await Payment.findById(id).lean();
    if (!payment) {
      return { success: false, error: "Payment transaction not found." };
    }

    // Look up webhook logs / states. We mock webhook delivery time if status is Paid and verified by webhook.
    const isWebhookProcessed = payment.webhookStatus === "Processed" || payment.webhookStatus === "Received";
    const webhookReceivedTime = isWebhookProcessed ? payment.updatedAt : null;

    // Fetch matching live website status
    const website = await Website.findOne({ slug: payment.websiteSlug }).select("_id slug expiresAt").lean();
    const isWebsiteLive = !!website && new Date(website.expiresAt) > new Date();

    return {
      success: true,
      payment: JSON.parse(JSON.stringify(payment)),
      details: {
        webhookReceivedTime: webhookReceivedTime ? webhookReceivedTime.toISOString() : null,
        isWebsiteLive,
        websiteId: website ? website._id.toString() : null,
      }
    };
  } catch (error: any) {
    console.error("Failed to load payment details:", error);
    return { success: false, error: error.message || "Failed to load payment details." };
  }
}

// ----------------------------------------------------
// 4. PRICE CONFIGURATION
// ----------------------------------------------------
export async function getPricingConfig() {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access.");
  }

  try {
    await connectToDatabase();

    const currentPriceDoc = await Pricing.findOne().sort({ updatedAt: -1 }).lean();
    const currentPrice = currentPriceDoc ? currentPriceDoc.currentPrice : 1.00;

    // Verify configs (Never expose secrets to client, return boolean flags)
    const isKeyIdSet = !!process.env.RAZORPAY_KEY_ID;
    const isSecretKeySet = !!process.env.RAZORPAY_KEY_SECRET;
    const isWebhookSecretSet = !!process.env.RAZORPAY_WEBHOOK_SECRET;

    return {
      success: true,
      config: {
        currentPrice,
        razorpayConnected: isKeyIdSet && isSecretKeySet,
        keyIdStatus: isKeyIdSet ? "Configured" : "Missing",
        secretKeyStatus: isSecretKeySet ? "Configured (Hidden)" : "Missing",
        webhookStatus: isWebhookSecretSet ? "Active" : "Inactive",
        webhookVerificationStatus: isWebhookSecretSet ? "Configured" : "Missing",
        databaseConnectionStatus: "Connected",
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch pricing config:", error);
    return { success: false, error: error.message || "Failed to check payment configurations." };
  }
}

export async function updatePrice(newPrice: number) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized access." };
  }

  if (newPrice <= 0) {
    return { success: false, error: "Price must be greater than zero." };
  }

  try {
    await connectToDatabase();

    const pricing = new Pricing({
      currentPrice: newPrice,
      currency: "INR",
      updatedBy: "admin",
      updatedAt: new Date(),
    });

    await pricing.save();
    console.log(`Publishing price updated dynamically to ₹${newPrice} by admin.`);

    return { success: true, currentPrice: newPrice };
  } catch (error: any) {
    console.error("Failed to update pricing:", error);
    return { success: false, error: error.message || "Failed to update pricing." };
  }
}

// ----------------------------------------------------
// 5. EXPORT UTILITY
// ----------------------------------------------------
export async function getExportTransactions(params: GetTransactionsParams) {
  const isAuthenticated = await verifyAdminAuth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized access.");
  }

  try {
    await connectToDatabase();
    const {
      search = "",
      status = "all",
      category = "all",
      method = "all",
      minAmount,
      maxAmount,
      startDate,
      endDate
    } = params;

    const query: any = {};

    if (search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { websiteSlug: searchRegex },
        { customerName: searchRegex },
        { paymentId: searchRegex }
      ];
    }
    if (status !== "all") query.status = status;
    if (category !== "all") query.category = category;
    if (method !== "all") query.paymentMethod = method;

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = Number(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = Number(maxAmount);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const transactions = await Payment.find(query)
      .sort({ createdAt: -1 })
      .select("paymentId razorpayPaymentId razorpayOrderId websiteSlug customerName category theme amount status paymentMethod createdAt verificationStatus webhookStatus")
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(transactions))
    };
  } catch (error: any) {
    console.error("Failed to retrieve export transactions:", error);
    return { success: false, error: error.message };
  }
}
