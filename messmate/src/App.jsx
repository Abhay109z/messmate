import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import StudentView from './StudentView';
import AdminView from './AdminView';
import { AuthProvider, useAuth } from './AuthContext';
import { LogIn, LogOut } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const { user, login, demoLogin } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Admin Access Required
        </h2>

        <p className="mb-6 text-gray-500">
          Sign in or explore using demo mode.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={login}
            className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold"
          >
            Sign in with Google
          </button>

          <button
            onClick={() => {
              demoLogin();
              navigate("/admin");
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold"
          >
            🚀 Enter Demo Mode
          </button>
        </div>
      </div>
    );
  }

  return children;
};

function AuthButton() {
  const { user, login, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <button
        onClick={logout}
        className="text-white font-bold flex items-center gap-2"
      >
        <LogOut size={16} />
        Logout
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={login}
        className="bg-white text-red-600 px-4 py-1 rounded-full font-bold"
      >
        <LogIn size={16} />
        Login
      </button>

      <button
        onClick={() => {
          demoLogin();
          navigate("/admin");
        }}
        className="bg-blue-600 text-white px-4 py-1 rounded-full font-bold"
      >
        Demo
      </button>
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-orange-50 text-gray-800">

        <nav className="bg-red-600 text-white p-4 flex justify-between">
          <h1 className="font-bold text-xl">🍲 MessMate</h1>
          <AuthButton />
        </nav>

        <div className="max-w-6xl mx-auto p-6">
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

      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
