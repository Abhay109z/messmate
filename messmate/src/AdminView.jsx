import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { Activity, BrainCircuit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [binWeight, setBinWeight] = useState(12.5);
  const [isBinFull, setIsBinFull] = useState(false);
  const [loading, setLoading] = useState(true);

  const { role } = useAuth();
  const isOwner = role === "admin";

  // 📡 Real-time Firestore Listener
  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedbacks(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🗑️ IoT Waste Simulation (Simulating real-time sensor data)
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
    await updateDoc(doc(db, "feedback", id), { status: newStatus });
  };

  // 🧠 AI Insight Generator
  const generateAIInsight = () => {
    const pending = feedbacks.filter(f => f.status !== 'Resolved');
    const lowRated = pending.filter(f => (Number(f.rating) || 0) <= 2);

    if (feedbacks.length > 0 && lowRated.length === 0) {
      return {
        msg: "✅ System Optimal. Feedback trends show high satisfaction.",
        color: "bg-green-50 border-green-200 text-green-700",
        icon: <CheckCircle className="text-green-600" />
      };
    }

    const tags = lowRated.flatMap(f => f.tags || []);
    const hygieneCount = tags.filter(t => t.toLowerCase().includes('hygiene')).length;
    const tasteCount = tags.filter(t => t.toLowerCase().includes('taste')).length;

    if (hygieneCount > 0) {
      return {
        msg: `🚨 CRITICAL: ${hygieneCount} Hygiene issues flagged. Immediate kitchen audit required.`,
        color: "bg-red-50 border-red-200 text-red-700 animate-pulse",
        icon: <AlertTriangle className="text-red-600" />
      };
    }

    if (tasteCount > 2) {
      return {
        msg: `⚠️ Trend Alert: ${tasteCount} Taste complaints. Consider reviewing the current recipe.`,
        color: "bg-orange-50 border-orange-200 text-orange-800",
        icon: <BrainCircuit className="text-orange-600" />
      };
    }

    return {
      msg: "ℹ️ Gathering Data. AI is analyzing incoming feedback patterns...",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      icon: <BrainCircuit className="text-blue-600" />
    };
  };

  const insight = generateAIInsight();
  const avgRating = feedbacks.length 
    ? (feedbacks.reduce((a, b) => a + (Number(b.rating) || 0), 0) / feedbacks.length).toFixed(1) 
    : 0;
  const pendingCount = feedbacks.filter(f => f.status !== "Resolved").length;

  // 📊 Chart Configuration
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
    datasets: [
      {
        type: 'line',
        label: 'Avg Satisfaction',
        data: [4.2, 3.9, 4.0, 3.5, 4.1, parseFloat(avgRating)],
        borderColor: '#f97316',
        backgroundColor: '#f97316',
        borderWidth: 3,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Wastage (kg)',
        data: [15, 20, 18, 45, 16, binWeight],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderRadius: 6,
        yAxisID: 'y1',
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans antialiased bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Activity className="text-orange-600" size={32} />
            Mess Analytics <span className="text-orange-500 italic text-xl">Pro</span>
          </h1>
          <p className="text-gray-500 font-medium">Real-time IoT & AI Feedback Integration</p>
        </div>
        <div className="flex gap-2">
           <span className="px-4 py-2 bg-white shadow-sm border rounded-lg text-sm font-bold text-gray-700">
             📡 LIVE SENSORS: ACTIVE
           </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Feedback", val: feedbacks.length, color: "text-gray-800" },
          { label: "Avg Rating", val: `${avgRating} ★`, color: "text-orange-600" },
          { label: "Pending Issues", val: pendingCount, color: "text-red-600" },
          { label: "Waste Bin Level", val: `${binWeight} kg`, color: isBinFull ? "text-red-600" : "text-green-600", icon: <Trash2 size={16}/> }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              {kpi.icon} {kpi.label}
            </p>
            <p className={`text-3xl font-black mt-1 ${kpi.color}`}>{kpi.val}</p>
          </div>
        ))}
      </div>

      {/* AI Insight Box */}
      <div className={`p-5 rounded-2xl border-l-8 shadow-md flex items-center gap-5 transition-all duration-500 ${insight.color}`}>
        <div className="p-3 bg-white rounded-xl shadow-sm">
          {insight.icon}
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-tighter opacity-70">AI Copilot Analysis</h3>
          <p className="text-lg font-bold leading-tight">{insight.msg}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart View */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            Performance vs. Wastage Trends
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
                  y1: { position: 'right', grid: { display: false }, title: { display: true, text: 'Waste (kg)' } }
                }
              }} 
            />
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[500px] overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Live Feedback Stream</h3>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {feedbacks.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Waiting for incoming data...</p>
            ) : (
              feedbacks.map(item => (
                <div key={item.id} className="group p-4 bg-gray-50 rounded-xl border border-transparent hover:border-orange-200 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-gray-900 text-sm">{item.meal}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.rating < 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.rating}★
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 italic line-clamp-2 mb-3">"{item.comment}"</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {item.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] bg-white border px-1.5 py-0.5 rounded uppercase font-bold text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {isOwner && (
                      <button 
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded transition ${item.status === 'Resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-red-500 hover:text-white'}`}
                      >
                        {item.status === 'Resolved' ? 'Completed' : 'Resolve'}
                      </button>
                    )}
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
