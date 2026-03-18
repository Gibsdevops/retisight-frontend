import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('patient');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Step 1: Sign up user
        const { data: { user }, error: authError } = await supabase.auth.signUp({
          email,
          password
        });

        if (authError) {
          toast.error(`Signup Error: ${authError.message}`);
          setLoading(false);
          return;
        }

        if (!user) {
          toast.error('Signup failed - no user returned');
          setLoading(false);
          return;
        }

        // Step 2: Wait a moment for user to be created in auth
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: fullName,
              role: role
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error(`Profile Error: ${profileError.message}`);
          setLoading(false);
          return;
        }

        toast.success('✅ Account created! Check your email to confirm, then login.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast.error(`Login Error: ${error.message}`);
          setLoading(false);
          return;
        }

        toast.success('✅ Logged in successfully!');
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
        {isSignUp ? '🏥 Create Medical Account' : '🔐 Secure Provider Login'}
      </h2>

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 outline-none"
              >
                <option value="patient">👤 Patient</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-medical-600 focus:ring-2 focus:ring-medical-100 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-medical-600 hover:bg-medical-700'
          }`}
        >
          {loading ? '⏳ Processing...' : isSignUp ? '📝 Sign Up' : '🔓 Login'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full mt-4 text-sm text-slate-600 hover:text-medical-600 transition-colors font-semibold"
      >
        {isSignUp
          ? '✓ Already have an account? Login'
          : '✎ New here? Create account'}
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs text-blue-700">
          📧 <strong>Note:</strong> New accounts require email confirmation before login.
        </p>
      </div>
    </div>
  );
};

export default Login;