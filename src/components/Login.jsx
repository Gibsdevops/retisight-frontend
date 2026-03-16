import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('patient');
  const [isSignUp, setIsSignUp] = useState(false);

// Replace your handleAuth function in Login.jsx with this:
const handleAuth = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (isSignUp) {
    const { data: { user }, error: authError } = await supabase.auth.signUp({ email, password });
    
    if (authError) {
      alert(authError.message);
    } else if (user) {
      // Create the profile in the "Profiles" table (Capital P)
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: user.id, full_name: fullName, role: role }
      ]);

      if (profileError) {
        alert("Profile Error: " + profileError.message);
      } else {
        alert("Account created successfully! Please log in now.");
        // FORCE LOGOUT to prevent auto-login bug
        await supabase.auth.signOut(); 
        setIsSignUp(false); // Move user to login screen
      }
    }
  } else {
    // Standard Login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }
  setLoading(false);
};
  
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
        {isSignUp ? 'Create Medical Account' : 'Secure Provider Login'}
      </h2>
      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <>
            <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl" onChange={e => setFullName(e.target.value)} />
            <select className="w-full p-3 border rounded-xl" onChange={e => setRole(e.target.value)}>
              <option value="patient">I am a Patient</option>
              <option value="doctor">I am a Doctor</option>
            </select>
          </>
        )}
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-medical-600 text-white py-3 rounded-xl font-bold hover:bg-medical-700">
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-4 text-sm text-slate-500 hover:underline">
        {isSignUp ? 'Already have an account? Login' : 'New here? Create account'}
      </button>
    </div>
  );
};

export default Login;