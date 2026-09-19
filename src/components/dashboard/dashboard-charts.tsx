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

export function WeeklyTripChart({ className, data = [] }: ChartProps & { data?: { date: string; total: number; completed: number }[] }) {
  const days = data.length > 0 ? data.map(d => d.date) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalData = data.length > 0 ? data.map(d => d.total) : [0, 0, 0, 0, 0, 0, 0];
  const completedData = data.length > 0 ? data.map(d => d.completed) : [0, 0, 0, 0, 0, 0, 0];
  
  // calculate max value for y-axis dynamically
  const maxTotal = Math.max(...totalData, 10);
  const yAxisMax = Math.ceil(maxTotal / 20) * 20;

  const ref = useChart({
    animationDuration: 700,
    color: ["#173d76", "#f5ad00"],
    grid: { left: 10, right: 10, top: 16, bottom: 24, containLabel: true },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0b2348",
      borderWidth: 0,
      textStyle: { color: "#fff", fontSize: 12 },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: days,
      axisLabel: { ...axisLabel, fontSize: 10 },
      axisLine: { lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: yAxisMax,
      interval: Math.max(10, yAxisMax / 5),
      axisLabel: { ...axisLabel, fontSize: 10 },
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
        data: totalData,
        lineStyle: { width: 2.5, color: "#0b2b58" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(11,43,88,.25)" },
            { offset: 1, color: "rgba(11,43,88,0)" },
          ]),
        },
      },
      {
        name: "Completed",
        type: "line",
        smooth: 0.35,
        symbol: "none",
        data: completedData,
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

export function DriverPerformanceChart({ className, data = [] }: ChartProps & { data?: { name: string; trips: number }[] }) {
  const driverNames = data.map(d => d.name);
  const tripCounts = data.map(d => d.trips);
  
  const maxTrips = tripCounts.length > 0 ? Math.max(...tripCounts, 10) : 10;
  const yAxisMax = Math.ceil(maxTrips / 10) * 10;

  const ref = useChart({
    animationDuration: 700,
    grid: { left: 10, right: 10, top: 14, bottom: 28, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: "{b}<br/>Completed trips: <b>{c}</b>",
    },
    xAxis: {
      type: "category",
      data: driverNames,
      axisLabel: {
        ...axisLabel,
        interval: 0,
        overflow: "truncate",
        width: 55,
        fontSize: 10,
      },
      axisLine: { lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: yAxisMax,
      interval: Math.max(10, yAxisMax / 5),
      axisLabel: { ...axisLabel, fontSize: 10 },
      axisLine: { show: true, lineStyle: { color: "#9aa3af" } },
      axisTick: { show: false },
      splitLine,
    },
    series: [
      {
        type: "bar",
        data: tripCounts,
        barMaxWidth: 34,
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
