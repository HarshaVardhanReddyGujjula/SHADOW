import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, MessageCircle, Clock, Trash2, ShieldAlert } from 'lucide-react';

export default function FeedbackPage({ user, onShowToast }) {
  const [name, setName] = useState(user ? user.username : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isChairman = user?.is_chairman || user?.username === 'harsha' || user?.role?.includes('Chairman') || user?.role?.includes('Admin');

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setFeedbackList(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, rating, category, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setMessage('');
        fetchFeedback();
        if (onShowToast) onShowToast("🎉 Thank you! Your review has been recorded.");
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm(`Chairman Harsha: Are you sure you want to delete Feedback #${feedbackId}?`)) return;
    try {
      const res = await fetch(`/api/feedback/${feedbackId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFeedback();
        if (onShowToast) onShowToast(`🗑️ Feedback #${feedbackId} deleted successfully.`);
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl shadow-md shadow-indigo-100 text-white mb-2">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          SOC Operator Feedback & Reviews
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Share your experience, feature requests, or ML model accuracy notes to help us continuously enhance the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-5 h-fit shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" /> Submit Your Review
            </h3>
            <p className="text-xs text-slate-500 mt-1">We value insights from SOC analysts and engineers</p>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Thank you! Your review has been recorded.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {/* Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Your Name / Operator Call-sign</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@shadow-defense.io"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* 5-Star Rating */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Experience Rating</label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-slate-600 font-bold text-xs ml-2">({rating} / 5 Stars)</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="General">General Feedback</option>
                <option value="ML Risk Accuracy">ML Risk Accuracy</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
                <option value="UI/UX Improvement">UI/UX Improvement</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Feedback Details</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts on the ML model, live telemetry feed, or suggested improvements..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Send Feedback'}
            </button>
          </form>
        </div>

        {/* Reviews List Column */}
        <div className="lg:col-span-7 card-light rounded-2xl p-6 bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-600" /> Recent Analyst Reviews
              </h3>
              <p className="text-xs text-slate-500">Live feed of operator submissions</p>
            </div>
            <div className="flex items-center gap-2">
              {isChairman && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                  👑 Chairman Moderation Active
                </span>
              )}
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                {feedbackList.length} Reviews
              </span>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[560px] overflow-y-auto pr-1">
            {feedbackList.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-medium">
                No feedback reviews yet. Be the first to share your thoughts above!
              </div>
            ) : (
              feedbackList.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 hover:border-slate-300 transition shadow-sm relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center uppercase">
                        {item.name ? item.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Chairman Delete Button */}
                      {isChairman && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete this review (Chairman privilege)"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-sans leading-relaxed">
                    "{item.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold text-[10px]">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-slate-400" /> {item.timestamp ? item.timestamp.split('T')[0] : 'Today'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
