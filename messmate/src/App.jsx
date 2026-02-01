import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StudentView from './StudentView';
import AdminView from './AdminView';
import { AuthProvider, useAuth } from './AuthContext';
import { LogIn, LogOut, ShieldAlert } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const { user, login } = useAuth();
  
  const adminEmails = ["abhayk78554@gmail.com"]; 

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Access Required</h2>
        <p className="mb-6 text-gray-500">Please sign in to manage the mess.</p>
        <button onClick={login} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full hover:shadow-xl hover:scale-105 transform transition font-bold shadow-lg">
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!adminEmails.includes(user.email)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-600">
        <ShieldAlert size={64} className="mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-600 mt-2">You are logged in as {user.email}</p>
        <p className="text-sm mt-1">Only committee members are authorized.</p>
      </div>
    );
  }
  return children;
};


function AuthButton() {
  const { user, login, logout } = useAuth();

  if (user) {
    const initial = user.email ? user.email.charAt(0).toUpperCase() : "U";

    return (
      
      <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full">
        
        {}
        <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-white/50 flex items-center justify-center shadow-sm">
           <span className="text-xs font-bold text-red-800">{initial}</span>
        </div>

        <button 
          onClick={logout} 
          className="text-xs text-white font-bold hover:text-yellow-200 flex items-center gap-1 transition"
        >
          <LogOut size={16} /> 
          LOGOUT
        </button>
      </div>
    );
  }

  return (
    
    <button 
      onClick={login} 
      className="bg-white text-red-600 px-5 py-1.5 rounded-full font-bold hover:bg-yellow-50 hover:shadow-lg transition shadow-md flex items-center gap-2"
    >
      <LogIn size={16} /> LOGIN
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {}
        <div className="min-h-screen bg-orange-50/60 text-gray-800 font-sans flex flex-col">
          
          {}
          <nav className="bg-gradient-to-r from-red-600 via-orange-500 to-red-500 text-white p-4 shadow-xl sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
              <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
                {}
                🍲 MessMate
              </h1>
              
              <div className="flex items-center gap-6">
                <div className="space-x-4 text-sm font-bold tracking-wide hidden md:block">
                  <Link to="/" className="hover:text-yellow-200 transition duration-200">Rate Meal</Link>
                  <Link to="/admin" className="hover:text-yellow-200 transition duration-200 opacity-90 hover:opacity-100">Admin Dashboard</Link>
                </div>
                <AuthButton />
              </div>
            </div>
          </nav>

          <main className="flex-grow flex justify-center w-full pt-10 px-4">
            <div className="w-full max-w-6xl"> 
              <Routes>
                <Route path="/" element={<StudentView />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminView />
                    </ProtectedAdminRoute>
                  } 
                />
              </Routes>
            </div>
          </main>
          
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}