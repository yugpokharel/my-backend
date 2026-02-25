import Order from "../models/Order.js";

// POST /api/orders — Create a new order
export const createOrder = async (req, res, next) => {
  try {
    const { tableId, items, totalAmount, customerNote } = req.body;

    if (!tableId || !items || !totalAmount) {
      return res
        .status(400)
        .json({ message: "tableId, items, and totalAmount are required" });
    }

    const order = await Order.create({
      user: req.user._id,
      tableId,
      items,
      totalAmount,
      customerNote,
    });

    res.status(201).json({ data: order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — Get orders (all for owner/admin, own for customer)
export const getOrders = async (req, res, next) => {
  try {
    const role = req.user.role;
    let filter = {};

    if (role !== "owner" && role !== "admin") {
      filter.user = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate("user", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id — Get a single order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "fullName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Customers can only view their own orders
    const role = req.user.role;
    if (role !== "owner" && role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({ data: order });
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status — Update order status (owner/admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "preparing", "ready", "served", "cancelled"];

    if (!status || !allowed.includes(status)) {
      return res
        .status(400)
        .json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const role = req.user.role;
    if (role !== "owner" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ data: order });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id — Delete an order (owner/admin only)
export const deleteOrder = async (req, res, next) => {
  try {
    const role = req.user.role;
    if (role !== "owner" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete orders" });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};
