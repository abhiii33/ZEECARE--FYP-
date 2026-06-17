import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { InventoryCategory } from "../models/inventoryCategorySchema.js";
import { InventoryItem } from "../models/inventoryItemSchema.js";
import { Medicine } from "../models/medicineSchema.js";
import { InventoryTransaction } from "../models/inventoryTransactionSchema.js";

export const createCategory = catchAsyncErrors(async (req, res) => {
  const category = await InventoryCategory.create(req.body);
  res.status(201).json({ success: true, message: "Category created", category });
});

export const getAllCategories = catchAsyncErrors(async (req, res) => {
  const categories = await InventoryCategory.find();
  res.status(200).json({ success: true, categories });
});

export const createItem = catchAsyncErrors(async (req, res) => {
  const item = await InventoryItem.create(req.body);
  res.status(201).json({ success: true, message: "Item added", item });
});

export const getAllItems = catchAsyncErrors(async (req, res) => {
  const { categoryId, status } = req.query;
  const filter = {};
  if (categoryId) filter.categoryId = categoryId;
  if (status) filter.status = status;
  const items = await InventoryItem.find(filter).populate("categoryId", "name type");
  res.status(200).json({ success: true, items });
});

export const updateItem = catchAsyncErrors(async (req, res, next) => {
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return next(new ErrorHandler("Item not found", 404));
  res.status(200).json({ success: true, message: "Item updated", item });
});

export const getLowStockItems = catchAsyncErrors(async (req, res) => {
  const items = await InventoryItem.find({ status: { $in: ["LowStock", "OutOfStock"] } })
    .populate("categoryId", "name type");
  res.status(200).json({ success: true, items });
});

export const createTransaction = catchAsyncErrors(async (req, res, next) => {
  const { itemId, medicineId, type, quantity, reason, departmentId, patientId, referenceNo } = req.body;
  if (itemId) {
    const item = await InventoryItem.findById(itemId);
    if (!item) return next(new ErrorHandler("Item not found", 404));
    if (type === "StockIn" || type === "Return") item.quantity += quantity;
    else if (type === "StockOut") {
      if (item.quantity < quantity) return next(new ErrorHandler("Insufficient stock", 400));
      item.quantity -= quantity;
    } else if (type === "Expired") item.quantity = Math.max(0, item.quantity - quantity);
    else if (type === "Adjustment") item.quantity = quantity;
    await item.save();
  }
  if (medicineId) {
    const med = await Medicine.findById(medicineId);
    if (!med) return next(new ErrorHandler("Medicine not found", 404));
    if (type === "StockIn" || type === "Return") med.stock += quantity;
    else if (type === "StockOut") {
      if (med.stock < quantity) return next(new ErrorHandler("Insufficient medicine stock", 400));
      med.stock -= quantity;
    }
    await med.save();
  }
  const transaction = await InventoryTransaction.create({
    itemId, medicineId, type, quantity, reason, performedBy: req.user._id, departmentId, patientId, referenceNo,
  });
  res.status(201).json({ success: true, message: "Transaction recorded", transaction });
});

export const getTransactions = catchAsyncErrors(async (req, res) => {
  const { itemId, medicineId, type } = req.query;
  const filter = {};
  if (itemId) filter.itemId = itemId;
  if (medicineId) filter.medicineId = medicineId;
  if (type) filter.type = type;
  const transactions = await InventoryTransaction.find(filter)
    .populate("performedBy", "firstName lastName")
    .populate("itemId", "name sku")
    .sort({ transactionDate: -1 })
    .limit(100);
  res.status(200).json({ success: true, transactions });
});

export const createMedicine = catchAsyncErrors(async (req, res) => {
  const medicine = await Medicine.create(req.body);
  res.status(201).json({ success: true, message: "Medicine added", medicine });
});

export const getAllMedicines = catchAsyncErrors(async (req, res) => {
  const { search, dosageForm } = req.query;
  const filter = {};
  if (dosageForm) filter.dosageForm = dosageForm;
  if (search) filter.name = { $regex: search, $options: "i" };
  const medicines = await Medicine.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, medicines });
});

export const updateMedicine = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!medicine) return next(new ErrorHandler("Medicine not found", 404));
  res.status(200).json({ success: true, message: "Medicine updated", medicine });
});

export const getExpiringMedicines = catchAsyncErrors(async (req, res) => {
  const days = parseInt(req.query.days) || 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  const medicines = await Medicine.find({ expiryDate: { $lte: cutoff }, stock: { $gt: 0 } }).sort({ expiryDate: 1 });
  res.status(200).json({ success: true, medicines });
});

export const getInventoryStats = catchAsyncErrors(async (req, res) => {
  const totalItems = await InventoryItem.countDocuments();
  const lowStock = await InventoryItem.countDocuments({ status: "LowStock" });
  const outOfStock = await InventoryItem.countDocuments({ status: "OutOfStock" });
  const totalMedicines = await Medicine.countDocuments();
  const totalValue = await InventoryItem.aggregate([
    { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$unitPrice"] } } } },
  ]);
  res.status(200).json({
    success: true,
    stats: {
      totalItems, lowStock, outOfStock, totalMedicines,
      totalValue: totalValue[0]?.total || 0,
    },
  });
});
