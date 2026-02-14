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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Your admin email
  const OWNER_EMAIL = "abhayk78554@gmail.com";

  // 🔥 Create user document if not exists
  const createUserIfNotExists = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const assignedRole =
        firebaseUser.email === OWNER_EMAIL ? "admin" : "user";

      await setDoc(userRef, {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        role: assignedRole,
        createdAt: new Date(),
      });

      setRole(assignedRole);
    } else {
      setRole(userSnap.data().role);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserIfNotExists(currentUser);
        setUser(currentUser);
      } else {
        setUser(null);
        setRole(null);
      }

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

  // 🚀 Demo Login (Recruiter Mode)
  const demoLogin = () => {
    const demoUser = {
      uid: "demo-user-123",
      email: "demo@messmate.com",
      displayName: "Demo User",
      photoURL: "",
    };

    setUser(demoUser);
    setRole("user"); // always view-only
  };

  return (
    <AuthContext.Provider
      value={{ user, role, login, logout, loading, demoLogin }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
