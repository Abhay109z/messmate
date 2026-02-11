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
        const hostname = window.location.hostname;
        const isLocalhost =
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.endsWith(".local");
        const baseMessage = `Login Failed: Domain "${hostname}" is not authorized in Firebase.`;
        if (isLocalhost) {
          const useDevMode = window.confirm(
            `${baseMessage}\n\nDo you want to use DEV MODE (Mock Login) to test the app?`
          );
          if (useDevMode) {
            setUser({
              uid: "dev-admin-123",
              email: "abhayk78554@gmail.com",
              displayName: "Dev Admin",
              photoURL: ""
            });
          }
        } else {
          alert(
            `${baseMessage}\n\nPlease add this domain in Firebase Console > Authentication > Settings > Authorized domains.`
          );
        }
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("Popup closed by user");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Login Failed: Popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log("Popup request cancelled");
      } else {
        alert("Login Failed: " + error.message);
      }
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting Logout...");
      await signOut(auth);
      setUser(null); // Explicitly clear user state for both Firebase and Dev Mode
      console.log("Logged Out Successfully");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const devLogin = () => {
    setUser({
      uid: "dev-admin-123",
      email: "abhayk78554@gmail.com",
      displayName: "Dev Admin",
      photoURL: ""
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, devLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
