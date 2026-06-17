import express from "express";
import { isAdminAuthenticated } from "../middlewares/auth.js";
import {
  createDepartment, getAllDepartments, updateDepartment, deleteDepartment,
} from "../controller/departmentController.js";

const router = express.Router();

router.get("/getall", getAllDepartments);
router.post("/create", isAdminAuthenticated, createDepartment);
router.put("/update/:id", isAdminAuthenticated, updateDepartment);
router.delete("/delete/:id", isAdminAuthenticated, deleteDepartment);

export default router;
