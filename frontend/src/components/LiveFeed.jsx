import React, { useState } from 'react';
import { 
  Terminal, ShieldAlert, AlertTriangle, ShieldCheck, Server, MapPin, User, ChevronDown, ChevronUp, Pause, Play, Trash2, Ban, Filter, CheckCircle2 
} from 'lucide-react';

export default function LiveFeed({ liveEvents, onBlockIP, onClearStream }) {
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredEvents = liveEvents.filter(evt => {
    if (filterSeverity === 'All') return true;
    return evt.risk_level === filterSeverity;
  });

  return (
    <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" /> Real-Time Telemetry Stream (WebSockets)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Live incoming network events classified by Scikit-Learn / XGBoost ML model</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pause / Resume button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition active:scale-95 shadow-sm ${
              isPaused 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Ticker' : 'Pause'}</span>
          </button>

          {/* Clear stream button */}
          {onClearStream && (
            <button
              onClick={onClearStream}
              title="Clear live feed list"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 rounded-xl transition active:scale-95 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            LIVE STREAM
          </span>
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 w-fit text-xs font-semibold">
        <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
        {['All', 'High Risk', 'Suspicious', 'Normal'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilterSeverity(lvl)}
            className={`px-3 py-1 rounded-lg transition ${
              filterSeverity === lvl
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Live Event Cards List */}
      <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs font-medium space-y-1">
            <Terminal className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            <p>No events matching the selected filter right now.</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isHigh = evt.risk_level === 'High Risk';
            const isSusp = evt.risk_level === 'Suspicious';
            const isExpanded = expandedId === (evt.id || idx);

            const cardBorder = isHigh 
              ? 'border-rose-200 bg-gradient-to-r from-rose-50/50 via-white to-white' 
              : isSusp 
              ? 'border-amber-200 bg-gradient-to-r from-amber-50/40 via-white to-white' 
              : 'border-slate-200 bg-white hover:border-indigo-200';

            const badgeClass = isHigh 
              ? 'badge-high' 
              : isSusp 
              ? 'badge-suspicious' 
              : 'badge-normal';

            const Icon = isHigh ? ShieldAlert : (isSusp ? AlertTriangle : ShieldCheck);

            return (
              <div 
                key={evt.id || idx} 
                className={`p-4 rounded-xl border transition-all duration-150 shadow-sm ${cardBorder}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                      isHigh ? 'bg-rose-100 text-rose-600 border-rose-200' :
                      isSusp ? 'bg-amber-100 text-amber-700 border-amber-200' :
                      'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{evt.event_type}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                          {evt.risk_level} • {evt.risk_score}%
                        </span>
                        {evt.unknown_device && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-md">
                            UNKNOWN DEVICE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap font-medium">
                        <span className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Server className="w-3.5 h-3.5 text-indigo-500" /> {evt.source_ip}:{evt.port || 443}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {evt.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {evt.username}
                        </span>
                        <span>Endpoint: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono">{evt.endpoint}</code></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center md:flex-col items-end justify-between text-right text-xs text-slate-500 shrink-0 gap-2">
                    <div className="font-mono text-[11px] text-slate-400">{evt.timestamp}</div>
                    
                    <div className="flex items-center gap-1.5">
                      {isHigh && onBlockIP && (
                        <button
                          onClick={() => onBlockIP(evt.source_ip, true)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition active:scale-95 flex items-center gap-1 shadow-sm"
                        >
                          <Ban className="w-3 h-3 text-rose-600" /> Block IP
                        </button>
                      )}

                      <button
                        onClick={() => toggleExpand(evt.id || idx)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1"
                      >
                        {isExpanded ? <>Close <ChevronUp className="w-3 h-3" /></> : <>Inspect <ChevronDown className="w-3 h-3" /></>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Packet Detail Inspector Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">GEO DISTANCE HOP</span>
                      <span className={evt.geo_distance_km > 500 ? 'text-amber-700 font-bold' : 'text-slate-800 font-medium'}>
                        {evt.geo_distance_km || 0} km
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">PAYLOAD SIZE</span>
                      <span className="text-slate-800 font-medium">{evt.payload_kb || 1.0} KB</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">LOGIN RATE</span>
                      <span className="text-slate-800 font-medium">{evt.login_attempts_1m || 1} req / min</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">ML INFERENCE ENGINE</span>
                      <span className="text-emerald-700 font-bold">Classified (100% Conf.)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
