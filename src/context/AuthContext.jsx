import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, db } from "../firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  reload,
  applyActionCode,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // ✅ NEW: shared role state
  const [loading, setLoading] = useState(true);

  const signup = useCallback(async (email, password, name, role) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: new Date().toISOString()
    });

    await sendEmailVerification(user);
    return user;
  }, []);

  const login = useCallback((email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(() => {
    return signOut(auth);
  }, []);

  const resetPassword = useCallback((email) => {
    return sendPasswordResetEmail(auth, email);
  }, []);

  const verifyEmailCode = useCallback(async (oobCode) => {
    try {
      await applyActionCode(auth, oobCode);
      if (currentUser) await reload(currentUser); 
      return true;
    } catch (err) {
      console.error("Invalid or expired code:", err);
      return false;
    }
  }, [currentUser]);

  const resendVerification = useCallback(async () => {
    if (currentUser) {
      await reload(currentUser); 
      await sendEmailVerification(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await reload(user);
        setCurrentUser(user);
        // ✅ Fetch role from Firestore BEFORE the app renders,
        // so guards never see a "null" role mid-load
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setUserRole(userDoc.exists() ? (userDoc.data().role || null) : null);
        } catch (err) {
          console.error("Failed to load user role:", err);
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole, // ✅ Exposed to every component
    signup,
    login,
    logout,
    resetPassword,
    resendVerification,
    verifyEmailCode,
    isEmailVerified: currentUser?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}