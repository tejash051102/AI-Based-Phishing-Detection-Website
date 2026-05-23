import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [devToken, setDevToken] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const { data } = await api.post("/auth/forgot-password", { email });
    setDevToken(data.resetToken || "");
    toast.success(data.message);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-white/10 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-2 text-sm text-slate-300">Enter your email and we will send a reset link.</p>
        <input className="mt-5 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <button className="mt-4 w-full rounded bg-cyber-500 px-4 py-3 font-bold">Send reset link</button>
        {devToken && <p className="mt-4 break-all text-xs text-cyber-400">Dev token: {devToken}</p>}
        <Link to="/login" className="mt-4 block text-center text-sm text-cyber-400">Back to login</Link>
      </form>
    </div>
  );
}

