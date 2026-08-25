import React, { useState } from 'react';
import { Search, Database, Download, Filter, FileText } from 'lucide-react';

export default function IncidentHistory({ events }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');

  const filteredEvents = events.filter((evt) => {
    const matchesRisk = filterRisk === 'All' || evt.risk_level === filterRisk;
    const matchesSearch = 
      evt.source_ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.username && evt.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (evt.country && evt.country.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesRisk && matchesSearch;
  });

  const exportCSV = () => {
    const headers = "Timestamp,Event Type,Source IP,Port,Username,Country,Risk Level,Risk Score\n";
    const rows = filteredEvents.map(e => 
      `"${e.timestamp}","${e.event_type}","${e.source_ip}",${e.port || 443},"${e.username}","${e.country}",${e.risk_level},${e.risk_score}%`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadow_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" /> Historical Security Incident Audit Logs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Searchable telemetry repository with classification signatures</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search IP, Event, User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 w-48 font-medium transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            {['All', 'Normal', 'Suspicious', 'High Risk'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterRisk === level 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            title="Download CSV audit report"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Event Signature</th>
              <th className="p-3">Source Socket</th>
              <th className="p-3">User Target</th>
              <th className="p-3">Origin Country</th>
              <th className="p-3">Risk Level</th>
              <th className="p-3 text-right">Anomaly Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-slate-400 font-medium">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No incident logs match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => {
                const isHigh = evt.risk_level === 'High Risk';
                const isSusp = evt.risk_level === 'Suspicious';

                const badgeClass = isHigh 
                  ? 'badge-high' 
                  : isSusp 
                  ? 'badge-suspicious' 
                  : 'badge-normal';

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{evt.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900">{evt.event_type}</td>
                    <td className="p-3 font-mono text-indigo-600 font-semibold">{evt.source_ip}:{evt.port || 443}</td>
                    <td className="p-3 text-slate-700 font-medium">{evt.username}</td>
                    <td className="p-3 text-slate-600">{evt.country}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeClass}`}>
                        {evt.risk_level}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-right">
                      <span className={isHigh ? 'text-rose-600' : isSusp ? 'text-amber-600' : 'text-emerald-600'}>
                        {evt.risk_score}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
