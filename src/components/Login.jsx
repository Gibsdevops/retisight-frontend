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

 const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(`Attempting ${isSignUp ? 'Signup' : 'Login'} for:`, email);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: { full_name: fullName, role: role } // This stores data in the Auth meta
        }
      });
      
      if (error) {
        console.error("Signup Error:", error.message);
        alert("Signup Error: " + error.message);
      } else {
        // Create the profile row
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.user.id, full_name: fullName, role: role }
        ]);
        if (profileError) console.error("Profile Insert Error:", profileError);
        alert("Signup Successful! You can now login.");
      }
    } else {
      // LOGIN LOGIC
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login Error:", error.message); // THIS WILL TELL US THE REAL PROBLEM
        alert("Login Error: " + error.message);
      } else {
        console.log("Login Success:", data.user.email);
      }
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