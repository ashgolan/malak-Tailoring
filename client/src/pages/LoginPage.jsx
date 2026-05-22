import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usersApi } from "../api";
import toast from "react-hot-toast";
import { Scissors, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await usersApi.login({ email, password });
      setAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      toast.success("ברוך הבא!");
      navigate("/");
    } catch (err) {
      toast.error(typeof err.response?.data === "string" ? err.response.data : "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen roshan-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl mb-4" style={{ background: "transparent" }}>
            <img src="/icons/icon-512.png" alt="רושאן" style={{ width: 80, height: 80, objectFit: "contain" }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">מתפרת רושאן</h1>
          <p className="text-white/50 text-sm">Roshan Tailoring Management</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-6 text-center">כניסה למערכת</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                placeholder="your@email.com"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">סיסמה</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all pr-12"
                  placeholder="••••••••••"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full roshan-gold-bg hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  כניסה
                </>
              )}
            </button>
          </form>
        </div>

        {/* Copyright App */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} מתפרת רושאן — כל הזכויות שמורות
        </p>

        {/* A.Shaalan Tech signature */}
        <div style={{ textAlign: "center", marginTop: 16, paddingBottom: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: "0.06em" }}>
            פותח ועוצב על ידי
          </div>
          <img
            src="/logo-shaalan.png"
            alt="A.Shaalan Tech"
            style={{
              height: 80,  // ← كان 56
              width: "auto",
              display: "inline-block",
              filter: "brightness(0.85)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
