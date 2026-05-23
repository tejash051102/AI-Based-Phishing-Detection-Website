import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    await api.post("/auth/reset-password", { token, password });
    toast.success("Password reset successful");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-white/10 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold">Create new password</h1>
        <input className="mt-5 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
        <button className="mt-4 w-full rounded bg-cyber-500 px-4 py-3 font-bold">Update password</button>
        <Link to="/login" className="mt-4 block text-center text-sm text-cyber-400">Back to login</Link>
      </form>
    </div>
  );
}

