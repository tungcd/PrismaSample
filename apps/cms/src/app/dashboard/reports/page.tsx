"use client";

import { useEffect, useState } from "react";
import { ReportSummaryCards } from "@/components/reports/report-summary-cards";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { TopProductsTable } from "@/components/reports/top-products-table";
import { PeakHoursChart } from "@/components/reports/peak-hours-chart";
import {
  getSummaryStatsAction,
  getRevenueStatsAction,
  getTopProductsAction,
  getPeakHoursAction,
} from "./actions";
import {
  RevenueStatsEntity,
  TopProductEntity,
  PeakHoursEntity,
  SummaryStatsEntity,
} from "@/domain/entities/report.entity";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ReportsPage() {
  const [summaryStats, setSummaryStats] = useState<SummaryStatsEntity | null>(
    null,
  );
  const [revenueStats, setRevenueStats] = useState<RevenueStatsEntity | null>(
    null,
  );
  const [topProducts, setTopProducts] = useState<TopProductEntity[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHoursEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, revenueRes, productsRes, hoursRes] = await Promise.all(
        [
          getSummaryStatsAction(),
          getRevenueStatsAction({ period: "daily" }),
          getTopProductsAction({ limit: 10 }),
          getPeakHoursAction({}),
        ],
      );

      if (!summaryRes.success) {
        throw new Error(summaryRes.error);
      }

      setSummaryStats(summaryRes.data);
      setRevenueStats(revenueRes.data);
      setTopProducts(productsRes.data);
      setPeakHours(hoursRes.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePeriodChange = async (period: "daily" | "weekly" | "monthly") => {
    const revenueRes = await getRevenueStatsAction({ period });
    setRevenueStats(revenueRes.data);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Báo cáo</h2>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Báo cáo</h2>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Báo cáo</h2>
      </div>

      <div className="space-y-4">
        {summaryStats && <ReportSummaryCards stats={summaryStats} />}

        {revenueStats && (
          <RevenueChart
            initialData={revenueStats}
            onPeriodChange={handlePeriodChange}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {topProducts.length > 0 && (
            <TopProductsTable products={topProducts} />
          )}
          {peakHours.length > 0 && <PeakHoursChart data={peakHours} />}
        </div>
      </div>
    </div>
  );
}
