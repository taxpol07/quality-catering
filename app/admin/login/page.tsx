"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) throw authError;
      await router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Giriş yapılamadı.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-[#0a0f1a] to-[#0a0f1a]"></div>
      
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md p-8 rounded-3xl bg-[#111827] border border-slate-700 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <span className="text-slate-900 font-black text-3xl">Q</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Quality Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Giriş yapmak için bilgilerinizi girin</p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-900/20 border border-red-500/50 text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <input
          required
          placeholder="E-posta"
          type="email"
          className="w-full p-4 mb-4 rounded-2xl bg-[#0a0f1a] text-white placeholder-slate-600 border border-slate-700 focus:outline-none focus:border-amber-500 transition-all"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <input
          required
          placeholder="Şifre"
          type="password"
          className="w-full p-4 mb-6 rounded-2xl bg-[#0a0f1a] text-white placeholder-slate-600 border border-slate-700 focus:outline-none focus:border-amber-500 transition-all"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-black uppercase tracking-widest hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Yönetici Girişi"}
        </button>
      </form>
    </div>
  );
}