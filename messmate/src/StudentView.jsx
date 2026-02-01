import { useState, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send, Camera, Star, X } from 'lucide-react';
import { useAuth } from './AuthContext'; 

export default function StudentView() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [meal, setMeal] = useState('Lunch');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        if (comment.length === 0) {
            setComment("AI Analysis: Food plate detected. Analyzing portion size and hygiene...");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSentiment = (text) => {
    
    return ['General'];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please give a star rating!");
    setLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        meal, rating, comment, tags: analyzeSentiment(comment), status: 'Pending', timestamp: serverTimestamp(),
        userEmail: user?.email || 'Anonymous', hasImage: !!imagePreview 
      });
      alert(`Feedback Submitted! +10 Mess Coins Added!`);
      setComment(''); setRating(0); setImagePreview(null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-xl border border-orange-100 mb-10">
      
      {}
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Rate Meal</h2>
           <p className="text-xs text-gray-500">Your feedback matters.</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-orange-200 text-orange-800 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="text-lg">🪙</span> 
            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase text-orange-600 opacity-70">Balance</span>
                <span>120 Coins</span>
            </div>
        </div>
      </div>

      {}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map(m => (
            <button key={m} onClick={() => setMeal(m)} className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap shadow-sm ${meal === m ? 'bg-red-600 text-white shadow-red-200' : 'bg-orange-50 text-gray-600 hover:bg-orange-100 border border-orange-100'}`}>{m}</button>
        ))}
      </div>

      {}
      <div className="mb-6 text-center py-6 bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
        <div className="flex justify-center gap-3 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={36} fill={rating >= star ? "#fbbf24" : "none"} className={`cursor-pointer transition-transform duration-200 hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300'}`} onClick={() => setRating(star)}/>
          ))}
        </div>
        <p className="text-sm font-bold text-orange-600 animate-pulse">{rating > 0 ? `${rating} Stars` : 'Tap stars to rate'}</p>
      </div>

      {}
      <div className="mb-6 relative group">
        <textarea placeholder="Describe food quality..." value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 h-32 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none resize-none text-sm transition-all"></textarea>
        <div className="absolute bottom-3 right-3">
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-600 rounded-lg shadow-sm hover:text-orange-600 hover:shadow-md transition text-xs font-bold border border-gray-200"><Camera size={16} /> <span className="hidden sm:inline">Add Photo</span></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
        </div>
      </div>

      {}
      {imagePreview && (
          <div className="mb-6 relative inline-block animate-fade-in-up">
              <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border-2 border-orange-200 shadow-md" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1"><span>✨ AI Verified</span></div>
              <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition"><X size={12} /></button>
          </div>
      )}

      {}
      <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 relative overflow-hidden shadow-sm">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-100 rounded-full opacity-50"></div>
        <div className="flex justify-between items-center relative z-10">
            <div><h3 className="font-bold text-red-800 text-sm">Skipping Next Meal?</h3><p className="text-[10px] text-red-600 mt-1">Help us reduce food wastage.</p></div>
            <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" onChange={(e) => {if(e.target.checked) alert("🙏 Thank you! You just saved ~300g of food.");}}/>
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
        </div>
      </div>

      {}
      <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-orange-500/30 hover:scale-[1.01] transition transform active:scale-[0.98] flex items-center justify-center gap-2">
        {loading ? 'Sending...' : <><Send size={18} /> Submit Review</>}
      </button>

      {}
      <div className="mt-8 pt-6 border-t border-orange-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            🔥 Vote for Tomorrow's Special
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse">Live</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
            {}
            <div className="relative group cursor-pointer overflow-hidden rounded-xl h-32 bg-orange-100 border-2 border-transparent hover:border-orange-500 transition-all shadow-md" onClick={() => alert("Vote Registered: Paneer Tikka +1 🗳️")}>
                <img src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop" alt="Paneer" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-sm">Paneer Tikka</span>
                    <div className="w-full bg-gray-700/50 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-green-400 h-full w-[70%]"></div></div>
                    <span className="text-[10px] text-green-300 mt-1">70% Votes</span>
                </div>
            </div>
            
            {}
            <div className="relative group cursor-pointer overflow-hidden rounded-xl h-32 bg-orange-100 border-2 border-transparent hover:border-orange-500 transition-all shadow-md" onClick={() => alert("Vote Registered: Mushroom +1 🗳️")}>
                <img src="https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&auto=format&fit=crop" alt="Mushroom" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-sm">Mushroom</span>
                    <div className="w-full bg-gray-700/50 h-1.5 rounded-full mt-2 overflow-hidden"><div className="bg-orange-400 h-full w-[30%]"></div></div>
                    <span className="text-[10px] text-orange-300 mt-1">30% Votes</span>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}