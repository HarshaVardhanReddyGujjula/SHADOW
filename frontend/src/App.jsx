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
      // Standalone Browser Demo Fallback for GitHub Pages
      console.log('Running in Standalone Demo Mode (GitHub Pages)');
      setIsConnected(true);
      setStats(prev => ({
        total_events: prev.total_events || 2840,
        normal_count: prev.normal_count || 2150,
        suspicious_count: prev.suspicious_count || 480,
        high_risk_count: prev.high_risk_count || 210,
        blocked_ips_count: prev.blocked_ips_count || 14,
        active_alerts_count: prev.active_alerts_count || 3,
        avg_recent_risk_score: 42,
      }));

      setTrendData([
        { time: '02:00', Normal: 45, Suspicious: 12, 'High Risk': 3 },
        { time: '02:05', Normal: 52, Suspicious: 14, 'High Risk': 2 },
        { time: '02:10', Normal: 48, Suspicious: 18, 'High Risk': 8 },
        { time: '02:15', Normal: 60, Suspicious: 15, 'High Risk': 4 },
        { time: '02:20', Normal: 55, Suspicious: 22, 'High Risk': 11 },
        { time: '02:25', Normal: 58, Suspicious: 19, 'High Risk': 6 },
      ]);

      setSuspiciousIPs(prev => prev.length ? prev : [
        { id: 1, ip_address: '185.220.101.5', country: 'Germany', max_risk_score: 95, attempt_count: 32, status: 'Blocked' },
        { id: 2, ip_address: '45.154.255.88', country: 'Russia', max_risk_score: 88, attempt_count: 19, status: 'Blocked' },
        { id: 3, ip_address: '193.56.29.14', country: 'Netherlands', max_risk_score: 78, attempt_count: 14, status: 'Flagged' },
        { id: 4, ip_address: '103.251.170.2', country: 'China', max_risk_score: 72, attempt_count: 9, status: 'Flagged' },
        { id: 5, ip_address: '91.240.118.172', country: 'Bulgaria', max_risk_score: 65, attempt_count: 6, status: 'Flagged' },
      ]);

      setAlerts(prev => prev.length ? prev : [
        { id: 1, title: 'Brute Force Attack Detected', description: 'High-frequency failed logins from 185.220.101.5 on account David Miller', risk_level: 'High Risk', risk_score: 95, source_ip: '185.220.101.5', timestamp: '2026-08-26 00:20:11' },
        { id: 2, title: 'Impossible Travel Anomaly', description: 'Rapid geo-hop from Germany to Singapore (7,800 km) in 4 minutes', risk_level: 'High Risk', risk_score: 88, source_ip: '45.154.255.88', timestamp: '2026-08-26 00:22:45' },
        { id: 3, title: 'Port Scan Reconnaissance', description: 'Multi-port probe across sensitive sockets 22, 3389, 445', risk_level: 'Suspicious', risk_score: 65, source_ip: '91.240.118.172', timestamp: '2026-08-26 00:25:30' }
      ]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Client Telemetry Generator for Standalone Live Demo
  useEffect(() => {
    if (!user) return;

    const names = ["Harsha Vardhan (Chairman)", "Rahul Sharma", "Priya Patel", "David Miller", "Sarah Jenkins", "Vikram Reddy", "Elena Rostova", "Alex Rivera"];
    const countries = ["India", "United States", "Germany", "United Kingdom", "Singapore", "Japan"];
    const ips = ["192.168.1.45", "10.0.0.12", "172.16.0.5", "185.220.101.5", "45.154.255.88", "193.56.29.14"];
    const endpoints = ["/api/auth/login", "/api/v1/telemetry", "/api/admin/dashboard", "/oauth/token", "/api/reports/export"];

    const timer = setInterval(() => {
      const isHigh = Math.random() < 0.25;
      const isSusp = !isHigh && Math.random() < 0.35;
      const r_level = isHigh ? 'High Risk' : isSusp ? 'Suspicious' : 'Normal';
      const r_score = isHigh ? Math.floor(Math.random() * 25 + 75) : isSusp ? Math.floor(Math.random() * 30 + 40) : Math.floor(Math.random() * 20);

      const fakeEvt = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        event_type: isHigh ? 'Brute Force Burst' : isSusp ? 'Impossible Travel' : 'Login Success',
        source_ip: ips[Math.floor(Math.random() * ips.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        username: names[Math.floor(Math.random() * names.length)],
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        port: isHigh ? 22 : 443,
        risk_score: r_score,
        risk_level: r_level,
        geo_distance_km: isSusp ? 4200 : 0,
        unknown_device: isHigh
      };

      setLiveEvents(prev => [fakeEvt, ...prev.slice(0, 49)]);
      setAllEvents(prev => [fakeEvt, ...prev.slice(0, 99)]);
      setStats(prev => ({
        ...prev,
        total_events: prev.total_events + 1,
        normal_count: r_level === 'Normal' ? prev.normal_count + 1 : prev.normal_count,
        suspicious_count: r_level === 'Suspicious' ? prev.suspicious_count + 1 : prev.suspicious_count,
        high_risk_count: r_level === 'High Risk' ? prev.high_risk_count + 1 : prev.high_risk_count,
      }));
    }, 2800);

    return () => clearInterval(timer);
  }, [user]);

  // WebSocket Connection for Live Telemetry (When Backend is Active)
  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/threats`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'NEW_EVENT') {
              const newEvt = payload.event;
              setLiveEvents(prev => [newEvt, ...prev.slice(0, 49)]);
              setAllEvents(prev => [newEvt, ...prev.slice(0, 99)]);
            }
          } catch (e) {}
        };
      } catch (e) {}
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

  // Interactive Action Handlers (Fully Functional in Both Backend & Standalone Demo Mode)
  const handleSimulateAttack = async (type) => {
    const attackNames = {
      normal: 'Normal User Login',
      brute_force: 'Brute Force Attack',
      impossible_travel: 'Impossible Travel Anomaly',
      port_scan: 'Port Scan Reconnaissance'
    };
    
    const isHigh = type === 'brute_force' || type === 'impossible_travel';
    const isSusp = type === 'port_scan';
    const r_level = isHigh ? 'High Risk' : isSusp ? 'Suspicious' : 'Normal';
    const r_score = isHigh ? 98 : isSusp ? 65 : 5;
    const simIp = isHigh ? (type === 'brute_force' ? '185.220.101.5' : '45.154.255.88') : isSusp ? '91.240.118.172' : '192.168.1.45';
    
    const newEvt = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      event_type: attackNames[type] || 'Simulated Traffic',
      source_ip: simIp,
      country: isHigh ? (type === 'brute_force' ? 'Germany' : 'Russia') : isSusp ? 'Bulgaria' : 'United States',
      username: isHigh ? 'David Miller' : 'Harsha Vardhan (Chairman)',
      endpoint: isHigh ? '/api/auth/login' : '/api/v1/telemetry',
      port: type === 'port_scan' ? 22 : 443,
      risk_score: r_score,
      risk_level: r_level,
      geo_distance_km: type === 'impossible_travel' ? 6800 : 0,
      unknown_device: isHigh
    };

    // Optimistic UI updates
    setLiveEvents(prev => [newEvt, ...prev.slice(0, 49)]);
    setAllEvents(prev => [newEvt, ...prev.slice(0, 99)]);
    
    if (isHigh || isSusp) {
      const newAlert = {
        id: Date.now(),
        title: `${attackNames[type]} from ${simIp}`,
        description: `Automated ML trigger on user ${newEvt.username} (${newEvt.country}) with risk score ${r_score}%.`,
        risk_level: r_level,
        risk_score: r_score,
        source_ip: simIp,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      setAlerts(prev => [newAlert, ...prev]);

      // Add to suspicious IPs list if not present
      setSuspiciousIPs(prev => {
        const exists = prev.some(item => item.ip_address === simIp);
        if (exists) {
          return prev.map(item => item.ip_address === simIp ? { ...item, max_risk_score: Math.max(item.max_risk_score, r_score), attempt_count: item.attempt_count + 1 } : item);
        }
        return [{ id: Date.now(), ip_address: simIp, country: newEvt.country, max_risk_score: r_score, attempt_count: 1, status: 'Flagged' }, ...prev];
      });
    }

    setStats(prev => ({
      ...prev,
      total_events: prev.total_events + 1,
      normal_count: r_level === 'Normal' ? prev.normal_count + 1 : prev.normal_count,
      suspicious_count: r_level === 'Suspicious' ? prev.suspicious_count + 1 : prev.suspicious_count,
      high_risk_count: r_level === 'High Risk' ? prev.high_risk_count + 1 : prev.high_risk_count,
      active_alerts_count: (isHigh || isSusp) ? prev.active_alerts_count + 1 : prev.active_alerts_count,
      avg_recent_risk_score: Math.round((prev.avg_recent_risk_score * 4 + r_score) / 5)
    }));

    showToast(`⚡ Simulation injected: ${attackNames[type] || type} processed by ML model!`);

    try {
      await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: type, count: 1 })
      });
      fetchData();
    } catch (err) {}
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to reset all historical logs and alerts?")) return;
    setLiveEvents([]);
    setAllEvents([]);
    setAlerts([]);
    setStats(prev => ({
      ...prev,
      total_events: 0,
      normal_count: 0,
      suspicious_count: 0,
      high_risk_count: 0,
      active_alerts_count: 0,
      avg_recent_risk_score: 0
    }));
    showToast("🧹 All historical incident logs & alerts cleared!");

    try {
      await fetch('/api/events/clear', { method: 'POST' });
      fetchData();
    } catch (err) {}
  };

  const handleClearAllAlerts = async () => {
    setAlerts([]);
    setStats(prev => ({ ...prev, active_alerts_count: 0 }));
    showToast("✅ All active alerts marked as Dismissed.");

    try {
      await fetch('/api/alerts/clear', { method: 'POST' });
      fetchData();
    } catch (err) {}
  };

  const handleEscalateAlert = async (alertId) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        const newTitle = a.title.includes('ESCALATED') ? a.title : `🔥 ESCALATED: ${a.title}`;
        return { ...a, title: newTitle, risk_level: 'High Risk', risk_score: 99 };
      }
      return a;
    }));
    showToast("🔥 Incident escalated to Critical Severity!");

    try {
      await fetch(`/api/alerts/${alertId}/escalate`, { method: 'POST' });
      fetchData();
    } catch (err) {}
  };

  const handleToggleBlockIP = async (ip, block) => {
    setSuspiciousIPs(prev => {
      const exists = prev.some(item => item.ip_address === ip);
      if (exists) {
        return prev.map(item => item.ip_address === ip ? { ...item, status: block ? 'Blocked' : 'Flagged' } : item);
      } else {
        return [{ id: Date.now(), ip_address: ip, country: 'External Actor', max_risk_score: 95, attempt_count: 8, status: block ? 'Blocked' : 'Flagged' }, ...prev];
      }
    });

    setStats(prev => ({
      ...prev,
      blocked_ips_count: block ? prev.blocked_ips_count + 1 : Math.max(0, prev.blocked_ips_count - 1)
    }));

    showToast(block ? `🚫 IP ${ip} quarantined and blocked in Firewall!` : `✅ IP ${ip} unblocked and released.`);

    try {
      await fetch('/api/ips/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ip, block }),
      });
      fetchData();
    } catch (err) {}
  };

  const handleDismissAlert = async (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setStats(prev => ({ ...prev, active_alerts_count: Math.max(0, prev.active_alerts_count - 1) }));
    showToast("✅ Alert marked as Resolved and removed from queue.");

    try {
      await fetch(`/api/alerts/${alertId}/dismiss`, { method: 'POST' });
      fetchData();
    } catch (err) {}
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
