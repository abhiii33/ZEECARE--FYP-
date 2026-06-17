"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Package,
  Pill,
  ArrowUpDown,
  Plus,
  AlertTriangle,
  TrendingDown,
  Search,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import {
  getInventoryItems,
  getAllMedicines,
  getInventoryStats,
  getInventoryTransactions,
  getExpiringMedicines,
  getInventoryCategories,
  createInventoryItem,
  createMedicine,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

/* ---------- local types based on backend schemas ---------- */

interface InventoryCategory {
  _id: string;
  name: string;
  description?: string;
  type: string;
}

interface InventoryItem {
  _id: string;
  categoryId: InventoryCategory | string;
  name: string;
  sku?: string;
  description?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplier?: string;
  storageLocation?: string;
  status: "InStock" | "LowStock" | "OutOfStock" | "Discontinued";
  createdAt: string;
}

interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  manufacturer?: string;
  dosageForm: string;
  strength: string;
  price: number;
  stock: number;
  minStock: number;
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate: string;
  requiresPrescription: boolean;
  createdAt: string;
}

interface InventoryTransaction {
  _id: string;
  itemId?: { _id: string; name: string; sku?: string };
  medicineId?: { _id: string; name: string };
  type: "StockIn" | "StockOut" | "Adjustment" | "Return" | "Expired";
  quantity: number;
  reason?: string;
  performedBy?: { firstName: string; lastName: string };
  referenceNo?: string;
  transactionDate: string;
  createdAt: string;
}

interface Stats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  totalMedicines: number;
  totalValue: number;
}

/* ---------- constants ---------- */

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Drops",
  "Inhaler",
  "Ointment",
] as const;

const CATEGORY_TYPES = [
  "MedicalSupply",
  "Medicine",
  "Equipment",
  "Consumable",
  "PPE",
  "Lab",
] as const;

/* ---------- helpers ---------- */

function statusBadge(status: string) {
  switch (status) {
    case "InStock":
      return <Badge variant="success">In Stock</Badge>;
    case "LowStock":
      return <Badge variant="warning">Low Stock</Badge>;
    case "OutOfStock":
      return <Badge variant="destructive">Out of Stock</Badge>;
    case "Discontinued":
      return <Badge variant="secondary">Discontinued</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function transactionTypeBadge(type: string) {
  switch (type) {
    case "StockIn":
      return <Badge variant="success">Stock In</Badge>;
    case "StockOut":
      return <Badge variant="destructive">Stock Out</Badge>;
    case "Adjustment":
      return <Badge variant="info">Adjustment</Badge>;
    case "Return":
      return <Badge variant="warning">Return</Badge>;
    case "Expired":
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

function isExpiringSoon(expiryDate: string) {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 90;
}

function categoryName(cat: InventoryCategory | string): string {
  if (typeof cat === "object" && cat !== null) return cat.name;
  return String(cat);
}

/* ---------- page component ---------- */

export default function InventoryManagement() {
  /* --- data state --- */
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalMedicines: 0,
    totalValue: 0,
  });

  /* --- UI state --- */
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("All");
  const [medSearch, setMedSearch] = useState("");
  const [medDosageFilter, setMedDosageFilter] = useState("All");

  /* --- dialog state --- */
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* --- add item form --- */
  const [itemForm, setItemForm] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    unit: "pcs",
    quantity: "",
    minStock: "10",
    maxStock: "1000",
    unitPrice: "",
    supplier: "",
    storageLocation: "",
  });
  const updateItem = (key: string, value: string) =>
    setItemForm((f) => ({ ...f, [key]: value }));

  /* --- add medicine form --- */
  const [medForm, setMedForm] = useState({
    name: "",
    genericName: "",
    manufacturer: "",
    dosageForm: "",
    strength: "",
    price: "",
    stock: "",
    minStock: "20",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    requiresPrescription: "true",
  });
  const updateMed = (key: string, value: string) =>
    setMedForm((f) => ({ ...f, [key]: value }));

  /* --- fetch data --- */
  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      getInventoryItems(),
      getAllMedicines(),
      getInventoryTransactions(),
      getInventoryStats(),
      getInventoryCategories(),
    ])
      .then(([itemsRes, medsRes, txRes, statsRes, catRes]) => {
        setItems(itemsRes.data.items || []);
        setMedicines(medsRes.data.medicines || []);
        setTransactions(txRes.data.transactions || []);
        setStats(
          statsRes.data.stats || {
            totalItems: 0,
            lowStock: 0,
            outOfStock: 0,
            totalMedicines: 0,
            totalValue: 0,
          }
        );
        setCategories(catRes.data.categories || []);
      })
      .catch(() => {
        toast.error("Failed to load inventory data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* --- filtered lists --- */
  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      (item.sku?.toLowerCase().includes(itemSearch.toLowerCase()) ?? false);
    const matchCategory =
      itemCategoryFilter === "All" ||
      categoryName(item.categoryId) === itemCategoryFilter;
    return matchSearch && matchCategory;
  });

  const filteredMedicines = medicines.filter((med) => {
    const matchSearch =
      med.name.toLowerCase().includes(medSearch.toLowerCase()) ||
      (med.genericName?.toLowerCase().includes(medSearch.toLowerCase()) ??
        false);
    const matchDosage =
      medDosageFilter === "All" || med.dosageForm === medDosageFilter;
    return matchSearch && matchDosage;
  });

  /* --- handlers --- */
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.categoryId) {
      toast.error("Name and Category are required");
      return;
    }
    setSubmitting(true);
    try {
      await createInventoryItem({
        ...itemForm,
        quantity: Number(itemForm.quantity) || 0,
        minStock: Number(itemForm.minStock) || 10,
        maxStock: Number(itemForm.maxStock) || 1000,
        unitPrice: Number(itemForm.unitPrice) || 0,
      });
      toast.success("Inventory item added successfully");
      setShowAddItem(false);
      setItemForm({
        name: "",
        sku: "",
        description: "",
        categoryId: "",
        unit: "pcs",
        quantity: "",
        minStock: "10",
        maxStock: "1000",
        unitPrice: "",
        supplier: "",
        storageLocation: "",
      });
      fetchAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add inventory item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name || !medForm.dosageForm || !medForm.strength || !medForm.expiryDate) {
      toast.error("Name, Dosage Form, Strength and Expiry Date are required");
      return;
    }
    setSubmitting(true);
    try {
      await createMedicine({
        ...medForm,
        price: Number(medForm.price) || 0,
        stock: Number(medForm.stock) || 0,
        minStock: Number(medForm.minStock) || 20,
        requiresPrescription: medForm.requiresPrescription === "true",
      });
      toast.success("Medicine added successfully");
      setShowAddMedicine(false);
      setMedForm({
        name: "",
        genericName: "",
        manufacturer: "",
        dosageForm: "",
        strength: "",
        price: "",
        stock: "",
        minStock: "20",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        requiresPrescription: "true",
      });
      fetchAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add medicine"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --- stat cards config --- */
  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems + stats.totalMedicines,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "Total Value",
      value: `Rs. ${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  /* ============================== RENDER ============================== */

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage hospital inventory items, medicines and stock transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the hospital inventory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Name *</Label>
                    <Input
                      id="item-name"
                      value={itemForm.name}
                      onChange={(e) => updateItem("name", e.target.value)}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-sku">SKU</Label>
                    <Input
                      id="item-sku"
                      value={itemForm.sku}
                      onChange={(e) => updateItem("sku", e.target.value)}
                      placeholder="SKU code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category *</Label>
                  <Select
                    value={itemForm.categoryId}
                    onValueChange={(v) => updateItem("categoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item-desc">Description</Label>
                  <Input
                    id="item-desc"
                    value={itemForm.description}
                    onChange={(e) => updateItem("description", e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-unit">Unit</Label>
                    <Input
                      id="item-unit"
                      value={itemForm.unit}
                      onChange={(e) => updateItem("unit", e.target.value)}
                      placeholder="pcs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-qty">Quantity</Label>
                    <Input
                      id="item-qty"
                      type="number"
                      value={itemForm.quantity}
                      onChange={(e) => updateItem("quantity", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Unit Price</Label>
                    <Input
                      id="item-price"
                      type="number"
                      value={itemForm.unitPrice}
                      onChange={(e) => updateItem("unitPrice", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-min">Min Stock</Label>
                    <Input
                      id="item-min"
                      type="number"
                      value={itemForm.minStock}
                      onChange={(e) => updateItem("minStock", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-max">Max Stock</Label>
                    <Input
                      id="item-max"
                      type="number"
                      value={itemForm.maxStock}
                      onChange={(e) => updateItem("maxStock", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-supplier">Supplier</Label>
                    <Input
                      id="item-supplier"
                      value={itemForm.supplier}
                      onChange={(e) => updateItem("supplier", e.target.value)}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-location">Storage Location</Label>
                    <Input
                      id="item-location"
                      value={itemForm.storageLocation}
                      onChange={(e) =>
                        updateItem("storageLocation", e.target.value)
                      }
                      placeholder="e.g. Shelf A-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Item"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
            <DialogTrigger asChild>
              <Button variant="gradient" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Medicine</DialogTitle>
                <DialogDescription>
                  Add a new medicine to the pharmacy inventory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMedicine} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">Name *</Label>
                    <Input
                      id="med-name"
                      value={medForm.name}
                      onChange={(e) => updateMed("name", e.target.value)}
                      placeholder="Medicine name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-generic">Generic Name</Label>
                    <Input
                      id="med-generic"
                      value={medForm.genericName}
                      onChange={(e) => updateMed("genericName", e.target.value)}
                      placeholder="Generic name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-manufacturer">Manufacturer</Label>
                    <Input
                      id="med-manufacturer"
                      value={medForm.manufacturer}
                      onChange={(e) =>
                        updateMed("manufacturer", e.target.value)
                      }
                      placeholder="Manufacturer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-dosage">Dosage Form *</Label>
                    <Select
                      value={medForm.dosageForm}
                      onValueChange={(v) => updateMed("dosageForm", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOSAGE_FORMS.map((form) => (
                          <SelectItem key={form} value={form}>
                            {form}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-strength">Strength *</Label>
                    <Input
                      id="med-strength"
                      value={medForm.strength}
                      onChange={(e) => updateMed("strength", e.target.value)}
                      placeholder="e.g. 500mg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-batch">Batch Number</Label>
                    <Input
                      id="med-batch"
                      value={medForm.batchNumber}
                      onChange={(e) => updateMed("batchNumber", e.target.value)}
                      placeholder="Batch #"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-price">Price *</Label>
                    <Input
                      id="med-price"
                      type="number"
                      value={medForm.price}
                      onChange={(e) => updateMed("price", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-stock">Stock *</Label>
                    <Input
                      id="med-stock"
                      type="number"
                      value={medForm.stock}
                      onChange={(e) => updateMed("stock", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-minstock">Min Stock</Label>
                    <Input
                      id="med-minstock"
                      type="number"
                      value={medForm.minStock}
                      onChange={(e) => updateMed("minStock", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-mfgdate">Manufacture Date</Label>
                    <Input
                      id="med-mfgdate"
                      type="date"
                      value={medForm.manufactureDate}
                      onChange={(e) =>
                        updateMed("manufactureDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-expiry">Expiry Date *</Label>
                    <Input
                      id="med-expiry"
                      type="date"
                      value={medForm.expiryDate}
                      onChange={(e) => updateMed("expiryDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-prescription">
                    Requires Prescription
                  </Label>
                  <Select
                    value={medForm.requiresPrescription}
                    onValueChange={(v) =>
                      updateMed("requiresPrescription", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Medicine"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ---- Stat Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
              )}
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Tabs ---- */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items" className="gap-2">
            <Package className="h-4 w-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="medicines" className="gap-2">
            <Pill className="h-4 w-4" />
            Medicines
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* ==================== ITEMS TAB ==================== */}
        <TabsContent value="items" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name or SKU..."
                className="pl-9"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
            </div>
            <Select
              value={itemCategoryFilter}
              onValueChange={setItemCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No inventory items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card key={item._id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-blue-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{item.name}</p>
                          {item.sku && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {item.sku}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {categoryName(item.categoryId)}
                          {item.supplier && ` | ${item.supplier}`}
                          {item.storageLocation &&
                            ` | ${item.storageLocation}`}
                        </p>
                      </div>

                      {/* Stock info */}
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Qty</p>
                          <p className="font-semibold">
                            {item.quantity}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              {item.unit}
                            </span>
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            Min / Max
                          </p>
                          <p className="text-sm">
                            {item.minStock} / {item.maxStock}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            Unit Price
                          </p>
                          <p className="text-sm font-medium">
                            Rs. {item.unitPrice.toLocaleString()}
                          </p>
                        </div>
                        {statusBadge(item.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ==================== MEDICINES TAB ==================== */}
        <TabsContent value="medicines" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medicines by name or generic name..."
                className="pl-9"
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
              />
            </div>
            <Select
              value={medDosageFilter}
              onValueChange={setMedDosageFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Dosage Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Forms</SelectItem>
                {DOSAGE_FORMS.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medicine cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-16">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedicines.map((med) => {
                const expiring = isExpiringSoon(med.expiryDate);
                const expired = new Date(med.expiryDate) < new Date();
                return (
                  <Card key={med._id} className="card-hover">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-9 w-9 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
                          <Pill className="h-5 w-5 text-purple-500" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {med.dosageForm}
                        </Badge>
                      </div>

                      <h3 className="font-semibold truncate mb-0.5">
                        {med.name}
                      </h3>
                      {med.genericName && (
                        <p className="text-xs text-muted-foreground mb-2 truncate">
                          {med.genericName}
                        </p>
                      )}

                      <div className="space-y-1.5 text-sm">
                        {med.manufacturer && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mfr</span>
                            <span className="truncate ml-2 font-medium">
                              {med.manufacturer}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Strength
                          </span>
                          <span className="font-medium">{med.strength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-medium">
                            Rs. {med.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock</span>
                          <span
                            className={`font-medium ${
                              med.stock <= med.minStock
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {med.stock}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Expiry
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              expired
                                ? "text-red-600"
                                : expiring
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {expired && (
                              <ShieldAlert className="inline h-3 w-3 mr-1" />
                            )}
                            {expiring && !expired && (
                              <AlertTriangle className="inline h-3 w-3 mr-1" />
                            )}
                            {formatDate(med.expiryDate)}
                          </span>
                        </div>
                        {med.requiresPrescription && (
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs w-full justify-center"
                          >
                            Prescription Required
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ==================== TRANSACTIONS TAB ==================== */}
        <TabsContent value="transactions" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
              <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No transactions recorded yet
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border"
                    >
                      {/* Icon */}
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === "StockIn" || tx.type === "Return"
                            ? "bg-green-50 dark:bg-green-950/30"
                            : tx.type === "StockOut" || tx.type === "Expired"
                            ? "bg-red-50 dark:bg-red-950/30"
                            : "bg-blue-50 dark:bg-blue-950/30"
                        }`}
                      >
                        <ArrowUpDown
                          className={`h-4 w-4 ${
                            tx.type === "StockIn" || tx.type === "Return"
                              ? "text-green-500"
                              : tx.type === "StockOut" || tx.type === "Expired"
                              ? "text-red-500"
                              : "text-blue-500"
                          }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {tx.itemId?.name ||
                            tx.medicineId?.name ||
                            "Unknown Item"}
                        </p>
                        {tx.reason && (
                          <p className="text-xs text-muted-foreground truncate">
                            {tx.reason}
                          </p>
                        )}
                      </div>

                      {/* Type badge */}
                      <div className="shrink-0">
                        {transactionTypeBadge(tx.type)}
                      </div>

                      {/* Quantity */}
                      <div className="text-center shrink-0 min-w-[60px]">
                        <p className="text-xs text-muted-foreground">Qty</p>
                        <p
                          className={`font-semibold ${
                            tx.type === "StockIn" || tx.type === "Return"
                              ? "text-green-600"
                              : tx.type === "StockOut" || tx.type === "Expired"
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {tx.type === "StockIn" || tx.type === "Return"
                            ? "+"
                            : tx.type === "StockOut" || tx.type === "Expired"
                            ? "-"
                            : ""}
                          {tx.quantity}
                        </p>
                      </div>

                      {/* Performed by */}
                      <div className="text-right shrink-0 min-w-[100px]">
                        {tx.performedBy && (
                          <p className="text-xs text-muted-foreground">
                            {tx.performedBy.firstName}{" "}
                            {tx.performedBy.lastName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.transactionDate || tx.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
