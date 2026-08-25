import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, Flame, Ban, ArrowUpRight, CheckCheck } from 'lucide-react';

export default function ActiveAlerts({ alerts, onDismissAlert, onEscalateAlert, onBlockIP, onClearAllAlerts }) {
  return (
    <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4">
      {/* Header & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Active SOC Security Alerts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">High-priority alerts requiring manual review or automated defense triage</p>
        </div>

        <div className="flex items-center gap-2">
          {alerts.length > 0 && onClearAllAlerts && (
            <button
              onClick={onClearAllAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dismiss All Alerts</span>
            </button>
          )}

          <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
            {alerts.length} Active Alerts
          </span>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3.5">
        {alerts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs font-medium space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60 mb-2" />
            <p>✅ All security alerts resolved. Threat defense parameters operating nominally.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.risk_score >= 80 || alert.title.includes('ESCALATED');

            return (
              <div 
                key={alert.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-150"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-3 py-0.5 rounded-full ${
                      isCritical ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Flame className="w-3.5 h-3.5" /> {isCritical ? 'CRITICAL SEVERITY' : 'HIGH SEVERITY'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      Risk Score: {alert.risk_score}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-relaxed">{alert.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="text-slate-800 font-semibold">
                      Source IP: <code className="bg-slate-100 text-indigo-600 px-2 py-0.5 rounded border border-slate-200 font-mono text-xs font-bold">{alert.source_ip}</code>
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" /> {alert.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
                  {onBlockIP && (
                    <button
                      onClick={() => onBlockIP(alert.source_ip, true)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-1 transition active:scale-95 shadow-sm"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" /> Quarantine IP
                    </button>
                  )}

                  {onEscalateAlert && !alert.title.includes('ESCALATED') && (
                    <button
                      onClick={() => onEscalateAlert(alert.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 flex items-center gap-1 transition active:scale-95 shadow-sm"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" /> Escalate
                    </button>
                  )}

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-indigo-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Alert
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
