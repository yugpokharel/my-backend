import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
import authRoutes from "./modules/auth/auth.routes.js";
import orderRoutes from "./routes/orderRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);

app.use(errorHandler);

export default app;