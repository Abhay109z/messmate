import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed:", currentUser); 
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("Attempting Login..."); 
      await signInWithPopup(auth, provider);
      console.log("Login Success!"); 
    } catch (error) {
      console.error("LOGIN ERROR:", error); 
      if (error.code === 'auth/unauthorized-domain') {
        const useDevMode = window.confirm(
          `Login Failed: Domain "${window.location.hostname}" is not authorized in Firebase.\n\n` +
          `Do you want to use DEV MODE (Mock Login) to test the app?`
        );
        if (useDevMode) {
          setUser({
            uid: "dev-admin-123",
            email: "abhayk78554@gmail.com",
            displayName: "Dev Admin",
            photoURL: ""
          });
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("Popup closed by user");
      } else {
        alert("Login Failed: " + error.message);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Logged Out");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);