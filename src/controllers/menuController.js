import MenuItem from "../models/MenuItem.js";

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

    const { name, price, category, image, isAvailable } = req.body;

    if (!name || price == null || !category) {
      return res.status(400).json({ message: "name, price, and category are required" });
    }

    const item = await MenuItem.create({ name, price, category, image, isAvailable });
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

    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
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
