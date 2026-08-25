import React, { useState } from 'react';
import { Ban, ShieldCheck, MapPin, Globe, Search, Download, Filter, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SuspiciousIPs({ suspiciousIPs, onToggleBlock }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredIPs = suspiciousIPs.filter((ip) => {
    const matchesStatus = statusFilter === 'All' || ip.status === statusFilter;
    const matchesSearch = 
      ip.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ip.country && ip.country.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    const headers = "IP Address,Country,Max Risk Score,Attempt Count,Status\n";
    const rows = filteredIPs.map(ip => 
      `"${ip.ip_address}","${ip.country || 'Unknown'}",${ip.max_risk_score}%,${ip.attempt_count},"${ip.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadow_threat_ips_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-600" /> Suspicious & Blocked IP Directory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage real-time IP firewall quarantine rules & threat reputations</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search IP, Country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 w-44 font-medium transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            {['All', 'Blocked', 'Flagged'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition ${
                  statusFilter === st 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            title="Download CSV report of flagged IPs"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table in Light UI */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Threat Actor IP</th>
              <th className="p-3.5">Origin Country</th>
              <th className="p-3.5">Max Threat Score</th>
              <th className="p-3.5">Attempt Velocity</th>
              <th className="p-3.5">Firewall Status</th>
              <th className="p-3.5 text-right">Defense Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredIPs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                  No suspicious IPs match your criteria.
                </td>
              </tr>
            ) : (
              filteredIPs.map((ip) => {
                const isBlocked = ip.status === 'Blocked';
                const isHighRisk = ip.max_risk_score >= 70;

                return (
                  <tr key={ip.id} className="hover:bg-slate-50/80 transition duration-150">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isBlocked 
                          ? 'bg-rose-500 shadow-sm shadow-rose-500 animate-pulse' 
                          : 'bg-amber-500'
                      }`}></span>
                      <code className="text-indigo-600 font-mono text-xs font-bold">{ip.ip_address}</code>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {ip.country || 'Unknown'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold ${isHighRisk ? 'text-rose-600' : 'text-amber-600'}`}>
                          {ip.max_risk_score}%
                        </span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full rounded-full ${isHighRisk ? 'bg-rose-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, ip.max_risk_score)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                        {ip.attempt_count} incidents
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        isBlocked 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ip.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onToggleBlock(ip.ip_address, !isBlocked)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1.5 ml-auto shadow-sm ${
                          isBlocked
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-100'
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Unblock IP
                          </>
                        ) : (
                          <>
                            <Ban className="w-3.5 h-3.5" /> Block & Quarantine
                          </>
                        )}
                      </button>
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
