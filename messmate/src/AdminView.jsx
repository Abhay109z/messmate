import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { Activity, BrainCircuit } from 'lucide-react';
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

  const { role } = useAuth();
  const isOwner = role === "admin"; // 🔥 Role-based protection

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
    if (!isOwner) return; // 🔒 Extra safety

    const newStatus =
      currentStatus === 'Resolved' ? 'Pending' : 'Resolved';

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
        feedbacks.reduce((a, b) => a + b.rating, 0) /
        feedbacks.length
      ).toFixed(1)
    : 0;

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
        data: [15, 20, 18, 45, 16, avgRating < 3 ? 65 : 12],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderRadius: 4,
        yAxisID: 'y1',
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center pb-6 border-b border-orange-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-red-600" />
            AI-Powered Mess Management Dashboard
          </h1>
          <p className="text-gray-500">
            Live Production Demo • Real-time Analytics
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${insight.color}`}>
        <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
          <BrainCircuit className="text-orange-600" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Menu Copilot</h3>
          <p className="text-sm font-medium opacity-90">{insight.msg}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
        <div className="min-h-[400px]">
          <Chart
            type="bar"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              scales: {
                y: { type: 'linear', position: 'left' },
                y1: {
                  type: 'linear',
                  position: 'right',
                  grid: { drawOnChartArea: false }
                },
              }
            }}
          />
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">
          Live Incoming Feed
        </h3>

        <div className="space-y-3">
          {feedbacks.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              No reports yet.
            </p>
          )}

          {feedbacks.map(item => (
            <div
              key={item.id}
              className="p-3 bg-orange-50/50 rounded border border-orange-100"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-800 text-sm">
                  {item.meal}
                </span>

                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    item.rating < 3
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {item.rating} ★
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-1 italic">
                "{item.comment}"
              </p>

              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-1 flex-wrap">
                  {item.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {isOwner ? (
                  <button
                    onClick={() =>
                      toggleStatus(item.id, item.status)
                    }
                    className="text-xs text-red-600 font-bold hover:text-red-800 transition"
                  >
                    {item.status === 'Resolved'
                      ? 'Undo'
                      : 'Resolve'}
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-semibold">
                    View Only
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
