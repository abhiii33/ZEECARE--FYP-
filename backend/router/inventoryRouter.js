import express from "express";
import { isAdminAuthenticated, isAuthenticated } from "../middlewares/auth.js";
import {
  createCategory, getAllCategories, createItem, getAllItems, updateItem,
  getLowStockItems, createTransaction, getTransactions,
  createMedicine, getAllMedicines, updateMedicine, getExpiringMedicines,
  getInventoryStats,
} from "../controller/inventoryController.js";

const router = express.Router();

router.get("/categories", isAuthenticated, getAllCategories);
router.post("/categories", isAdminAuthenticated, createCategory);
router.get("/items", isAuthenticated, getAllItems);
router.post("/items", isAdminAuthenticated, createItem);
router.put("/items/:id", isAdminAuthenticated, updateItem);
router.get("/low-stock", isAdminAuthenticated, getLowStockItems);
router.get("/stats", isAdminAuthenticated, getInventoryStats);
router.post("/transactions", isAdminAuthenticated, createTransaction);
router.get("/transactions", isAdminAuthenticated, getTransactions);
router.get("/medicines", isAuthenticated, getAllMedicines);
router.post("/medicines", isAdminAuthenticated, createMedicine);
router.put("/medicines/:id", isAdminAuthenticated, updateMedicine);
router.get("/medicines/expiring", isAdminAuthenticated, getExpiringMedicines);

export default router;
