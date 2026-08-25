import React from 'react';
import { 
  Shield, Cpu, Network, Database, Lock, Terminal, Activity, Zap, CheckCircle2, Server, Globe, Sparkles, Layers, RefreshCw 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Hero Header */}
      <div className="card-light rounded-3xl p-8 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border border-indigo-100 text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Real-Time Machine Learning Security Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
          About the SHADOW Platform
        </h2>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 leading-relaxed">
          SHADOW is an end-to-end full-stack cybersecurity platform designed to monitor login telemetry, classify suspicious network behavior in real time using Machine Learning, and neutralize threats before lateral movement occurs.
        </p>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-3 shadow-sm hover:border-indigo-200 transition">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl w-fit">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ML Anomaly Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utilizes Random Forest & XGBoost classifiers to extract multi-dimensional behavioral features and predict risk scores ($0\% - 100\%$) with sub-millisecond inference latency.
          </p>
        </div>

        <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-3 shadow-sm hover:border-blue-200 transition">
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl w-fit">
            <Network className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Real-Time WebSockets</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Full-duplex WebSocket connection streams live classified events instantly from FastAPI to connected React dashboards with zero polling overhead.
          </p>
        </div>

        <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-3 shadow-sm hover:border-purple-200 transition">
          <div className="p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Automated Firewall Action</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Maintains real-time IP threat reputations and empowers SOC operators to quarantine or whitelist malicious threat actors with one click.
          </p>
        </div>
      </div>

      {/* Behavioral Feature Engineering Pipeline */}
      <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" /> Behavioral Feature Engineering Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-1">Multi-factor telemetry parameters analyzed on every authentication packet</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold">
              <Activity className="w-4 h-4" /> Login Frequency & Bursts
            </div>
            <p className="text-slate-600 text-xs">
              Monitors request velocity per 60-second sliding window to immediately pinpoint brute-force password spraying and credential stuffing attempts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-bold">
              <Globe className="w-4 h-4" /> Impossible Travel Geolocation
            </div>
            <p className="text-slate-600 text-xs">
              Calculates geographical distance $\Delta km$ and timestamp delta between sequential logins to detect account takeover via VPN or proxy tunnels.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-bold">
              <Server className="w-4 h-4" /> Suspicious Port & Protocol Probing
            </div>
            <p className="text-slate-600 text-xs">
              Flags unauthorized connection attempts on sensitive ports (SSH 22, RDP 3389, SMB 445, Alt-HTTP 8080) for reconnaissance identification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-700 font-bold">
              <Zap className="w-4 h-4" /> Payload Exfiltration Analysis
            </div>
            <p className="text-slate-600 text-xs">
              Evaluates packet transfer byte size distributions to differentiate between standard JSON requests and database dump exfiltrations.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" /> Full-Stack Architecture Specifications
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 font-bold text-[10px] uppercase">FRONTEND</div>
            <div className="text-slate-900 font-bold mt-1">React 18 + Vite</div>
            <div className="text-indigo-600 text-[11px] font-medium">Tailwind + Recharts</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 font-bold text-[10px] uppercase">BACKEND</div>
            <div className="text-slate-900 font-bold mt-1">Python FastAPI</div>
            <div className="text-indigo-600 text-[11px] font-medium">Uvicorn + WebSockets</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 font-bold text-[10px] uppercase">AI ENGINE</div>
            <div className="text-slate-900 font-bold mt-1">Scikit-Learn</div>
            <div className="text-indigo-600 text-[11px] font-medium">RandomForest / XGBoost</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 font-bold text-[10px] uppercase">DATA TIER</div>
            <div className="text-slate-900 font-bold mt-1">SQLAlchemy ORM</div>
            <div className="text-indigo-600 text-[11px] font-medium">SQLite / PostgreSQL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
