import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Key, Copy, Check, Shield, Sparkles, UserCheck, Trash2, AlertTriangle } from 'lucide-react';

export default function UserManagement({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('Senior Threat Analyst');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const data = await res.json();
        setUsers(data);
        return;
      }
      throw new Error('FallbackStaff');
    } catch (err) {
      const saved = localStorage.getItem('shadow_demo_users');
      if (saved) {
        setUsers(JSON.parse(saved));
      } else {
        const initialUsers = [
          { id: 1, username: 'harsha', email: 'harsha@shadow-defense.io', role: 'Chairman & Super Admin', password: 'harsha', created_at: '2026-08-25 00:00:00' },
          { id: 2, username: 'rahul.sharma', email: 'rahul.sharma@shadow-defense.io', role: 'Senior Threat Analyst', password: 'sh_92ka81', created_at: '2026-08-25 01:15:00' },
          { id: 3, username: 'priya.patel', email: 'priya.patel@shadow-defense.io', role: 'Lead SOC Engineer', password: 'sh_88xb29', created_at: '2026-08-25 01:20:00' },
          { id: 4, username: 'david.miller', email: 'david.miller@shadow-defense.io', role: 'Incident Response Officer', password: 'sh_41pl09', created_at: '2026-08-25 01:30:00' }
        ];
        setUsers(initialUsers);
        localStorage.setItem('shadow_demo_users', JSON.stringify(initialUsers));
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);

    const fallbackNames = [
      ["Sarah Jenkins", "sarah.jenkins", "Cyber Intelligence Specialist"],
      ["Vikram Reddy", "vikram.reddy", "Firewall Security Architect"],
      ["Elena Rostova", "elena.rostova", "Malware Forensics Lead"],
      ["Alex Rivera", "alex.rivera", "Cloud Security Engineer"],
      ["Ananya Sen", "ananya.sen", "Network Anomaly Analyst"]
    ];

    const pick = customName.trim() 
      ? [customName.trim(), customName.trim().toLowerCase().replace(/\s+/g, '.'), customRole]
      : fallbackNames[Math.floor(Math.random() * fallbackNames.length)];

    const randomPass = "sh_" + Math.random().toString(36).slice(2, 8);
    const newStaff = {
      id: Date.now(),
      username: pick[1],
      email: `${pick[1]}@shadow-defense.io`,
      role: customRole || pick[2],
      password: randomPass,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    try {
      const res = await fetch('/api/admin/generate-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName, role: customRole })
      });
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) {
        const data = await res.json();
        setCustomName('');
        fetchUsers();
        if (onShowToast) onShowToast(`🎉 Generated Login Credentials for ${data.credential.full_name} (${data.credential.username})!`);
      } else {
        throw new Error('DemoStorageStaff');
      }
    } catch (err) {
      setUsers(prev => {
        const updated = [newStaff, ...prev];
        localStorage.setItem('shadow_demo_users', JSON.stringify(updated));
        return updated;
      });
      setCustomName('');
      if (onShowToast) onShowToast(`🎉 Generated Login Credentials for ${pick[0]} (${newStaff.username})!`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (userObj) => {
    const credText = `Username: ${userObj.username}\nPassword: ${userObj.password}\nRole: ${userObj.role}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(userObj.id);
    if (onShowToast) onShowToast(`📋 Copied credentials for ${userObj.username}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRemoveStaff = async (userObj) => {
    if (userObj.username === 'harsha') {
      if (onShowToast) onShowToast("⚠️ Cannot delete Chairman Harsha super admin account!");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove staff member '${userObj.username}' (${userObj.role}) from the active directory?`)) {
      return;
    }

    setDeletingId(userObj.id);
    try {
      await fetch(`/api/admin/users/${userObj.id}`, { method: 'DELETE' });
    } catch (err) {}
    
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== userObj.id);
      localStorage.setItem('shadow_demo_users', JSON.stringify(updated));
      return updated;
    });
    if (onShowToast) onShowToast(`🗑️ Staff member '${userObj.username}' removed from directory.`);
    setDeletingId(null);
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="card-light rounded-3xl p-6 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                Staff & Operator Credentials Management
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                CHAIRMAN EXECUTIVE TOOL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate or remove real-name login credentials for SOC analysts, threat hunters, and security architects
            </p>
          </div>
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={generating}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{generating ? 'Generating...' : '1-Click Auto Generate Staff'}</span>
        </button>
      </div>

      {/* Custom Generation Form */}
      <div className="card-light rounded-2xl p-5 bg-white border border-slate-200 space-y-3 shadow-sm">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-indigo-600" /> Generate Specific Team Member Credentials
        </h4>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            placeholder="Full Name (e.g. Rahul Sharma, Priya Patel, David Miller)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="sm:col-span-6 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
          />
          <select
            value={customRole}
            onChange={(e) => setCustomRole(e.target.value)}
            className="sm:col-span-4 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="Senior Threat Analyst">Senior Threat Analyst</option>
            <option value="Lead SOC Engineer">Lead SOC Engineer</option>
            <option value="Incident Response Officer">Incident Response Officer</option>
            <option value="Firewall Security Architect">Firewall Security Architect</option>
            <option value="Malware Forensics Lead">Malware Forensics Lead</option>
            <option value="Cloud Security Engineer">Cloud Security Engineer</option>
          </select>
          <button
            type="submit"
            disabled={generating}
            className="sm:col-span-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition active:scale-95 shadow-sm"
          >
            Create Login
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Active Staff Login Directory
          </h3>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {users.length} Active Staff Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Assigned Email</th>
                <th className="p-3">Assigned Role</th>
                <th className="p-3">Generated Password</th>
                <th className="p-3">Created On</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 font-medium">
                    No staff accounts generated yet. Click "1-Click Auto Generate" above!
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isChairmanAccount = u.username === 'harsha' || u.role?.includes('Chairman');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-indigo-700 flex items-center gap-2 font-mono">
                        <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center uppercase ${
                          isChairmanAccount ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {u.username ? u.username[0] : 'U'}
                        </div>
                        <span>{u.username}</span>
                        {isChairmanAccount && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-sans font-semibold">
                            SUPER ADMIN
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 bg-slate-50/80 rounded">
                        <code>{u.password}</code>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{u.created_at}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* Copy Login */}
                          <button
                            onClick={() => handleCopy(u)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition active:scale-95 flex items-center gap-1 shadow-sm ${
                              copiedId === u.id
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                            title="Copy credentials to clipboard"
                          >
                            {copiedId === u.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy
                              </>
                            )}
                          </button>

                          {/* Remove Staff Button */}
                          {!isChairmanAccount && (
                            <button
                              onClick={() => handleRemoveStaff(u)}
                              disabled={deletingId === u.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition active:scale-95"
                              title="Remove staff member from directory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
