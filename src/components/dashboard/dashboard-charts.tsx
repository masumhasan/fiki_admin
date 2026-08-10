"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";

type ChartProps = { className?: string };

function useChart(option: echarts.EChartsOption) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    const chart = echarts.init(elementRef.current, undefined, {
      renderer: "canvas",
    });
    chart.setOption(option);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return elementRef;
}

const axisLabel = { color: "#7c8799", fontSize: 11 };
const splitLine = { lineStyle: { color: "#e5e9ee", type: "dashed" as const } };

export function WeeklyTripChart({ className }: ChartProps) {
  const ref = useChart({
    animationDuration: 700,
    color: ["#173d76", "#f5ad00"],
    grid: { left: 38, right: 12, top: 16, bottom: 28 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0b2348",
      borderWidth: 0,
      textStyle: { color: "#fff", fontSize: 12 },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLabel,
      axisLine: { lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 80,
      interval: 20,
      axisLabel,
      axisLine: { show: true, lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
      splitLine,
    },
    series: [
      {
        name: "Total Trips",
        type: "line",
        smooth: 0.35,
        symbol: "none",
        data: [48, 62, 56, 68, 77, 45, 36],
        lineStyle: { width: 2.5, color: "#173d76" },
      },
      {
        name: "Completed",
        type: "line",
        smooth: 0.35,
        symbol: "none",
        data: [42, 55, 49, 63, 71, 39, 30],
        lineStyle: { width: 2.5, color: "#f5ad00" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(245,173,0,.25)" },
            { offset: 1, color: "rgba(245,173,0,0)" },
          ]),
        },
      },
    ],
  });
  return (
    <div
      aria-label="Weekly trip volume chart"
      className={className}
      ref={ref}
      role="img"
    />
  );
}

export function DriverPerformanceChart({ className }: ChartProps) {
  const ref = useChart({
    animationDuration: 700,
    grid: { left: 40, right: 10, top: 14, bottom: 38 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: "{b}<br/>Completed trips: <b>{c}</b>",
    },
    xAxis: {
      type: "category",
      data: ["Marcus W.", "Aisha P.", "Robert T.", "Linda C.", "James M."],
      axisLabel: { ...axisLabel, interval: 0 },
      axisLine: { lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 30,
      interval: 10,
      axisLabel,
      axisLine: { show: true, lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
      splitLine,
    },
    series: [
      {
        type: "bar",
        data: [24, 21, 18, 22, 19],
        barMaxWidth: 38,
        itemStyle: { color: "#f9b310", borderRadius: [5, 5, 0, 0] },
      },
    ],
  });
  return (
    <div
      aria-label="Driver performance chart"
      className={className}
      ref={ref}
      role="img"
    />
  );
}
