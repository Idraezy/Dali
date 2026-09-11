import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";

function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await signUp(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsConfirmation) {
      setNeedsConfirmation(true);
      return;
    }

    navigate("/");
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 text-white">
        <div className="w-full max-w-md bg-[#002A35] rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-2 text-[#00DA6B]">Check your email</h1>
          <p className="text-gray-300">
            We sent a confirmation link to <span className="font-semibold">{email}</span>.
            Click it to activate your account, then log in.
          </p>
          <Link to="/login">
            <button className="mt-6 w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 text-white">
      <div className="w-full max-w-md bg-[#002A35] rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-gray-400 mb-6">Join Dali Wears to shop and track your orders.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#001D23] p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#001D23] p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00DA6B] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
