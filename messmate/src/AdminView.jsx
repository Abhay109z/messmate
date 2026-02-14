import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Activity, BrainCircuit } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminView() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [binWeight, setBinWeight] = useState(12.5);
  const [isBinFull, setIsBinFull] = useState(false);
  
  const { role } = useAuth();
  const isOwner = role === "admin";

  // Real-time Firestore Listener
  useEffect(() => {
    if (role !== 'admin') {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFeedbacks(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  // Demo IoT Waste Simulation
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
    await updateDoc(doc(db, "feedback", id), {
      status: newStatus
    });
  };

  // AI Insight Generator
  const generateAIInsight = () => {
    const pending = feedbacks.filter(f => f.status !== 'Resolved');
    const lowRated = pending.filter(f => (Number(f.rating) || 0) <= 2);

    if (feedbacks.length > 0 && lowRated.length === 0) {
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
      color: "bg-blue-50 border-blue-200 text-blue-700"
    };
  };

  if (role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600 font-semibold">
        Access Denied. Admin privileges required.
      </div>
    );
  }

  const insight = generateAIInsight();
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / feedbacks.length).toFixed(1)
    : 0;
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
        data: [15, 20, 18, 45, 16, binWeight],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderRadius: 4,
        yAxisID: 'y1',
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
          <Activity className="text-red-600" /> Admin Dashboard
        </h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium uppercase">
          Role: {role}
        </span>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Feedback</p>
          <p className="text-xl font-bold text-gray-900">{feedbacks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Rating</p>
          <p className="text-xl font-bold text-yellow-500">{avgRating} ★</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Issues</p>
          <p className="text-xl font-bold text-red-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Waste Level</p>
          <p className={`text-xl font-bold ${isBinFull ? "text-red-600" : "text-green-600"}`}>
            {binWeight} kg
          </p>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${insight.color}`}>
        <BrainCircuit className="shrink-0 mt-1" size={24} />
        <div>
          <h3 className="font-bold">AI Menu Copilot</h3>
          <p className="text-sm">{insight.msg}</p>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="h-[300px]">
          <Chart
            type="bar"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Rating' } },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Kg' } },
              }
            }}
          />
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Feedback</h2>
        
        {loading ? (
          <p className="text-gray-400">Loading data...</p>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
            <p className="text-gray-500">No feedback entries found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {feedbacks.map(item => (
              <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{item.meal || "Unnamed Meal"}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-yellow-600 font-medium text-sm">Rating: {item.rating} ★</p>
                      {item.tags?.map(tag => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-2">
                      {item.timestamp?.toDate().toLocaleDateString() || 'Recent'}
                    </p>
                    <button
                      onClick={() => toggleStatus(item.id, item.status)}
                      className={`text-xs font-bold px-3 py-1 rounded transition ${
                        item.status === 'Resolved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {item.status === 'Resolved' ? '✓ Resolved' : 'Mark Resolved'}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-600 italic">"{item.comment || "No comment provided."}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
