import React, { useState } from 'react';
import { Shield, Lock, User, Mail, ArrowRight, ShieldCheck, KeyRound, Sparkles, Crown } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onShowToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SOC Analyst');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFillDemo = (type) => {
    if (type === 'chairman') {
      setUsername('harsha');
      setPassword('harsha');
    } else if (type === 'admin') {
      setUsername('admin');
      setPassword('shadow123');
    } else {
      setUsername('analyst');
      setPassword('shadow123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { username, email, password, role } 
      : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      if (isRegister) {
        setIsRegister(false);
        setError('Account created successfully! Please sign in.');
        if (onShowToast) onShowToast("✅ Account created successfully! Please sign in.");
      } else {
        if (onShowToast) {
          if (data.user.is_chairman) {
            onShowToast(`👑 Welcome, Chairman Harsha! Full executive SOC access granted.`);
          } else {
            onShowToast(`👋 Welcome back, ${data.user.username}!`);
          }
        }
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 card-light rounded-3xl bg-white border border-slate-200 shadow-xl relative">
        {/* Top Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl shadow-md shadow-indigo-100 text-white mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Create SOC Account' : 'Sign In to SHADOW Platform'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister 
              ? 'Create analyst credentials to access the security defense center' 
              : 'Sign in to access the real-time AI threat telemetry center'}
          </p>
        </div>

        {/* Quick Demo Autofill with Chairman Harsha */}
        {!isRegister && (
          <div className="mb-5 p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
            <div className="text-indigo-900 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> 1-Click Fast Access Logins:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('chairman')}
                className="col-span-2 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-extrabold transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>👑 Chairman Harsha (harsha / harsha)</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold transition shadow-sm active:scale-95 text-center"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('analyst')}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold transition shadow-sm active:scale-95 text-center"
              >
                Demo Analyst
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
            error.includes('successfully') 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username / Call-sign</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. harsha or admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Email (Register only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Security Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@shadow-defense.io"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* Role (Register only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned SOC Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Senior Threat Analyst">Senior Threat Analyst</option>
                <option value="Lead SOC Engineer">Lead SOC Engineer</option>
                <option value="Incident Response Officer">Incident Response Officer</option>
                <option value="Threat Researcher">Threat Researcher</option>
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              'Authenticating...'
            ) : isRegister ? (
              <>
                <KeyRound className="w-4 h-4" /> Create Account
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Form */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => { setIsRegister(false); setError(''); }}
                className="text-indigo-600 hover:underline font-bold"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p>
              Need an analyst account?{' '}
              <button
                onClick={() => { setIsRegister(true); setError(''); }}
                className="text-indigo-600 hover:underline font-bold"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
