import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
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
            <div className="grid h-12 w-12 place-items-center rounded bg-cyber-500 shadow-glow">
              <ShieldCheck />
            </div>
            <span className="text-2xl font-bold">PhishGuard AI</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">AI-powered phishing defense for URLs, emails, and suspicious files.</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Scan threats, monitor history, export evidence, and give administrators the controls they need to respond quickly.
          </p>
        </section>
        <form onSubmit={submit} className="glass rounded border border-white/10 p-6 shadow-glow">
          <h2 className="text-2xl font-bold">{isRegister ? "Create account" : "Sign in"}</h2>
          <p className="mt-1 text-sm text-slate-300">{isRegister ? "Start monitoring suspicious messages." : "Return to your security console."}</p>
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

