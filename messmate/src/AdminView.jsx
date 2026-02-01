import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Activity, BrainCircuit, Utensils, Wifi } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminView() {
  const [feedbacks, setFeedbacks] = useState([]);
  
  // Demo IoT Bin State
  const [binWeight, setBinWeight] = useState(12.5);
  const [isBinFull, setIsBinFull] = useState(false);

  // Real-time Data Connection
  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
    const newStatus = currentStatus === 'Resolved' ? 'Pending' : 'Resolved';
    await updateDoc(doc(db, "feedback", id), { status: newStatus });
  };

  
  const generateAIInsight = () => {
    const pending = feedbacks.filter(f => f.status !== 'Resolved');
    const lowRated = pending.filter(f => f.rating <= 2);
    
    
    if (lowRated.length === 0) return { 
        msg: "✅ System Optimal. Menu is performing within expected parameters.", 
        color: "bg-green-50 border-green-200 text-green-700" 
    };

    const tags = lowRated.flatMap(f => f.tags || []);
    const tasteCount = tags.filter(t => t === 'Taste').length;
    const hygieneCount = tags.filter(t => t === 'Hygiene').length;

    if (hygieneCount > 0) return { 
        msg: `🚨 CRITICAL: ${hygieneCount} Hygiene reports detected. AI Protocol: Initiate immediate kitchen audit and pest control check.`, 
        color: "bg-red-50 border-red-200 text-red-700 animate-pulse" 
    };
    
  
    if (tasteCount > 0) return { 
        msg: `⚠️ Trend Alert: ${tasteCount} Taste complaints. Correlated with 35% increase in bin wastage. Suggested Action: Review spice vendor.`, 
        color: "bg-orange-50 border-orange-200 text-orange-800" 
    };

    return { 
        msg: "ℹ️ Monitoring Feedback. Accumulating data for precision insights...", 
        color: "bg-yellow-50 border-yellow-200 text-yellow-700" 
    };
  };

  const insight = generateAIInsight();
  const avgRating = feedbacks.length ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1) : 0;

  
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
      
      {}
      <div className="flex justify-between items-center pb-6 border-b border-orange-200">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-red-600" /> Command Center
            </h1>
            <p className="text-gray-500">Real-time Mess Operations & Analytics</p>
        </div>
        <div className="text-right">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status</div>
             <div className={`text-sm font-bold flex items-center justify-end gap-2 ${avgRating < 3 ? 'text-red-600' : 'text-green-600'}`}>
                <div className={`w-2 h-2 rounded-full ${avgRating < 3 ? 'bg-red-600' : 'bg-green-600'}`}></div>
                {avgRating < 3 ? 'ATTENTION REQUIRED' : 'OPERATIONAL'}
             </div>
        </div>
      </div>

      {}
      <div className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start gap-4 ${insight.color}`}>
        <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
            <BrainCircuit className="text-orange-600" size={24} />
        </div>
        <div>
            <h3 className="font-bold text-lg">AI Menu Copilot</h3>
            <p className="text-sm font-medium opacity-90">{insight.msg}</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase flex items-center gap-2">
                Taste vs. Wastage Correlation
            </h3>
            <div className="flex-grow min-h-[400px]">
                <Chart type='bar' data={chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: { type: 'linear', display: true, position: 'left', title: {display: true, text: 'Rating (1-5)'} },
                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: {display: true, text: 'Wastage (kg)'} },
                    }
                }} />
            </div>
        </div>

        {}
        <div className="space-y-6 flex flex-col h-full">
            
            {}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                
                <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase flex items-center gap-2 relative z-10">
                    <Utensils size={16} className="text-orange-600"/> Kitchen AI Prediction
                </h3>

                <div className="flex items-center gap-4 mt-4 relative z-10">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full shadow-inner">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Projected Attendance</p>
                        <h2 className="text-3xl font-extrabold text-gray-800">84% <span className="text-sm font-bold text-red-500">(-16%)</span></h2>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 relative z-10">
                    <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">Cooking Adjustments:</p>
                    <ul className="text-xs text-green-800 space-y-1.5 font-medium">
                        <li className="flex justify-between border-b border-green-200 pb-1">
                            <span>🍚 Rice:</span>
                            <span className="font-bold text-green-700">-15 kg</span>
                        </li>
                        <li className="flex justify-between pt-1">
                            <span>🥘 Dal:</span>
                            <span className="font-bold text-green-700">-20 Liters</span>
                        </li>
                    </ul>
                </div>
            </div>

            {}
            <div className={`p-5 rounded-xl border shadow-lg relative overflow-hidden transition-all duration-500 ${isBinFull ? 'bg-red-900 border-red-700' : 'bg-gray-900 border-gray-800'}`}>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className={`font-bold text-xs uppercase flex items-center gap-2 ${isBinFull ? 'text-white' : 'text-green-400'}`}>
                             <Wifi size={14} className="animate-pulse"/> IoT Smart Bin #04
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1">Live Sensor Stream</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-2xl font-mono font-bold ${isBinFull ? 'text-white' : 'text-green-400'}`}>{binWeight}<span className="text-sm text-gray-500">kg</span></span>
                    </div>
                </div>
                {}
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden relative">
                    <div className={`h-full transition-all duration-1000 ease-in-out ${isBinFull ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(binWeight / 50) * 100}%` }}></div>
                </div>
                <div className="mt-2 flex justify-between items-center relative z-10">
                     <span className="text-[10px] text-gray-500 font-mono">ID: ESP32-WROOM</span>
                     {isBinFull && <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded animate-pulse">OVERFLOW</span>}
                </div>
            </div>

            {}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">Live Incoming Feed</h3>
                <div className="flex-grow overflow-y-auto space-y-3 max-h-60 pr-2 custom-scrollbar">
                    {feedbacks.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No reports yet.</p>}
                    
                    {feedbacks.map(item => (
                        <div key={item.id} className="p-3 bg-orange-50/50 rounded border border-orange-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-gray-800 text-sm">{item.meal}</span>
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${item.rating < 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {item.rating} ★
                                </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2 italic">"{item.comment}"</p>
                            
                            {item.hasImage && (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                    📸 Image Evidence
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-1 flex-wrap">
                                    {item.tags?.map(t => <span key={t} className="text-[10px] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200 font-medium shadow-sm">{t}</span>)}
                                </div>
                                <button onClick={() => toggleStatus(item.id, item.status)} className="text-xs text-red-600 font-bold hover:text-red-800 transition">
                                    {item.status === 'Resolved' ? 'Undo' : 'Resolve'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}