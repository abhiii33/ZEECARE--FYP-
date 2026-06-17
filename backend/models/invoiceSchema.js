import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: [
        "Consultation",
        "LabTest",
        "Medicine",
        "BedCharge",
        "Procedure",
        "Equipment",
        "Other",
      ],
      required: [true, "Item Type Is Required!"],
    },
    description: {
      type: String,
      required: [true, "Item Description Is Required!"],
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit Price Is Required!"],
    },
    amount: {
      type: Number,
      required: [true, "Item Amount Is Required!"],
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice Number Is Required!"],
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    appointmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Appointment",
    },
    bedAllocationId: {
      type: mongoose.Schema.ObjectId,
      ref: "BedAllocation",
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: [true, "Subtotal Is Required!"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total Amount Is Required!"],
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "PartiallyPaid",
        "Paid",
        "Overdue",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

invoiceSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  }
  this.totalAmount = this.subtotal - this.discount + this.tax;
  next();
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
