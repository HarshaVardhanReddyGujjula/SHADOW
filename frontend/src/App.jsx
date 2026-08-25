import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Globe, ShieldAlert, Database, Shield, Zap, Sparkles, Bot, Users, ArrowRight, CheckCircle2, AlertCircle, X, Crown 
} from 'lucide-react';

import Navbar from './components/Navbar';
import ThreatOverview from './components/ThreatOverview';
import LiveFeed from './components/LiveFeed';
import SuspiciousIPs from './components/SuspiciousIPs';
import ActiveAlerts from './components/ActiveAlerts';
import IncidentHistory from './components/IncidentHistory';
import AboutPage from './components/AboutPage';
import FeedbackPage from './components/FeedbackPage';
import LoginPage from './components/LoginPage';
import AIChatbot from './components/AIChatbot';
import UserManagement from './components/UserManagement';

export default function App() {
  // Auth state (Default to null if not authenticated)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shadow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'ai_chat', 'users', 'about', 'feedback'
  const [dashboardTab, setDashboardTab] = useState('overview'); // 'overview', 'live', 'ips', 'alerts', 'history'
  
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    total_events: 0,
    normal_count: 0,
    suspicious_count: 0,
    high_risk_count: 0,
    blocked_ips_count: 0,
    active_alerts_count: 0,
    avg_recent_risk_score: 0,
  });
  const [liveEvents, setLiveEvents] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [suspiciousIPs, setSuspiciousIPs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isRetraining, setIsRetraining] = useState(false);

  const wsRef = useRef(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [statsRes, trendsRes, ipsRes, alertsRes, eventsRes] = await Promise.all([
        fetch('/api/stats').then(res => res.json()),
        fetch('/api/trends').then(res => res.json()),
        fetch('/api/ips').then(res => res.json()),
        fetch('/api/alerts?status=Active').then(res => res.json()),
        fetch('/api/events?limit=100').then(res => res.json()),
      ]);

      setStats(statsRes);
      setTrendData(trendsRes);
      setSuspiciousIPs(ipsRes);
      setAlerts(alertsRes);
      setAllEvents(eventsRes);
    } catch (err) {
      console.error('Error fetching initial dashboard data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // WebSocket Connection for Live Telemetry
  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/threats`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('⚡ Connected to Shadow Threat Stream WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_EVENT') {
            const newEvt = payload.event;
            setLiveEvents(prev => [newEvt, ...prev.slice(0, 49)]);
            setAllEvents(prev => [newEvt, ...prev.slice(0, 99)]);
            
            // Refresh metrics counter
            setStats(prev => ({
              ...prev,
              total_events: prev.total_events + 1,
              normal_count: newEvt.risk_level === 'Normal' ? prev.normal_count + 1 : prev.normal_count,
              suspicious_count: newEvt.risk_level === 'Suspicious' ? prev.suspicious_count + 1 : prev.suspicious_count,
              high_risk_count: newEvt.risk_level === 'High Risk' ? prev.high_risk_count + 1 : prev.high_risk_count,
            }));
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000); // Auto reconnect
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    };

    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [user]);

  // Auth Handlers
  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('shadow_user', JSON.stringify(userData));
    localStorage.setItem('shadow_token', token);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shadow_user');
    localStorage.removeItem('shadow_token');
    showToast("Signed out successfully.");
  };

  // Interactive Action Handlers
  const handleSimulateAttack = async (type) => {
    try {
      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: type, count: 1 })
      });
      const attackName = type.replace('_', ' ').toUpperCase();
      showToast(`⚡ Simulation injected: ${attackName} telemetry processed by ML model!`);
      fetchData();
    } catch (err) {
      console.error('Error simulating event:', err);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to reset all historical logs and alerts?")) return;
    try {
      await fetch('/api/events/clear', { method: 'POST' });
      setLiveEvents([]);
      setAllEvents([]);
      setAlerts([]);
      fetchData();
      showToast("🧹 All historical incident logs & alerts cleared!");
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  const handleClearAllAlerts = async () => {
    try {
      await fetch('/api/alerts/clear', { method: 'POST' });
      setAlerts([]);
      fetchData();
      showToast("✅ All active alerts marked as Dismissed.");
    } catch (err) {
      console.error('Error clearing alerts:', err);
    }
  };

  const handleEscalateAlert = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/escalate`, { method: 'POST' });
      fetchData();
      showToast("🔥 Incident escalated to Critical Severity!");
    } catch (err) {
      console.error('Error escalating alert:', err);
    }
  };

  const handleToggleBlockIP = async (ip, block) => {
    try {
      await fetch('/api/ips/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ip, block }),
      });
      fetchData();
      showToast(block ? `🚫 IP ${ip} successfully quarantined and blocked!` : `✅ IP ${ip} unblocked.`);
    } catch (err) {
      console.error('Error toggling IP block:', err);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}/dismiss`, { method: 'POST' });
      fetchData();
      showToast("Alert marked as Resolved.");
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const handleRetrainModel = async () => {
    setIsRetraining(true);
    try {
      const res = await fetch('/api/retrain', { method: 'POST' }).then(r => r.json());
      showToast(`🧠 ML Model Retrained! New Accuracy: ${res.accuracy}%`);
    } catch (err) {
      console.error('Error retraining model:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  // 1. GATEKEEPER: If user is not logged in, show Login Page first!
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />
    );
  }

  const isChairman = user?.is_chairman || user?.username === 'harsha' || user?.role?.includes('Chairman') || user?.role?.includes('Admin');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-white text-slate-800 px-4 py-3 rounded-2xl shadow-xl border border-slate-200 transition transform animate-bounce duration-300">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div>
        {/* Unified Top Navigation */}
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isConnected={isConnected}
          user={user}
          onLogout={handleLogout}
          isRetraining={isRetraining}
          onRetrain={handleRetrainModel}
          highRiskCount={stats.high_risk_count}
        />

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* View 1: AI Security Advisor Chatbot */}
          {currentView === 'ai_chat' && <AIChatbot user={user} />}

          {/* View 2: Staff Credentials Management (Chairman / Admin) */}
          {currentView === 'users' && isChairman && <UserManagement onShowToast={showToast} />}

          {/* View 3: About Us / Platform Architecture */}
          {currentView === 'about' && <AboutPage />}

          {/* View 4: Feedback & Reviews */}
          {currentView === 'feedback' && <FeedbackPage user={user} onShowToast={showToast} />}

          {/* View 5: SOC Real-Time Threat Dashboard */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Sub-navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Threat Overview', icon: Activity },
                  { id: 'live', label: 'Live Telemetry Feed', icon: Activity, badge: liveEvents.length },
                  { id: 'ips', label: 'Suspicious IPs', icon: Globe, badge: stats.blocked_ips_count },
                  { id: 'alerts', label: 'Active Alerts', icon: ShieldAlert, badge: alerts.length, badgeColor: 'bg-rose-500 animate-pulse' },
                  { id: 'history', label: 'Incident Logs', icon: Database },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = dashboardTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDashboardTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150 ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{tab.label}</span>
                      {tab.badge > 0 && (
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white text-indigo-700' : (tab.badgeColor || 'bg-slate-200 text-slate-800')
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Component */}
              {dashboardTab === 'overview' && (
                <ThreatOverview 
                  stats={stats} 
                  trendData={trendData} 
                  onSimulateAttack={handleSimulateAttack}
                  onClearLogs={handleClearLogs}
                />
              )}
              
              {dashboardTab === 'live' && (
                <LiveFeed 
                  liveEvents={liveEvents} 
                  onBlockIP={handleToggleBlockIP}
                  onClearStream={() => { setLiveEvents([]); showToast("Live ticker list cleared."); }}
                />
              )}
              
              {dashboardTab === 'ips' && (
                <SuspiciousIPs 
                  suspiciousIPs={suspiciousIPs} 
                  onToggleBlock={handleToggleBlockIP} 
                />
              )}
              
              {dashboardTab === 'alerts' && (
                <ActiveAlerts 
                  alerts={alerts} 
                  onDismissAlert={handleDismissAlert}
                  onEscalateAlert={handleEscalateAlert}
                  onBlockIP={handleToggleBlockIP}
                  onClearAllAlerts={handleClearAllAlerts}
                />
              )}
              
              {dashboardTab === 'history' && (
                <IncidentHistory 
                  events={allEvents} 
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Chatbot Quick Action Button */}
      {currentView !== 'ai_chat' && (
        <button
          onClick={() => setCurrentView('ai_chat')}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-2 transition active:scale-95 group"
        >
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Ask SHADOW AI</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>SHADOW Defense Engine &copy; {new Date().getFullYear()} — Real-Time ML Anomaly & Intrusion Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setCurrentView('ai_chat')} className="hover:text-indigo-600 transition">AI Advisor</button>
            {isChairman && <button onClick={() => setCurrentView('users')} className="hover:text-indigo-600 transition">Staff Logins</button>}
            <button onClick={() => setCurrentView('about')} className="hover:text-indigo-600 transition">About Us</button>
            <button onClick={() => setCurrentView('feedback')} className="hover:text-indigo-600 transition">Feedback</button>
            <button onClick={() => setCurrentView('dashboard')} className="hover:text-indigo-600 transition">Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
