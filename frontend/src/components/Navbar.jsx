import React from 'react';
import { 
  Shield, Activity, Info, MessageSquare, LogIn, LogOut, Cpu, Bot, Users, Crown, Sparkles 
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  isConnected, 
  user, 
  onLogout, 
  isRetraining, 
  onRetrain,
  highRiskCount = 0 
}) {
  const isChairman = user?.is_chairman || user?.username === 'harsha' || user?.role?.includes('Chairman') || user?.role?.includes('Admin');

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Logo */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 p-0.5 shadow-md shadow-indigo-100 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                SHADOW
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                AI Defense
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Real-Time Threat Intelligence & Anomaly Platform</p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentView === 'dashboard'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dashboard</span>
            {highRiskCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                {highRiskCount}
              </span>
            )}
          </button>

          {/* AI Security Advisor Tab */}
          <button
            onClick={() => setCurrentView('ai_chat')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentView === 'ai_chat'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Security Advisor</span>
          </button>

          {/* Staff Credentials (for Chairman) */}
          {isChairman && (
            <button
              onClick={() => setCurrentView('users')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'users'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Staff Credentials</span>
            </button>
          )}

          <button
            onClick={() => setCurrentView('about')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentView === 'about'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>About ML</span>
          </button>

          <button
            onClick={() => setCurrentView('feedback')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentView === 'feedback'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Feedback</span>
          </button>
        </nav>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Live WS Status */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
            isConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`}></span>
            <span className="font-semibold">{isConnected ? 'Live Telemetry' : 'Connecting...'}</span>
          </div>

          {/* Retrain Model */}
          {currentView === 'dashboard' && (
            <button
              onClick={onRetrain}
              disabled={isRetraining}
              title="Retrain Random Forest model"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <Cpu className={`w-3.5 h-3.5 text-indigo-600 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Retraining...' : 'Retrain AI'}</span>
            </button>
          )}

          {/* User Profile Badge (Special Crown for Chairman Harsha!) */}
          {user ? (
            <div className={`flex items-center gap-2 py-1 px-3 rounded-xl border ${
              isChairman
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-sm'
                : 'bg-slate-100 border-slate-200'
            }`}>
              <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center uppercase shadow-sm ${
                isChairman ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
              }`}>
                {isChairman ? <Crown className="w-4 h-4 text-white" /> : (user.username ? user.username[0] : 'U')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-slate-900 text-xs font-bold leading-tight flex items-center gap-1">
                  <span>{isChairman ? 'Chairman Harsha' : user.username}</span>
                  {isChairman && <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />}
                </div>
                <div className="text-[10px] text-indigo-700 font-semibold">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="ml-1 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition hover:bg-rose-50"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-indigo-100 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
