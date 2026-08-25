import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Shield, AlertTriangle, ShieldAlert, Cpu, Activity, Ban, Sparkles, Play, RotateCcw, Flame, Plane, Globe, ShieldCheck, CheckCircle2 
} from 'lucide-react';

export default function ThreatOverview({ stats, trendData, onSimulateAttack, onClearLogs }) {
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async (type) => {
    setSimulating(true);
    await onSimulateAttack(type);
    setSimulating(false);
  };

  const pieData = [
    { name: 'Normal Traffic', value: stats.normal_count || 0, color: '#10b981' },
    { name: 'Suspicious Activity', value: stats.suspicious_count || 0, color: '#f59e0b' },
    { name: 'Critical Threats', value: stats.high_risk_count || 0, color: '#f43f5e' },
  ];

  const highRisk = stats.high_risk_count || 0;
  const avgRisk = stats.avg_recent_risk_score || 0;

  let statusTitle = "Optimal Defense • Nominal Activity";
  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let statusCardBg = "bg-gradient-to-r from-emerald-50/70 via-white to-white border-emerald-200";

  if (highRisk > 50 || avgRisk > 60) {
    statusTitle = "Critical Defense Alert • Active Attack Burst Detected";
    statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
    statusCardBg = "bg-gradient-to-r from-rose-50/80 via-white to-white border-rose-200";
  } else if (highRisk > 10 || avgRisk > 35) {
    statusTitle = "Elevated Caution • Anomaly Ingestion Underway";
    statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
    statusCardBg = "bg-gradient-to-r from-amber-50/70 via-white to-white border-amber-200";
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Status Header */}
      <div className={`card-light rounded-2xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${statusCardBg}`}>
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${statusBadge}`}>
                {statusTitle}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Real-Time ML Inspection Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Multi-factor ML classifier continuously inspects login velocity, impossible geo-hops, device hashes, and port probes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <div className="text-center px-2">
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Avg Risk Load</div>
            <div className="text-lg font-extrabold text-indigo-600">{stats.avg_recent_risk_score || 0}%</div>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center px-2">
            <div className="text-[10px] text-slate-500 font-semibold uppercase">System Health</div>
            <div className="text-lg font-extrabold text-emerald-600">99.9%</div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sandbox Bar */}
      <div className="card-light rounded-2xl p-4 bg-white border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Interactive Attack Simulation Sandbox
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
              Live Test Control
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Click any attack scenario below to inject real-time telemetry and watch the ML engine react!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulate('normal')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simulate Normal Login</span>
          </button>

          <button
            onClick={() => handleSimulate('brute_force')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
            <span>Simulate Brute Force Attack</span>
          </button>

          <button
            onClick={() => handleSimulate('impossible_travel')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Plane className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Impossible Travel Anomaly</span>
          </button>

          <button
            onClick={() => handleSimulate('port_scan')}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-purple-600" />
            <span>Simulate Port Scan</span>
          </button>

          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition active:scale-95 ml-auto shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear & Reset Logs</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards in Clean Light UI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monitored Events */}
        <div className="card-light rounded-2xl p-5 border border-slate-200 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Total Monitored Events</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {(stats.total_events || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Streaming
              </p>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* High Risk Threats */}
        <div className="card-light rounded-2xl p-5 border border-rose-200 bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-rose-700">Critical Threat Attacks</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-1">
                {(stats.high_risk_count || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-2">
                <Flame className="w-3.5 h-3.5" /> Immediate SOC Attention
              </p>
            </div>
            <div className="p-3 bg-rose-100/70 border border-rose-200 rounded-xl text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Suspicious Anomalies */}
        <div className="card-light rounded-2xl p-5 border border-amber-200 bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-700">Suspicious Anomalies</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                {(stats.suspicious_count || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Monitored by ML Model
              </p>
            </div>
            <div className="p-3 bg-amber-100/70 border border-amber-200 rounded-xl text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Blocked Malicious IPs */}
        <div className="card-light rounded-2xl p-5 border border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-purple-700">Quarantined Firewall IPs</p>
              <h3 className="text-3xl font-extrabold text-purple-900 mt-1">
                {(stats.blocked_ips_count || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-purple-700 font-medium flex items-center gap-1 mt-2">
                <Ban className="w-3.5 h-3.5" /> Active Blocklist Rules
              </p>
            </div>
            <div className="p-3 bg-purple-100/70 border border-purple-200 rounded-xl text-purple-700">
              <Ban className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-Series Area Chart (Light UI) */}
        <div className="lg:col-span-2 card-light rounded-2xl p-6 bg-white border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Real-Time Threat Velocity Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Network event frequency classified by ML model over the last 30 minutes</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
              30-Min Real-Time Window
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="lightGradNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="lightGradSuspicious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="lightGradHighRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Area type="monotone" dataKey="Normal" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#lightGradNormal)" />
                <Area type="monotone" dataKey="Suspicious" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#lightGradSuspicious)" />
                <Area type="monotone" dataKey="High Risk" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#lightGradHighRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal Traffic
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Suspicious Anomalies
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical Attacks
            </span>
          </div>
        </div>

        {/* ML Risk Classification Pie Chart */}
        <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" /> ML Risk Classification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">XGBoost event classification distribution</p>
          </div>

          <div className="h-56 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Avg Risk Score:</span>
              <span className="text-indigo-600 font-extrabold text-sm">{stats.avg_recent_risk_score || 0}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Model Test Accuracy:</span>
              <span className="text-emerald-600 font-extrabold">100.0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
