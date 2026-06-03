import { Link, useNavigate } from "react-router-dom";
import { BarChart3, FileSearch, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isRegister) await register(form);
      else await login(form.email, form.password);
      toast.success("Access granted");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyber-grid min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="mb-6 flex items-center gap-3">
            <img src="/logo.svg" alt="PhishGuard AI" className="h-40 w-40 rounded bg-white object-contain p-2 shadow-glow sm:h-48 sm:w-48" />
            <span className="text-2xl font-bold">PhishGuard AI</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Enterprise-grade AI phishing defense for modern teams.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Detect malicious URLs, inspect suspicious emails, manage evidence, and monitor organizational risk from one professional security console.
          </p>
          <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <ShieldCheck className="text-cyber-400" size={20} />
              <p className="mt-2 text-sm font-bold">Real-time protection</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <FileSearch className="text-cyber-400" size={20} />
              <p className="mt-2 text-sm font-bold">Evidence reports</p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-3">
              <BarChart3 className="text-cyber-400" size={20} />
              <p className="mt-2 text-sm font-bold">Risk analytics</p>
            </div>
          </div>
          <Link to="/quick-scan" className="mt-6 inline-flex rounded bg-cyber-500 px-5 py-3 font-bold text-white shadow-glow">
            Try public quick scan
          </Link>
        </section>
        <form onSubmit={submit} className="glass rounded border border-white/10 p-6 shadow-glow">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-cyber-400">Secure Access</p>
          <h2 className="text-2xl font-bold">{isRegister ? "Create workspace account" : "Sign in to console"}</h2>
          <p className="mt-1 text-sm text-slate-300">{isRegister ? "Start monitoring suspicious messages with a managed account." : "Return to your organization security workspace."}</p>
          {isRegister && (
            <label className="mt-5 block text-sm">
              Name
              <input className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyber-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
          )}
          <label className="mt-5 block text-sm">
            Email
            <input type="email" className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyber-400" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="mt-5 block text-sm">
            Password
            <input type="password" className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyber-400" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button disabled={loading} className="mt-6 w-full rounded bg-cyber-500 px-4 py-3 font-bold text-white transition hover:bg-cyber-600 disabled:opacity-60">
            {loading ? "Checking..." : isRegister ? "Register" : "Login"}
          </button>
          {!isRegister && (
            <Link className="mt-3 block text-center text-sm font-semibold text-cyber-400" to="/forgot-password">
              Forgot password?
            </Link>
          )}
          <p className="mt-4 text-center text-sm text-slate-300">
            {isRegister ? "Already protected?" : "New here?"}{" "}
            <Link className="font-semibold text-cyber-400" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Login" : "Create account"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
