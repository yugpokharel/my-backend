import MenuItem from "../models/MenuItem.js";
import multer from "multer";
import path from "path";

// Multer config for menu item images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "menu-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
    }
  },
});

export const uploadMenuImage = upload.single("image");

// GET /api/menu — Get all menu items (any authenticated user)
export const getMenuItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.status(200).json({ data: items });
  } catch (err) {
    next(err);
  }
};

// POST /api/menu — Add a new menu item (owner/admin only)
export const createMenuItem = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({ message: "Not authorized to add menu items" });
    }

    const { name, price, category, isAvailable } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || null;

    if (!name || price == null || !category) {
      return res.status(400).json({ message: "name, price, and category are required" });
    }

    const item = await MenuItem.create({
      name,
      price: Number(price),
      category,
      image,
      isAvailable: isAvailable != null ? isAvailable === true || isAvailable === "true" : true,
    });
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
};

// PUT /api/menu/:id — Update a menu item (owner/admin only)
export const updateMenuItem = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update menu items" });
    }

    const updateData = { ...req.body };

    // If a file was uploaded, set the image path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Coerce types from form-data strings
    if (updateData.price != null) updateData.price = Number(updateData.price);
    if (updateData.isAvailable != null) {
      updateData.isAvailable = updateData.isAvailable === true || updateData.isAvailable === "true";
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ data: item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/menu/:id — Delete a menu item (owner/admin only)
export const deleteMenuItem = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete menu items" });
    }

    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({ message: "Menu item deleted" });
  } catch (err) {
    next(err);
  }
};
