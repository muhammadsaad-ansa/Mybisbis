import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  ArrowUpRight, 
  Sparkles, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface WeeklyComparisonData {
  day: string;
  shortDate: string;
  mingguLalu: number;
  mingguIni: number;
  growth: number;
}

const WEEKLY_COMPARISON_DATA: WeeklyComparisonData[] = [
  { day: 'Senin', shortDate: '18 Nov', mingguLalu: 1420, mingguIni: 1850, growth: 30.3 },
  { day: 'Selasa', shortDate: '19 Nov', mingguLalu: 1650, mingguIni: 2100, growth: 27.3 },
  { day: 'Rabu', shortDate: '20 Nov', mingguLalu: 1510, mingguIni: 1980, growth: 31.1 },
  { day: 'Kamis', shortDate: '21 Nov', mingguLalu: 1780, mingguIni: 2450, growth: 37.6 },
  { day: 'Jumat', shortDate: '22 Nov', mingguLalu: 2100, mingguIni: 2890, growth: 37.6 },
  { day: 'Sabtu', shortDate: '23 Nov', mingguLalu: 2400, mingguIni: 3450, growth: 43.8 },
  { day: 'Minggu', shortDate: '24 Nov', mingguLalu: 2250, mingguIni: 3120, growth: 38.7 },
];

export const WeeklyTrafficComparisonWidget: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'growth'>('bar');

  const summary = useMemo(() => {
    const totalLastWeek = WEEKLY_COMPARISON_DATA.reduce((acc, d) => acc + d.mingguLalu, 0);
    const totalThisWeek = WEEKLY_COMPARISON_DATA.reduce((acc, d) => acc + d.mingguIni, 0);
    const diff = totalThisWeek - totalLastWeek;
    const avgGrowth = ((diff / totalLastWeek) * 100).toFixed(1);
    return {
      totalLastWeek,
      totalThisWeek,
      diff,
      avgGrowth,
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 text-left shadow-xs space-y-5">
      {/* Header and Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              Komparasi Kinerja Mingguan
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Pertumbuhan +{summary.avgGrowth}%
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Visualisasi Tren Pertumbuhan Trafik Harian (Minggu Lalu vs Minggu Ini)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Perbandingan volume klik harian secara *side-by-side* untuk mengukur lonjakan trafik media sosial dan efektivitas kampanye tautan.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs self-start lg:self-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartType === 'bar'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Grafik Batang (Bar)</span>
          </button>
          <button
            onClick={() => setChartType('growth')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartType === 'growth'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tren Pertumbuhan (%)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 font-medium">Total Klik Minggu Lalu:</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
            {summary.totalLastWeek.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-400">Senin s.d. Minggu (Pekan Lalu)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
          <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">Total Klik Minggu Ini:</span>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-300 mt-0.5">
            {summary.totalThisWeek.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Pekan berjalan saat ini</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-between">
            <span>Selisih & Kenaikan:</span>
            <span className="font-mono font-bold">+{summary.avgGrowth}%</span>
          </span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 mt-0.5">
            +{summary.diff.toLocaleString('id-ID')} klik
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Peningkatan performa rujukan</span>
        </div>
      </div>

      {/* Recharts Bar / Comparison Chart */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={WEEKLY_COMPARISON_DATA}
            margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.18} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1', opacity: 0.4 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.toLocaleString('id-ID')}
            />
            <Tooltip content={<CustomWeeklyTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />

            {chartType === 'bar' ? (
              <>
                <Bar
                  dataKey="mingguLalu"
                  name="Minggu Lalu"
                  fill="#94A3B8"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="mingguIni"
                  name="Minggu Ini (Aktif)"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </>
            ) : (
              <Bar
                dataKey="growth"
                name="Pertumbuhan Harian (%)"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom Tooltip for Weekly Comparison
const CustomWeeklyTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data: WeeklyComparisonData = payload[0].payload;

  return (
    <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md text-xs space-y-2 min-w-[210px] text-left">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80">
        <div>
          <span className="font-bold text-white block">
            {data.day}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {data.shortDate}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          +{data.growth}% Kenaikan
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Minggu Lalu:</span>
          </span>
          <span className="font-mono font-semibold text-slate-200 tabular-nums">
            {data.mingguLalu.toLocaleString('id-ID')} klik
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-indigo-300 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Minggu Ini:</span>
          </span>
          <span className="font-mono font-bold text-indigo-300 tabular-nums text-sm">
            {data.mingguIni.toLocaleString('id-ID')} klik
          </span>
        </div>

        <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
          <span>Selisih Pertumbuhan:</span>
          <span className="font-mono">
            +{(data.mingguIni - data.mingguLalu).toLocaleString('id-ID')} klik
          </span>
        </div>
      </div>
    </div>
  );
};
