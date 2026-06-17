import express from "express";
import {
  isAdminAuthenticated, isPatientAuthenticated, isAuthenticated,
} from "../middlewares/auth.js";
import {
  createInvoice, getAllInvoices, getMyInvoices, getInvoiceById,
  updateInvoiceStatus, makePayment, getPaymentHistory,
  getRevenueReport, processRefund, addInsurance, getMyInsurance, updateInsurance,
} from "../controller/billingController.js";

const router = express.Router();

// Invoices
router.post("/invoices", isAdminAuthenticated, createInvoice);
router.get("/invoices", isAdminAuthenticated, getAllInvoices);
router.get("/invoices/my", isPatientAuthenticated, getMyInvoices);
router.get("/invoices/:id", isAuthenticated, getInvoiceById);
router.put("/invoices/:id/status", isAdminAuthenticated, updateInvoiceStatus);

// Payments
router.post("/payments", isPatientAuthenticated, makePayment);
router.get("/payments", isAuthenticated, getPaymentHistory);
router.get("/revenue", isAdminAuthenticated, getRevenueReport);
router.post("/refunds", isAdminAuthenticated, processRefund);

// Insurance
router.post("/insurance", isPatientAuthenticated, addInsurance);
router.get("/insurance/my", isPatientAuthenticated, getMyInsurance);
router.put("/insurance/:id", isPatientAuthenticated, updateInsurance);

export default router;
