import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuImage,
} from "../controllers/menuController.js";

const router = express.Router();

router.use(protect);

router.get("/", getMenuItems);
router.post("/", uploadMenuImage, createMenuItem);
router.put("/:id", uploadMenuImage, updateMenuItem);
router.delete("/:id", deleteMenuItem);

export default router;
