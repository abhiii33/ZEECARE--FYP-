import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Invoice } from "../models/invoiceSchema.js";
import { Payment } from "../models/paymentSchema.js";
import { Insurance } from "../models/insuranceSchema.js";

export const createInvoice = catchAsyncErrors(async (req, res) => {
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;
  const invoice = await Invoice.create({ ...req.body, invoiceNumber });
  res.status(201).json({ success: true, message: "Invoice created", invoice });
});

export const getAllInvoices = catchAsyncErrors(async (req, res) => {
  const { status, patientId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (patientId) filter.patientId = patientId;
  const invoices = await Invoice.find(filter)
    .populate("patientId", "firstName lastName email phone")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, invoices });
});

export const getMyInvoices = catchAsyncErrors(async (req, res) => {
  const invoices = await Invoice.find({ patientId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, invoices });
});

export const getInvoiceById = catchAsyncErrors(async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("patientId", "firstName lastName email phone NIC");
  if (!invoice) return next(new ErrorHandler("Invoice not found", 404));
  res.status(200).json({ success: true, invoice });
});

export const updateInvoiceStatus = catchAsyncErrors(async (req, res, next) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!invoice) return next(new ErrorHandler("Invoice not found", 404));
  res.status(200).json({ success: true, message: "Invoice updated", invoice });
});

export const makePayment = catchAsyncErrors(async (req, res, next) => {
  const { invoiceId, amount, method, transactionId } = req.body;
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return next(new ErrorHandler("Invoice not found", 404));
  const payment = await Payment.create({
    invoiceId, patientId: req.user._id, amount, method, transactionId, status: "Success",
  });
  const totalPaid = await Payment.aggregate([
    { $match: { invoiceId: invoice._id, status: "Success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const paidAmount = totalPaid[0]?.total || 0;
  if (paidAmount >= invoice.totalAmount) invoice.status = "Paid";
  else invoice.status = "PartiallyPaid";
  await invoice.save();
  res.status(201).json({ success: true, message: "Payment recorded", payment });
});

export const getPaymentHistory = catchAsyncErrors(async (req, res) => {
  const filter = {};
  if (req.user.role === "Patient") filter.patientId = req.user._id;
  else if (req.query.patientId) filter.patientId = req.query.patientId;
  const payments = await Payment.find(filter)
    .populate("invoiceId", "invoiceNumber totalAmount")
    .sort({ paymentDate: -1 });
  res.status(200).json({ success: true, payments });
});

export const getRevenueReport = catchAsyncErrors(async (req, res) => {
  const { period } = req.query;
  let startDate = new Date();
  if (period === "weekly") startDate.setDate(startDate.getDate() - 7);
  else if (period === "monthly") startDate.setMonth(startDate.getMonth() - 1);
  else if (period === "yearly") startDate.setFullYear(startDate.getFullYear() - 1);
  else startDate.setDate(startDate.getDate() - 30);
  const revenue = await Payment.aggregate([
    { $match: { status: "Success", paymentDate: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
  const pendingInvoices = await Invoice.countDocuments({ status: { $in: ["Pending", "Overdue"] } });
  const pendingAmount = await Invoice.aggregate([
    { $match: { status: { $in: ["Pending", "Overdue"] } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  res.status(200).json({
    success: true,
    report: { totalRevenue, pendingInvoices, pendingAmount: pendingAmount[0]?.total || 0, dailyBreakdown: revenue },
  });
});

export const processRefund = catchAsyncErrors(async (req, res, next) => {
  const { paymentId, reason } = req.body;
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.status !== "Success")
    return next(new ErrorHandler("Valid payment not found", 404));
  payment.status = "Refunded";
  await payment.save();
  res.status(200).json({ success: true, message: "Refund processed", payment });
});

export const addInsurance = catchAsyncErrors(async (req, res) => {
  const insurance = await Insurance.create({ ...req.body, patientId: req.user._id });
  res.status(201).json({ success: true, message: "Insurance added", insurance });
});

export const getMyInsurance = catchAsyncErrors(async (req, res) => {
  const insurance = await Insurance.find({ patientId: req.user._id });
  res.status(200).json({ success: true, insurance });
});

export const updateInsurance = catchAsyncErrors(async (req, res, next) => {
  const insurance = await Insurance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!insurance) return next(new ErrorHandler("Insurance not found", 404));
  res.status(200).json({ success: true, message: "Insurance updated", insurance });
});
