import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { Activity, BrainCircuit, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

export default function AdminView() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [binWeight, setBinWeight] = useState(12.5);
  const [isBinFull, setIsBinFull] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user, role } = useAuth();
  // Ensure isOwner is true if role is admin OR if using a demo account
  const isOwner = role === "admin" || (user && user.email?.includes('admin'));

  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedbacks(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBinWeight(prev => {
        const change = (Math.random() - 0.4);
        const newWeight = Math.max(0, Math.min(50, prev + change));
        setIsBinFull(newWeight > 45);
        return parseFloat(newWeight.toFixed(2));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    if (!isOwner) return;
    const newStatus = currentStatus === 'Resolved' ? 'Pending' : 'Resolved';
    try {
      await updateDoc(doc(db, "feedback", id), { status: newStatus });
    } catch (err) {
      console.error("Update failed:", err);
    }
  };


  const generateAIInsight = () => {
    if (feedbacks.length === 0) return {
      msg: "⌛ Waiting for student feedback data...",
      color: "bg-blue-50 border-blue-200 text-blue-700"
    };

    const pending = feedbacks.filter(f => f.status !== 'Resolved');
    const lowRated = pending.filter(f => f.rating <= 2);

    if (lowRated.length === 0) {
      return {
        msg: "✅ System Optimal. Menu is performing within expected parameters.",
        color: "bg-green-50 border-green-200 text-green-700"
      };
    }

    const tags = lowRated.flatMap(f => f.tags || []);
    const tasteCount = tags.filter(t => t === 'Taste').length;
    const hygieneCount = tags.filter(t => t === 'Hygiene').length;

    if (hygieneCount > 0) {
      return {
        msg: `🚨 CRITICAL: ${hygieneCount} Hygiene reports detected. Immediate audit recommended.`,
        color: "bg-red-50 border-red-200 text-red-700 animate-pulse"
      };
    }

    if (tasteCount > 0) {
      return {
        msg: `⚠️ Trend Alert: ${tasteCount} Taste complaints detected. Review ingredient sourcing.`,
        color: "bg-orange-50 border-orange-200 text-orange-800"
      };
    }

    return {
      msg: "ℹ️ Monitoring Feedback. Accumulating data for precision insights...",
      color: "bg-yellow-50 border-yellow-200 text-yellow-700"
    };
  };

  const insight = generateAIInsight();

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((a, b) => a + (Number(b.rating) || 0), 0) / feedbacks.length).toFixed(1)
    : "0.0";

  const pendingCount = feedbacks.filter(f => f.status !== "Resolved").length;

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
    datasets: [
      {
        type: 'line',
        label: 'Avg Taste Rating',
        data: [4.2, 3.9, 4.0, 3.5, 4.1, parseFloat(avgRating)],
        borderColor: '#ea580c',
        borderWidth: 3,
        pointBackgroundColor: '#ea580c',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        type: 'bar',
        label: 'Est. Food Wastage (kg)',
        data: [15, 20, 18, 45, 16, parseFloat(avgRating) < 3 ? 42 : 12],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderRadius: 4,
        yAxisID: 'y1',
      }
    ]
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-orange-600">Initializing Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-orange-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm italic">Authenticated as: {user?.email || 'Guest Admin'}</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total Feedback</p>
          <p className="text-2xl font-bold text-gray-800">{feedbacks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
          <p className="text-xs text-gray-500 uppercase font-semibold">Avg Rating</p>
          <p className="text-2xl font-bold text-orange-600">{avgRating} ★</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
          <p className="text-xs text-gray-500 uppercase font-semibold">Pending Issues</p>
          <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
          <p className="text-xs text-gray-500 uppercase font-semibold">Bin Waste</p>
          <p className={`text-2xl font-bold ${isBinFull ? "text-red-600 animate-bounce" : "text-green-600"}`}>
            {binWeight} kg
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-4 transition-all ${insight.color}`}>
        <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
          <BrainCircuit className="text-orange-600" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Menu Copilot</h3>
          <p className="text-sm font-medium opacity-90">{insight.msg}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          Analytics Overview
        </h3>
        <div className="h-[350px]">
          <Chart 
            type="bar" 
            data={chartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Rating' } },
                y1: { position: 'right', beginAtZero: true, title: { display: true, text: 'Wastage (kg)' } }
              }
            }} 
          />
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">Live Feedback Feed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.length === 0 ? (
            <p className="text-gray-400 text-sm col-span-2 text-center py-10">No reports found in Firestore.</p>
          ) : (
            feedbacks.map(item => (
              <div key={item.id} className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-800">{item.meal || 'Unknown Meal'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.rating < 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {item.rating} ★
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">"{item.comment || 'No comment provided'}"</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-1 flex-wrap">
                    {item.tags?.map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-white text-orange-700 px-2 py-0.5 rounded border border-orange-200 uppercase font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`text-xs font-bold py-1 px-3 rounded-lg transition ${
                      item.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status === 'Resolved' ? <CheckCircle size={14} className="inline mr-1"/> : <AlertTriangle size={14} className="inline mr-1"/>}
                    {item.status === 'Resolved' ? 'Resolved' : 'Pending'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
