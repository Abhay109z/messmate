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
  const [binWeight, setBinWeight] = useState(12.5);
  const [isBinFull, setIsBinFull] = useState(false);
  const { role } = useAuth();
  const isOwner = role === "admin";

  // 🔥 Real-time Firestore Listener
  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedbacks(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Demo IoT Waste Simulation
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

  // 🔥 AI Insight Generator
  const generateAIInsight = () => {
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
    ? (
        feedbacks.reduce((a, b) => a + (Number(b.rating) || 0), 0) /
        feedbacks.length
      ).toFixed(1)
    : 0;

  const pendingCount = feedbacks.filter(f => f.status !== "Resolved").length;

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
    datasets: [
      {
        type: 'line',
        label: 'Avg Taste Rating',
        data: [4.2, 3.9, 4.0, 3.5, 4.1, avgRating],
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
    <div className="space-y-6">

      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Activity className="text-red-600" />
        Admin Dashboard ({role})
      </h1>

      <div className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-gray-500 text-sm">Total Feedback</p>
          <p className="font-bold">{feedbacks.length}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Average Rating</p>
          <p className="font-bold">{avgRating}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Pending Issues</p>
          <p className="font-bold text-red-600">{pendingCount}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Waste Level</p>
          <p className={`font-bold ${isBinFull ? "text-red-600" : "text-green-600"}`}>
            {binWeight} kg
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div className={`p-4 rounded border-l-4 flex items-start gap-3 ${insight.color}`}>
        <BrainCircuit className="shrink-0" size={24} />
        <div>
          <p className="font-bold">AI Insight</p>
          <p className="text-sm">{insight.msg}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded shadow">
        <div className="h-64">
          <Chart
            type="bar"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: { type: 'linear', position: 'left' },
                y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } },
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {feedbacks.length === 0 && (
          <p className="text-gray-500">No feedback yet.</p>
        )}

        {feedbacks.map(item => (
          <div key={item.id} className="p-3 bg-gray-100 rounded">
            <div className="flex justify-between items-start">
              <div>
                <p><strong>{item.meal}</strong></p>
                <p className="text-sm">Rating: {item.rating}</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => toggleStatus(item.id, item.status)}
                  className="text-xs font-bold text-blue-600 underline"
                >
                  {item.status === 'Resolved' ? 'Mark Pending' : 'Mark Resolved'}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1">{item.comment}</p>
            <div className="flex gap-1 mt-2">
              {item.tags?.map(tag => (
                <span key={tag} className="text-[10px] bg-white px-2 py-0.5 rounded border">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
