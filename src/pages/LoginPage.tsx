import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName });
        
        // Create user doc in firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: user.email?.toLowerCase() === 'mcgeehayjay@gmail.com' ? 'admin' : 'user',
          createdAt: serverTimestamp()
        });
        
        // Trigger Welcome Email
        try {
          await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: displayName })
          });
        } catch (emailErr) {
          console.error("Welcome email failed:", emailErr);
        }
      }
      
      // Smart redirect
      if (email.toLowerCase() === 'mcgeehayjay@gmail.com') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists in firestore, if not create
      const userRef = doc(db, 'users', user.uid);
      
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (err: any) {
        // Structured error for permission debugging
        const errInfo = {
          error: err.message,
          operationType: 'get',
          path: `users/${user.uid}`,
          authInfo: {
            userId: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          }
        };
        console.error('Firestore Permission Error:', JSON.stringify(errInfo));
        throw new Error(JSON.stringify(errInfo));
      }
      
      if (!userSnap.exists()) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          role: user.email?.toLowerCase() === 'mcgeehayjay@gmail.com' ? 'admin' : 'user',
          createdAt: serverTimestamp()
        };

        try {
          await setDoc(userRef, userData);
        } catch (err: any) {
          const errInfo = {
            error: err.message,
            operationType: 'write',
            path: `users/${user.uid}`,
            authInfo: {
              userId: user.uid,
              email: user.email,
              emailVerified: user.emailVerified
            }
          };
          console.error('Firestore Permission Error during creation:', JSON.stringify(errInfo));
          throw new Error(JSON.stringify(errInfo));
        }
      } else if (user.email?.toLowerCase() === 'mcgeehayjay@gmail.com' && userSnap.data()?.role !== 'admin') {
        // Ensure existing admin account has the correct role in DB
        await setDoc(userRef, { role: 'admin' }, { merge: true });
      }
      
      if (user.email?.toLowerCase() === 'mcgeehayjay@gmail.com') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      // Try to parse JSON if it's our structured error
      try {
        const parsed = JSON.parse(err.message);
        setError(`Permission Denied: ${parsed.operationType} on ${parsed.path}`);
      } catch {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-neutral-100/50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 md:p-12 shadow-2xl rounded-3xl"
      >
        <div className="text-center mb-10">
          <h1 className="editorial-heading text-3xl mb-2 text-brand-charcoal">
            {isLogin ? 'Welcome Back' : 'Join the Atelier'}
          </h1>
          <p className="text-xs text-brand-charcoal/40 uppercase tracking-widest font-bold">
            {isLogin ? 'Enter your details to access your dashboard' : 'Create an account for personalized bridal care'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/20" />
              <input 
                type="text" 
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-4 py-4 bg-neutral-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-charcoal/5 outline-none transition-all"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/20" />
            <input 
              type="email" 
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-4 py-4 bg-neutral-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-charcoal/5 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/20" />
            <input 
              type="password" 
              placeholder="Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-neutral-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-charcoal/5 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-charcoal text-white py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black hover:bg-brand-rose transition-all flex items-center justify-center gap-2 group shadow-xl disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-grow h-px bg-neutral-100"></div>
          <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/20 font-black">Or</span>
          <div className="flex-grow h-px bg-neutral-100"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-neutral-100 py-5 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black text-brand-charcoal hover:bg-neutral-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Chrome size={16} />
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-brand-charcoal hover:text-brand-rose transition-colors ml-1"
          >
            {isLogin ? 'Join Now' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
