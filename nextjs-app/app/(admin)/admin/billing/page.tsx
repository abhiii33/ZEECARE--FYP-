"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Receipt, TrendingUp, CreditCard, AlertCircle } from "lucide-react";
import { getAllInvoices, getRevenueReport, createInvoice, updateInvoiceStatus } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  issueDate: string;
  dueDate: string;
}

interface RevenueReport {
  totalRevenue: number;
  pendingPayments: number;
  overdueCount: number;
  collectionRate: number;
  dailyBreakdown: Array<{
    date: string;
    revenue: number;
    invoiceCount: number;
  }>;
}

const invoiceStatusColorMap: Record<string, string> = {
  Paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [revenue, setRevenue] = useState<RevenueReport>({
    totalRevenue: 0,
    pendingPayments: 0,
    overdueCount: 0,
    collectionRate: 0,
    dailyBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("invoices");

  const fetchData = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter !== "All") params.status = statusFilter;

    Promise.all([getAllInvoices(params), getRevenueReport()])
      .then(([invoicesRes, revenueRes]) => {
        setInvoices(invoicesRes.data.invoices || invoicesRes.data || []);
        setRevenue(revenueRes.data.report || revenueRes.data || {
          totalRevenue: 0,
          pendingPayments: 0,
          overdueCount: 0,
          collectionRate: 0,
          dailyBreakdown: [],
        });
      })
      .catch(() => toast.error("Failed to load billing data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleMarkPaid = async (id: string) => {
    try {
      await updateInvoiceStatus(id, "Paid");
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === id ? { ...inv, status: "Paid" as const } : inv))
      );
      toast.success("Invoice marked as paid");
    } catch {
      toast.error("Failed to update invoice status");
    }
  };

  const handleCancelInvoice = async (id: string) => {
    try {
      await updateInvoiceStatus(id, "Cancelled");
      setInvoices((prev) =>
        prev.map((inv) => (inv._id === id ? { ...inv, status: "Cancelled" as const } : inv))
      );
      toast.success("Invoice cancelled");
    } catch {
      toast.error("Failed to cancel invoice");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(revenue.totalRevenue),
      subtitle: "This month",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(revenue.pendingPayments),
      subtitle: "Awaiting payment",
      icon: CreditCard,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "Overdue",
      value: revenue.overdueCount,
      subtitle: "Past due date",
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "Collection Rate",
      value: `${revenue.collectionRate}%`,
      subtitle: "Payment success",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
  ];

  const filteredInvoices = invoices.filter(
    (inv) => statusFilter === "All" || inv.status === statusFilter
  );

  const dailyTotal =
    revenue.dailyBreakdown.length > 0
      ? revenue.dailyBreakdown.reduce((sum, d) => sum + d.revenue, 0)
      : 0;
  const dailyAvg =
    revenue.dailyBreakdown.length > 0
      ? Math.round(dailyTotal / revenue.dailyBreakdown.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Revenue</h1>
          <p className="text-muted-foreground text-sm">
            Manage invoices, payments, and revenue reports
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => {
            createInvoice({})
              .then(() => {
                toast.success("Invoice created successfully");
                fetchData();
              })
              .catch(() => toast.error("Failed to create invoice"));
          }}
        >
          <Receipt className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {activeTab === "invoices" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Invoices ({filteredInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-16">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No invoices found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all"
                    >
                      {/* Invoice Icon */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                        <Receipt className="h-4 w-4" />
                      </div>

                      {/* Invoice Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <span className="text-muted-foreground text-sm">
                            {invoice.patient.firstName} {invoice.patient.lastName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>Issued: {formatDate(invoice.issueDate)}</span>
                          <span>Due: {formatDate(invoice.dueDate)}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <p className="text-lg font-semibold shrink-0">
                        {formatCurrency(invoice.totalAmount)}
                      </p>

                      {/* Status Badge */}
                      <Badge
                        className={cn(
                          "text-xs shrink-0",
                          invoiceStatusColorMap[invoice.status] || invoiceStatusColorMap.Pending
                        )}
                      >
                        {invoice.status}
                      </Badge>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {(invoice.status === "Pending" || invoice.status === "Overdue") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleMarkPaid(invoice._id)}
                            >
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleCancelInvoice(invoice._id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="mt-4">
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-green-50 dark:bg-green-950/30 p-2.5 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatCurrency(dailyTotal)}</p>
                  <p className="text-sm text-muted-foreground">Total Period Revenue</p>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{formatCurrency(dailyAvg)}</p>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-2.5 rounded-lg">
                      <Receipt className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{revenue.dailyBreakdown.length}</p>
                  <p className="text-sm text-muted-foreground">Days Reported</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Daily Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : revenue.dailyBreakdown.length === 0 ? (
                  <div className="text-center py-16">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {revenue.dailyBreakdown.map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl border hover:border-primary/30 transition-all"
                      >
                        <div>
                          <p className="font-medium">{formatDate(day.date)}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.invoiceCount} invoice{day.invoiceCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <p className="text-lg font-semibold">{formatCurrency(day.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
