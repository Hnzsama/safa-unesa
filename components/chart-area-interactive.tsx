"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

// Generate realistic dynamic trend series up to today (Nov 2026)
function generateSarprasChartData() {
  const result = [];
  const baseDate = new Date("2026-11-06");
  for (let i = 90; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    
    // Weekend vs weekday pattern with random variance
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseReports = isWeekend ? 1 : 4;
    const masuk = Math.max(0, Math.floor(baseReports + Math.sin(i / 5) * 2 + (i % 3)));
    const selesai = Math.max(0, Math.min(masuk + 1, Math.floor(masuk * 0.85 + (i % 2))));

    result.push({
      date: dateStr,
      laporanMasuk: masuk,
      laporanSelesai: selesai,
    });
  }
  return result;
}

const chartData = generateSarprasChartData();

const chartConfig = {
  laporanMasuk: {
    label: "Laporan Masuk",
    color: "var(--primary)",
  },
  laporanSelesai: {
    label: "Penanganan Selesai",
    color: "oklch(0.696 0.17 162.48)", // Emerald / Green
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [selectedRange, setSelectedRange] = React.useState<string | null>(null);
  const timeRange = selectedRange ?? (isMobile ? "7d" : "90d");
  const setTimeRange = setSelectedRange;

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-11-06");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tren Penanganan Fasilitas Sarpras</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Statistik komparasi laporan masuk dan perbaikan tuntas
          </span>
          <span className="@[540px]/card:hidden">Laporan Masuk vs Selesai</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d");
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 Bulan Terakhir</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 Hari Terakhir</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 Hari Terakhir</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value);
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Pilih rentang waktu"
            >
              <SelectValue placeholder="3 Bulan Terakhir" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 Bulan Terakhir
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 Hari Terakhir
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 Hari Terakhir
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillSelesai" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(0.696 0.17 162.48)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.696 0.17 162.48)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="laporanMasuk"
              type="natural"
              fill="url(#fillMasuk)"
              stroke="var(--primary)"
              strokeWidth={2}
            />
            <Area
              dataKey="laporanSelesai"
              type="natural"
              fill="url(#fillSelesai)"
              stroke="oklch(0.696 0.17 162.48)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
