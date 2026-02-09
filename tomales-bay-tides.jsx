import { useState, useMemo } from "react";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
  Bar,
} from "recharts";

const TIDE_DATA = [
  { day: 1, dow: "Sun", amHigh: [10,10,5.9], pmHigh: null, amLow: [4,37,2.3], pmLow: [5,32,-1.1], rise:"7:11 AM", set:"5:34 PM", riseH:7.197, setH:17.579, dayLen:"10h 22m", moon:"waxing-crescent" },
  { day: 2, dow: "Mon", amHigh: [12,5,4.6], pmHigh: [11,0,5.7], amLow: [5,28,2.0], pmLow: [6,11,-0.9], rise:"7:10 AM", set:"5:35 PM", riseH:7.182, setH:17.598, dayLen:"10h 24m", moon:"waxing-crescent" },
  { day: 3, dow: "Tue", amHigh: [12,40,4.7], pmHigh: [11,48,5.3], amLow: [6,18,1.8], pmLow: [6,48,-0.5], rise:"7:10 AM", set:"5:36 PM", riseH:7.167, setH:17.616, dayLen:"10h 26m", moon:"waxing-crescent" },
  { day: 4, dow: "Wed", amHigh: [1,13,4.8], pmHigh: [12,36,4.8], amLow: [7,8,1.6], pmLow: [7,23,0.0], rise:"7:09 AM", set:"5:38 PM", riseH:7.152, setH:17.634, dayLen:"10h 28m", moon:"waxing-crescent" },
  { day: 5, dow: "Thu", amHigh: [1,46,4.8], pmHigh: [1,25,4.3], amLow: [7,59,1.4], pmLow: [7,57,0.6], rise:"7:08 AM", set:"5:39 PM", riseH:7.136, setH:17.652, dayLen:"10h 31m", moon:"first-quarter" },
  { day: 6, dow: "Fri", amHigh: [2,17,4.8], pmHigh: [2,20,3.8], amLow: [8,52,1.3], pmLow: [8,32,1.2], rise:"7:07 AM", set:"5:40 PM", riseH:7.119, setH:17.671, dayLen:"10h 33m", moon:"first-quarter" },
  { day: 7, dow: "Sat", amHigh: [2,50,4.8], pmHigh: [3,28,3.3], amLow: [9,51,1.2], pmLow: [9,10,1.9], rise:"7:06 AM", set:"5:41 PM", riseH:7.102, setH:17.689, dayLen:"10h 35m", moon:"first-quarter" },
  { day: 8, dow: "Sun", amHigh: [3,26,4.8], pmHigh: [5,3,3.1], amLow: [10,56,1.1], pmLow: [9,56,2.5], rise:"7:05 AM", set:"5:42 PM", riseH:7.085, setH:17.708, dayLen:"10h 37m", moon:"first-quarter" },
  { day: 9, dow: "Mon", amHigh: [4,8,4.7], pmHigh: [7,8,3.1], amLow: null, pmLow: [12,6,0.9], rise:"7:04 AM", set:"5:43 PM", riseH:7.068, setH:17.726, dayLen:"10h 39m", moon:"waxing-gibbous" },
  { day: 10, dow: "Tue", amHigh: [4,59,4.7], pmHigh: [8,36,3.4], amLow: null, pmLow: [1,13,0.7], rise:"7:03 AM", set:"5:44 PM", riseH:7.050, setH:17.745, dayLen:"10h 41m", moon:"waxing-gibbous" },
  { day: 11, dow: "Wed", amHigh: [5,58,4.7], pmHigh: [9,24,3.6], amLow: [12,32,3.2], pmLow: [2,11,0.4], rise:"7:01 AM", set:"5:45 PM", riseH:7.032, setH:17.763, dayLen:"10h 43m", moon:"waxing-gibbous" },
  { day: 12, dow: "Thu", amHigh: [6,57,4.8], pmHigh: [9,58,3.8], amLow: [1,45,3.2], pmLow: [2,59,0.1], rise:"7:00 AM", set:"5:46 PM", riseH:7.014, setH:17.782, dayLen:"10h 46m", moon:"waxing-gibbous" },
  { day: 13, dow: "Fri", amHigh: [7,50,5.0], pmHigh: [10,27,3.9], amLow: [2,39,3.0], pmLow: [3,39,-0.1], rise:"6:59 AM", set:"5:47 PM", riseH:6.990, setH:17.800, dayLen:"10h 48m", moon:"full" },
  { day: 14, dow: "Sat", amHigh: [8,38,5.1], pmHigh: [10,53,4.0], amLow: [3,22,2.8], pmLow: [4,14,-0.3], rise:"6:58 AM", set:"5:49 PM", riseH:6.972, setH:17.818, dayLen:"10h 50m", moon:"full" },
  { day: 15, dow: "Sun", amHigh: [9,22,5.2], pmHigh: [11,17,4.1], amLow: [4,0,2.6], pmLow: [4,46,-0.5], rise:"6:57 AM", set:"5:50 PM", riseH:6.955, setH:17.835, dayLen:"10h 52m", moon:"full" },
  { day: 16, dow: "Mon", amHigh: [10,4,5.2], pmHigh: [11,42,4.3], amLow: [4,36,2.3], pmLow: [5,17,-0.5], rise:"6:56 AM", set:"5:51 PM", riseH:6.936, setH:17.852, dayLen:"10h 55m", moon:"full" },
  { day: 17, dow: "Tue", amHigh: [10,46,5.2], pmHigh: null, amLow: [5,13,2.0], pmLow: [5,46,-0.4], rise:"6:54 AM", set:"5:52 PM", riseH:6.916, setH:17.870, dayLen:"10h 57m", moon:"full" },
  { day: 18, dow: "Wed", amHigh: [12,7,4.5], pmHigh: [11,29,5.0], amLow: [5,52,1.6], pmLow: [6,17,-0.2], rise:"6:53 AM", set:"5:53 PM", riseH:6.896, setH:17.888, dayLen:"10h 59m", moon:"waning-gibbous" },
  { day: 19, dow: "Thu", amHigh: [12,34,4.7], pmHigh: [12,15,4.7], amLow: [6,34,1.3], pmLow: [6,48,0.2], rise:"6:52 AM", set:"5:54 PM", riseH:6.875, setH:17.905, dayLen:"11h 1m", moon:"waning-gibbous" },
  { day: 20, dow: "Fri", amHigh: [1,2,4.9], pmHigh: [1,6,4.3], amLow: [7,20,0.9], pmLow: [7,22,0.7], rise:"6:51 AM", set:"5:55 PM", riseH:6.854, setH:17.924, dayLen:"11h 4m", moon:"waning-gibbous" },
  { day: 21, dow: "Sat", amHigh: [1,33,5.1], pmHigh: [2,6,3.9], amLow: [8,12,0.7], pmLow: [7,58,1.4], rise:"6:49 AM", set:"5:56 PM", riseH:6.832, setH:17.941, dayLen:"11h 6m", moon:"third-quarter" },
  { day: 22, dow: "Sun", amHigh: [2,8,5.2], pmHigh: [3,22,3.5], amLow: [9,11,0.5], pmLow: [8,40,2.0], rise:"6:48 AM", set:"5:57 PM", riseH:6.810, setH:17.958, dayLen:"11h 8m", moon:"third-quarter" },
  { day: 23, dow: "Mon", amHigh: [2,51,5.2], pmHigh: [5,0,3.3], amLow: [10,20,0.3], pmLow: [9,34,2.6], rise:"6:47 AM", set:"5:58 PM", riseH:6.789, setH:17.975, dayLen:"11h 11m", moon:"third-quarter" },
  { day: 24, dow: "Tue", amHigh: [3,44,5.2], pmHigh: [6,50,3.4], amLow: [11,39,0.1], pmLow: [10,53,3.0], rise:"6:46 AM", set:"5:59 PM", riseH:6.768, setH:17.990, dayLen:"11h 13m", moon:"waning-crescent" },
  { day: 25, dow: "Wed", amHigh: [4,51,5.2], pmHigh: [8,9,3.6], amLow: null, pmLow: [12,58,-0.1], rise:"6:44 AM", set:"6:00 PM", riseH:6.746, setH:18.009, dayLen:"11h 15m", moon:"waning-crescent" },
  { day: 26, dow: "Thu", amHigh: [6,5,5.2], pmHigh: [9,2,3.9], amLow: [12,29,3.1], pmLow: [2,5,-0.4], rise:"6:43 AM", set:"6:01 PM", riseH:6.722, setH:18.027, dayLen:"11h 18m", moon:"waning-crescent" },
  { day: 27, dow: "Fri", amHigh: [7,16,5.3], pmHigh: [9,43,4.2], amLow: [1,49,2.8], pmLow: [3,1,-0.6], rise:"6:41 AM", set:"6:02 PM", riseH:6.699, setH:18.046, dayLen:"11h 20m", moon:"waning-crescent" },
  { day: 28, dow: "Sat", amHigh: [8,19,5.4], pmHigh: [10,20,4.4], amLow: [2,52,2.5], pmLow: [3,48,-0.7], rise:"6:40 AM", set:"6:03 PM", riseH:6.676, setH:18.063, dayLen:"11h 23m", moon:"new" },
];

function timeToDecimalHours(h, m) {
  return h + m / 60;
}

function formatTime(h, m) {
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${suffix}`;
}

function getMoonEmoji(phase) {
  const map = {
    "new": "\u{1F311}", "waxing-crescent": "\u{1F312}", "first-quarter": "\u{1F313}",
    "waxing-gibbous": "\u{1F314}", "full": "\u{1F315}", "waning-gibbous": "\u{1F316}",
    "third-quarter": "\u{1F317}", "waning-crescent": "\u{1F318}",
  };
  return map[phase] || "";
}

function buildTimeSeriesForDay(dayData) {
  const points = [];
  const { day, amHigh, pmHigh, amLow, pmLow } = dayData;
  if (amLow) points.push({ time: timeToDecimalHours(amLow[0], amLow[1]), height: amLow[2], type: "low", label: formatTime(amLow[0], amLow[1]) });
  if (amHigh) points.push({ time: timeToDecimalHours(amHigh[0], amHigh[1]), height: amHigh[2], type: "high", label: formatTime(amHigh[0], amHigh[1]) });
  if (pmLow) {
    const h = pmLow[0] < 12 ? pmLow[0] + 12 : pmLow[0];
    points.push({ time: timeToDecimalHours(h, pmLow[1]), height: pmLow[2], type: "low", label: formatTime(h, pmLow[1]) });
  }
  if (pmHigh) {
    const h = pmHigh[0] < 12 ? pmHigh[0] + 12 : pmHigh[0];
    points.push({ time: timeToDecimalHours(h, pmHigh[1]), height: pmHigh[2], type: "high", label: formatTime(h, pmHigh[1]) });
  }
  points.sort((a, b) => a.time - b.time);
  return points.map((p) => ({ x: (day - 1) * 24 + p.time, height: p.height, type: p.type, day, timeLabel: p.label }));
}

// Get all negative tide entries with context
function getNegativeTides() {
  return TIDE_DATA.map(d => {
    const lows = [];
    if (d.amLow && d.amLow[2] < 0) lows.push({ time: formatTime(d.amLow[0], d.amLow[1]), ft: d.amLow[2] });
    if (d.pmLow) {
      const h = d.pmLow[0] < 12 ? d.pmLow[0] + 12 : d.pmLow[0];
      if (d.pmLow[2] < 0) lows.push({ time: formatTime(h, d.pmLow[1]), ft: d.pmLow[2] });
    }
    if (lows.length === 0) return null;
    const lowestLow = lows.reduce((a, b) => a.ft < b.ft ? a : b);
    // Check if negative tide is during daylight
    const lowTimeH = lows[0].time.includes("PM") ? parseInt(lows[0].time) + 12 : parseInt(lows[0].time);
    const isDaylight = lowTimeH >= d.riseH && lowTimeH <= d.setH;
    return { ...d, negativeLows: lows, lowestFt: lowestLow.ft, lowestTime: lowestLow.time, isDaylight };
  }).filter(Boolean).sort((a, b) => a.lowestFt - b.lowestFt);
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const dayData = TIDE_DATA.find((t) => t.day === d.day);
  return (
    <div style={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#93c5fd" }}>
        Feb {d.day} ({dayData?.dow}) — {d.timeLabel}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: d.type === "high" ? "#60a5fa" : d.height < 0 ? "#ef4444" : "#f97316" }} />
        <span style={{ fontWeight: 600 }}>{d.type === "high" ? "High" : "Low"} Tide:</span>
        <span style={{ color: d.height < 0 ? "#fca5a5" : "#e2e8f0" }}>{d.height.toFixed(1)} ft</span>
      </div>
      {dayData && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8", display: "flex", flexDirection: "column", gap: 2 }}>
          <span>{getMoonEmoji(dayData.moon)} Moon: {dayData.moon.replace("-", " ")}</span>
          <span style={{ color: "#fbbf24" }}>Sunrise {dayData.rise} · Sunset {dayData.set}</span>
          <span>Daylight: {dayData.dayLen}</span>
        </div>
      )}
    </div>
  );
};

const DaylightBar = ({ data }) => {
  const minRise = 6.5;
  const maxSet = 18.5;
  const totalSpan = maxSet - minRise;
  const risePercent = ((data.riseH - minRise) / totalSpan) * 100;
  const daylightPercent = ((data.setH - data.riseH) / totalSpan) * 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <span style={{ fontSize: 11, color: "#fbbf24", width: 58, textAlign: "right", flexShrink: 0 }}>{data.rise}</span>
      <div style={{ flex: 1, height: 12, background: "#1e293b", borderRadius: 6, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: `${risePercent}%`, width: `${daylightPercent}%`, height: "100%",
          background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)", borderRadius: 6, opacity: 0.8,
        }} />
      </div>
      <span style={{ fontSize: 11, color: "#f59e0b", width: 58, flexShrink: 0 }}>{data.set}</span>
    </div>
  );
};

const DayDetailPanel = ({ dayData, onClose }) => {
  if (!dayData) return null;
  const entries = [];
  if (dayData.amHigh) entries.push({ label: "AM High", time: formatTime(dayData.amHigh[0], dayData.amHigh[1]), ft: dayData.amHigh[2], type: "high" });
  if (dayData.pmHigh) {
    const h = dayData.pmHigh[0] < 12 ? dayData.pmHigh[0] + 12 : dayData.pmHigh[0];
    entries.push({ label: "PM High", time: formatTime(h, dayData.pmHigh[1]), ft: dayData.pmHigh[2], type: "high" });
  }
  if (dayData.amLow) entries.push({ label: "AM Low", time: formatTime(dayData.amLow[0], dayData.amLow[1]), ft: dayData.amLow[2], type: "low" });
  if (dayData.pmLow) {
    const h = dayData.pmLow[0] < 12 ? dayData.pmLow[0] + 12 : dayData.pmLow[0];
    entries.push({ label: "PM Low", time: formatTime(h, dayData.pmLow[1]), ft: dayData.pmLow[2], type: "low" });
  }
  entries.sort((a, b) => a.time < b.time ? -1 : 1);
  const range = Math.max(...entries.map(e => e.ft)) - Math.min(...entries.map(e => e.ft));
  const hasNegative = entries.some(e => e.ft < 0);

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: hasNegative ? "1px solid rgba(239,68,68,0.4)" : "1px solid #334155" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>
            {dayData.dow}, Feb {dayData.day} {getMoonEmoji(dayData.moon)}
            {hasNegative && <span style={{ marginLeft: 8, fontSize: 12, background: "rgba(239,68,68,0.2)", color: "#fca5a5", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>Negative Tide</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#60a5fa", fontWeight: 600 }}>
            Range: {range.toFixed(1)} ft
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #475569", borderRadius: 6, color: "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Close</button>
        </div>
      </div>

      {/* Daylight bar */}
      <div style={{ marginBottom: 16, background: "#0f172a", borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Daylight — {dayData.dayLen}</div>
        <DaylightBar data={dayData} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {entries.map((e, i) => (
          <div key={i} style={{
            background: e.ft < 0 ? "rgba(239,68,68,0.1)" : e.type === "high" ? "rgba(96,165,250,0.1)" : "rgba(249,115,22,0.1)",
            border: `1px solid ${e.ft < 0 ? "rgba(239,68,68,0.3)" : e.type === "high" ? "rgba(96,165,250,0.3)" : "rgba(249,115,22,0.3)"}`,
            borderRadius: 8, padding: "10px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: e.ft < 0 ? "#fca5a5" : e.type === "high" ? "#93c5fd" : "#fdba74", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{e.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: e.ft < 0 ? "#fca5a5" : "#f1f5f9" }}>
              {e.ft.toFixed(1)}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8" }}> ft</span>
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{e.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TomalesBayTides() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState("month");

  const allPoints = useMemo(() => TIDE_DATA.flatMap(buildTimeSeriesForDay), []);
  const highPoints = allPoints.filter((p) => p.type === "high");
  const lowPoints = allPoints.filter((p) => p.type === "low");
  const negativeTides = useMemo(() => getNegativeTides(), []);

  const weekData = useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const s = w * 7 + 1, e = Math.min(s + 6, 28);
      weeks.push({
        label: `Feb ${s}\u2013${e}`,
        highs: highPoints.filter(p => p.day >= s && p.day <= e),
        lows: lowPoints.filter(p => p.day >= s && p.day <= e),
      });
    }
    return weeks;
  }, [highPoints, lowPoints]);

  const monthHighMax = Math.max(...highPoints.map(p => p.height));
  const monthLowMin = Math.min(...lowPoints.map(p => p.height));

  const dayBarData = TIDE_DATA.map(d => {
    const highs = [], lows = [];
    if (d.amHigh) highs.push(d.amHigh[2]);
    if (d.pmHigh) highs.push(d.pmHigh[2]);
    if (d.amLow) lows.push(d.amLow[2]);
    if (d.pmLow) lows.push(d.pmLow[2]);
    const maxH = highs.length ? Math.max(...highs) : 0;
    const minL = lows.length ? Math.min(...lows) : 0;
    return { day: d.day, dow: d.dow, maxHigh: maxH, minLow: minL, range: maxH - minL, moon: d.moon, hasNeg: minL < 0 };
  });

  const selectedDayData = selectedDay ? TIDE_DATA.find(d => d.day === selectedDay) : null;

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "24px 20px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: "#e2e8f0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #60a5fa, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Tomales Bay Entrance
          </h1>
          <div style={{ color: "#94a3b8", fontSize: 15, marginTop: 4 }}>Tide Chart — February 2026</div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Highest Tide", value: `${monthHighMax.toFixed(1)} ft`, color: "#60a5fa" },
            { label: "Lowest Tide", value: `${monthLowMin.toFixed(1)} ft`, color: "#ef4444" },
            { label: "Max Range", value: `${Math.max(...dayBarData.map(d => d.range)).toFixed(1)} ft`, color: "#34d399" },
            { label: "Sub-Zero Days", value: `${negativeTides.length}`, color: "#fbbf24" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#1e293b", borderRadius: 10, padding: "14px 12px", textAlign: "center", border: "1px solid #334155" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, marginTop: 4 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { key: "month", label: "Month Overview" },
            { key: "weekly", label: "Weekly Detail" },
            { key: "range", label: "Daily Range" },
            { key: "negative", label: "Best Low Tides" },
            { key: "daylight", label: "Daylight" },
          ].map((v) => (
            <button key={v.key} onClick={() => { setViewMode(v.key); setSelectedDay(null); }}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "1px solid",
                borderColor: viewMode === v.key ? (v.key === "negative" ? "#ef4444" : "#60a5fa") : "#475569",
                background: viewMode === v.key ? (v.key === "negative" ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.15)") : "#1e293b",
                color: viewMode === v.key ? (v.key === "negative" ? "#fca5a5" : "#93c5fd") : "#94a3b8",
                cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              }}>{v.label}</button>
          ))}
        </div>

        {/* Month Overview Chart */}
        {viewMode === "month" && (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "16px 12px 8px", border: "1px solid #334155", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 8, paddingLeft: 8 }}>
              Full Month — Tide Heights (click any point for details)
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="x" type="number" domain={[0, 27 * 24 + 24]}
                  ticks={Array.from({ length: 28 }, (_, i) => i * 24 + 12)}
                  tickFormatter={(v) => { const day = Math.floor(v / 24) + 1; return day <= 28 ? `${day}` : ""; }}
                  stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }}
                  label={{ value: "February 2026", position: "insideBottom", offset: -4, fontSize: 12, fill: "#64748b" }}
                />
                <YAxis domain={[-1.5, 6.5]} stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }}
                  label={{ value: "Height (ft)", angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.6} label={{ value: "0 ft", position: "right", fontSize: 10, fill: "#ef4444" }} />
                <Area data={highPoints} dataKey="height" type="monotone" fill="url(#highGrad)" stroke="#60a5fa" strokeWidth={2}
                  dot={{ r: 3, fill: "#60a5fa", stroke: "#1e293b", strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: "#93c5fd", stroke: "#1e293b", strokeWidth: 2, onClick: (_, e) => setSelectedDay(e?.payload?.day) }}
                />
                <Area data={lowPoints} dataKey="height" type="monotone" fill="url(#lowGrad)" stroke="#f97316" strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isNeg = payload.height < 0;
                    return <circle key={`dot-${payload.x}`} cx={cx} cy={cy} r={isNeg ? 5 : 3} fill={isNeg ? "#ef4444" : "#f97316"} stroke={isNeg ? "#fca5a5" : "#1e293b"} strokeWidth={isNeg ? 2 : 1} />;
                  }}
                  activeDot={{ r: 6, fill: "#fdba74", stroke: "#1e293b", strokeWidth: 2, onClick: (_, e) => setSelectedDay(e?.payload?.day) }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, paddingBottom: 4, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} /> High Tides
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", display: "inline-block" }} /> Low Tides
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} /> Below 0 ft
              </span>
            </div>
          </div>
        )}

        {/* Weekly Detail Charts */}
        {viewMode === "weekly" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
            {weekData.map((week, wi) => (
              <div key={wi} style={{ background: "#1e293b", borderRadius: 12, padding: "14px 12px 6px", border: "1px solid #334155" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#93c5fd", marginBottom: 6, paddingLeft: 8 }}>{week.label}</div>
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id={`highGrad${wi}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id={`lowGrad${wi}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="x" type="number" domain={[wi * 7 * 24, (wi + 1) * 7 * 24]}
                      ticks={Array.from({ length: 7 }, (_, i) => (wi * 7 + i) * 24 + 12)}
                      tickFormatter={(v) => { const day = Math.floor(v / 24) + 1; const d = TIDE_DATA.find(t => t.day === day); return d ? `${d.dow} ${day}` : `${day}`; }}
                      stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis domain={[-1.5, 6.5]} stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5} />
                    <Area data={week.highs} dataKey="height" type="monotone" fill={`url(#highGrad${wi})`} stroke="#60a5fa" strokeWidth={2}
                      dot={{ r: 4, fill: "#60a5fa", stroke: "#1e293b", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#93c5fd", stroke: "#1e293b", strokeWidth: 2, onClick: (_, e) => setSelectedDay(e?.payload?.day) }}
                    />
                    <Area data={week.lows} dataKey="height" type="monotone" fill={`url(#lowGrad${wi})`} stroke="#f97316" strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const isNeg = payload.height < 0;
                        return <circle key={`wdot-${payload.x}`} cx={cx} cy={cy} r={isNeg ? 5 : 4} fill={isNeg ? "#ef4444" : "#f97316"} stroke={isNeg ? "#fca5a5" : "#1e293b"} strokeWidth={isNeg ? 2 : 1} />;
                      }}
                      activeDot={{ r: 6, fill: "#fdba74", stroke: "#1e293b", strokeWidth: 2, onClick: (_, e) => setSelectedDay(e?.payload?.day) }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* Daily Range View */}
        {viewMode === "range" && (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: "16px 12px 8px", border: "1px solid #334155", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 8, paddingLeft: 8 }}>Daily Tide Range (click a bar for details)</div>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={dayBarData} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }}
                  label={{ value: "February 2026", position: "insideBottom", offset: -4, fontSize: 12, fill: "#64748b" }} />
                <YAxis domain={[-1.5, 6.5]} stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }}
                  label={{ value: "Height (ft)", angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748b" }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const td = TIDE_DATA.find(t => t.day === d.day);
                  return (
                    <div style={{ background: "#1e293b", border: "1px solid #475569", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 13 }}>
                      <div style={{ fontWeight: 700, color: "#93c5fd" }}>{d.dow}, Feb {d.day} {getMoonEmoji(d.moon)}</div>
                      <div><span style={{ color: "#60a5fa" }}>High:</span> {d.maxHigh.toFixed(1)} ft</div>
                      <div><span style={{ color: d.minLow < 0 ? "#ef4444" : "#f97316" }}>Low:</span> {d.minLow.toFixed(1)} ft</div>
                      <div><span style={{ color: "#34d399" }}>Range:</span> {d.range.toFixed(1)} ft</div>
                      {td && <div style={{ marginTop: 4, fontSize: 12, color: "#fbbf24" }}>Sunrise {td.rise} · Sunset {td.set}</div>}
                    </div>
                  );
                }} />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5} />
                <Bar dataKey="maxHigh" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.7} onClick={(d) => setSelectedDay(d.day)} style={{ cursor: "pointer" }} />
                <Bar dataKey="minLow" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.7} onClick={(d) => setSelectedDay(d.day)} style={{ cursor: "pointer" }} />
                <Line dataKey="range" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, paddingBottom: 4, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#60a5fa", display: "inline-block" }} /> Max High</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#f97316", display: "inline-block" }} /> Min Low</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 3, background: "#34d399", display: "inline-block" }} /> Range</span>
            </div>
          </div>
        )}

        {/* Negative/Best Low Tides View */}
        {viewMode === "negative" && (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid rgba(239,68,68,0.3)", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fca5a5", marginBottom: 4 }}>Best Low Tides (Below 0 ft)</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>Ranked by lowest tide height — ideal for tidepooling and beachcombing</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {negativeTides.map((d, i) => {
                const isTop3 = i < 3;
                return (
                  <button key={d.day} onClick={() => setSelectedDay(d.day)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      background: isTop3 ? "rgba(239,68,68,0.08)" : "#0f172a",
                      border: isTop3 ? "1px solid rgba(239,68,68,0.3)" : "1px solid #334155",
                      borderRadius: 10, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s",
                    }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: isTop3 ? "rgba(239,68,68,0.2)" : "rgba(100,116,139,0.2)",
                      color: isTop3 ? "#fca5a5" : "#94a3b8", fontWeight: 800, fontSize: 14,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>
                        {d.dow}, Feb {d.day} {getMoonEmoji(d.moon)}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {d.negativeLows.map(l => `${l.ft.toFixed(1)} ft at ${l.time}`).join(" · ")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#ef4444" }}>{d.lowestFt.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400 }}> ft</span></div>
                      <div style={{ fontSize: 11, color: d.isDaylight ? "#34d399" : "#fbbf24", marginTop: 2 }}>
                        {d.isDaylight ? "During daylight" : "Near sunset"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 16, padding: "12px 16px", background: "#0f172a", borderRadius: 8, fontSize: 13, color: "#94a3b8" }}>
              <strong style={{ color: "#fbbf24" }}>Tip:</strong> Feb 1–3 have the deepest negative tides near sunset. Feb 27–28 offer even better timing with lows in the mid-afternoon daylight. All sub-zero tides this month occur between 12:58 PM and 6:48 PM.
            </div>
          </div>
        )}

        {/* Daylight View */}
        {viewMode === "daylight" && (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>Daylight Hours</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
              Sunrise and sunset times — daylight grows from {TIDE_DATA[0].dayLen} to {TIDE_DATA[27].dayLen} through the month
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {TIDE_DATA.map(d => {
                const hasNeg = (d.pmLow && d.pmLow[2] < 0) || (d.amLow && d.amLow[2] < 0);
                return (
                  <button key={d.day} onClick={() => setSelectedDay(d.day)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                      background: hasNeg ? "rgba(239,68,68,0.05)" : "transparent",
                      border: selectedDay === d.day ? "1px solid #fbbf24" : "1px solid transparent",
                      borderRadius: 6, cursor: "pointer", width: "100%", textAlign: "left",
                    }}>
                    <div style={{ width: 60, fontSize: 12, color: hasNeg ? "#fca5a5" : "#94a3b8", fontWeight: 600, flexShrink: 0 }}>
                      {d.dow} {d.day}
                    </div>
                    <div style={{ flex: 1 }}>
                      <DaylightBar data={d} />
                    </div>
                    <div style={{ width: 58, fontSize: 11, color: "#64748b", textAlign: "right", flexShrink: 0 }}>
                      {d.dayLen}
                    </div>
                    {hasNeg && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, flexShrink: 0, width: 12 }}>*</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
              <span style={{ color: "#ef4444" }}>*</span> = day has negative tide
            </div>
          </div>
        )}

        {/* Day Detail Panel */}
        {selectedDay && (
          <div style={{ marginBottom: 16, marginTop: 8 }}>
            <DayDetailPanel dayData={selectedDayData} onClose={() => setSelectedDay(null)} />
          </div>
        )}

        {/* Calendar mini-grid */}
        <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: "1px solid #334155", marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>Tap a day for details</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#64748b", fontWeight: 600, paddingBottom: 4 }}>{d}</div>
            ))}
            {TIDE_DATA.map((d) => {
              const lows = [];
              if (d.amLow) lows.push(d.amLow[2]);
              if (d.pmLow) lows.push(d.pmLow[2]);
              const minL = lows.length ? Math.min(...lows) : 0;
              const hasNeg = minL < 0;

              return (
                <button key={d.day} onClick={() => setSelectedDay(d.day)}
                  style={{
                    background: selectedDay === d.day ? "rgba(96,165,250,0.3)"
                      : hasNeg ? "rgba(239,68,68,0.1)" : "rgba(96,165,250,0.05)",
                    border: selectedDay === d.day ? "1px solid #60a5fa"
                      : hasNeg ? "1px solid rgba(239,68,68,0.3)" : "1px solid #334155",
                    borderRadius: 8, padding: "6px 4px", cursor: "pointer", textAlign: "center", transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{d.day}</div>
                  <div style={{ fontSize: 10, color: hasNeg ? "#ef4444" : "#94a3b8", marginTop: 1, fontWeight: hasNeg ? 700 : 400 }}>
                    {minL.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{getMoonEmoji(d.moon)}</div>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, fontSize: 11, color: "#64748b" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "rgba(239,68,68,0.3)", marginRight: 4, verticalAlign: "middle" }} />Negative tide day</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#475569" }}>
          Data: USHarbors.com · Sunrise/Sunset: timeanddate.com · Tomales Bay entrance, CA
        </div>
      </div>
    </div>
  );
}