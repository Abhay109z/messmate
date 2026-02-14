import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 👈 NEW
  const [loading, setLoading] = useState(true);

  // 🔥 Create user document if not exists
  const createUserIfNotExists = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        role: "user", // 👈 default role
        createdAt: new Date(),
      });
      setRole("user");
    } else {
      setRole(userSnap.data().role);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserIfNotExists(currentUser);
      } else {
        setRole(null);
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert("Login Failed: " + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // 🔥 Demo Login (for recruiters)
  const demoLogin = () => {
    const demoUser = {
      uid: "demo-user-123",
      email: "demo@messmate.com",
      displayName: "Demo User",
      photoURL: "",
    };

    setUser(demoUser);
    setRole("user");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, demoLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
