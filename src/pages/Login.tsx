import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Wheat, CheckCircle, Info, Menu, X } from "lucide-react";
import farmerTech from "@/assets/farmer-tech-illustration.png";
import farmerField from "@/assets/farmer-field.jpg";
import { Home, Phone } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showPin, setShowPin] = useState(false);

  const t = {
    en: {
      home: "Home",
      about: "About us",
      contact: "Contact us",
      loginTitle: "Login",
      phone: "Ph.no",
      phonePlaceholder: "+91 XXX-XXX-XXXX",
      pin: "PIN",
      pinPlaceholder: "6 - digit pin code",
      loginBtn: "Login",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      register: "Register",
      loginSuccess: "Login successful! Redirecting...",
      loginFailed: "Login failed",
      networkError: "Network error. Please try again.",
    },
    te: {
      home: "హోమ్",
      about: "మా గురించి",
      contact: "సంప్రదించండి",
      loginTitle: "లాగిన్",
      phone: "ఫోన్ నం.",
      phonePlaceholder: "+91 XXX-XXX-XXXX",
      pin: "పిన్",
      pinPlaceholder: "6 అంకెల పిన్ కోడ్",
      loginBtn: "లాగిన్ చేయండి",
      loggingIn: "లాగిన్ అవుతోంది...",
      noAccount: "అకౌంట్ లేదా?",
      register: "నమోదు చేసుకోండి",
      loginSuccess: "విజయవంతంగా లాగిన్ అయ్యారు! దారి మళ్ళిస్తోంది...",
      loginFailed: "లాగిన్ విఫలమైంది",
      networkError: "నెట్‌వర్క్ లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    },
  };

  const text = t[language];

  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const message = location.state?.message;

  const navLinks = [
    { name: text.home, path: "/", icon: <Home className="h-4 w-4" /> },
    { name: text.about, path: "/about", icon: <Info className="h-4 w-4" /> },
    { name: text.contact, path: "/contact", icon: <Phone className="h-4 w-4" /> },
  ];

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({ message: "", type: "success", show: false });

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "success", show: false });
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.message || text.loginFailed, "error");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showNotification(text.loginSuccess, "success");

      setTimeout(() => {
        navigate("/model");
      }, 1500);
    } catch {
      showNotification(text.networkError, "error");
      setIsLoading(false);
    }
  };

  // Language Toggle component
  const LanguageToggle = ({ bg = "bg-agri-mint" }: { bg?: string }) => (
    <div className={`flex justify-end px-6 pt-3 pb-2 ${bg}`}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          background: "rgba(255, 255, 255, 0.92)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "999px",
          padding: "3px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        }}
      >
        {[
          { code: "en", flag: "🇬🇧", label: "English" },
          { code: "te", flag: "🇮🇳", label: "తెలుగు" },
        ].map(({ code, flag, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: language === code ? "600" : "400",
              border: "none",
              cursor: "pointer",
              background: language === code ? "#1a4d2e" : "transparent",
              color: language === code ? "#ffffff" : "#555555",
              transition: "all 0.2s ease",
              boxShadow: language === code ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>{flag}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 animate-slideIn ${
            notification.type === "success"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } border rounded-xl shadow-lg max-w-md`}
        >
          <div className="flex items-center p-4">
            <div className={`mr-3 ${notification.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {notification.type === "success" ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <span className="text-lg font-bold">!</span>
              )}
            </div>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="gradient-header sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary rounded-full p-2">
                <Wheat className="h-6 w-6 text-agri-yellow" />
              </div>
              <span className="font-heading font-bold text-xl text-primary">
                AGRILENS
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors hover:text-primary ${
                    isActive(link.path) ? "text-primary font-semibold" : "text-foreground/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon}
                    {link.name}
                  </div>
                </Link>
              ))}
            </nav>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-primary" />
              ) : (
                <Menu className="h-6 w-6 text-primary" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border/30 animate-fade-in">
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/80 hover:bg-secondary"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Language Toggle - below header */}
      <LanguageToggle bg="bg-agri-mint" />

      {/* Main Content */}
      <main className="flex-1 bg-agri-mint py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-primary/10 rounded-3xl p-8 md:p-12">

              {message && (
                <div className="mb-6 flex items-center gap-3 bg-secondary border border-primary/30 text-primary px-5 py-4 rounded-xl font-medium">
                  <Info className="h-5 w-5" />
                  {message}
                </div>
              )}

              <div className="text-center mb-8">
                <span className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-heading font-bold text-2xl shadow-lg">
                  {text.loginTitle}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="hidden md:block">
                  <img src={farmerTech} alt="Farmer with technology" className="rounded-2xl shadow-lg" />
                </div>

                <div className="bg-card rounded-2xl p-8 shadow-lg">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">
                        {text.phone}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={text.phonePlaceholder}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    <div>
  <label className="block text-sm font-medium text-primary mb-2">
    {text.pin}
  </label>
  <div className="relative">
    <input
      type={showPin ? "text" : "password"}
      value={pin}
      onChange={(e) => setPin(e.target.value)}
      placeholder={text.pinPlaceholder}
      maxLength={6}
      className="w-full px-4 py-3 pr-11 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
      required
    />
    <button
      type="button"
      onClick={() => setShowPin((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
      aria-label={showPin ? "Hide PIN" : "Show PIN"}
    >
      {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  </div>
</div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`btn-submit w-full ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      {isLoading ? text.loggingIn : text.loginBtn}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                      {text.noAccount}{" "}
                      <Link to="/register" className="text-primary font-semibold hover:underline">
                        {text.register}
                      </Link>
                    </p>
                  </form>
                </div>

                <div className="hidden md:block">
                  <img src={farmerField} alt="Farmer in wheat field" className="rounded-2xl shadow-lg h-80 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;