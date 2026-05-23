import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying email...");

  useEffect(() => {
    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => setMessage(res.data.message))
      .catch((error) => setMessage(error.response?.data?.message || "Verification failed"));
  }, [token]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded border border-white/10 bg-slate-900 p-6 text-center">
        <h1 className="text-2xl font-bold">Email verification</h1>
        <p className="mt-4 text-slate-300">{message}</p>
        <Link to="/login" className="mt-5 inline-block rounded bg-cyber-500 px-4 py-2 font-semibold">Continue</Link>
      </div>
    </div>
  );
}

