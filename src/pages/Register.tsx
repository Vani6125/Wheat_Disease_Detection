import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import heroImage from "@/assets/hero-wheat-field.jpg";
import { Wheat, CheckCircle, AlertCircle, Menu, X } from "lucide-react";
import { Home, Info, Phone } from "lucide-react";

const Register = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const t = {
    en: {
      home: "Home",
      about: "About us",
      contact: "Contact us",
      registerTitle: "Register",
      name: "Name",
      namePlaceholder: "Enter your full name",
      phone: "Phone Number",
      phonePlaceholder: "+91 XXX-XXX-XXXX",
      phoneHint: "Enter a valid Indian mobile number",
      pin: "6-Digit PIN",
      pinPlaceholder: "●●●●●●",
      pinHint: "Must be exactly 6 digits",
      confirmPin: "Confirm PIN",
      pinMismatch: "PINs do not match",
      registerBtn: "Register Now",
      registering: "Creating Account...",
      haveAccount: "Already have an account?",
      login: "Login",
      successTitle: "Success!",
      warningTitle: "Warning",
      errorTitle: "Error",
      successMsg: "Registration successful! Redirecting to login...",
      pinNoMatch: "PINs do not match! Please try again.",
      pinLength: "PIN must be exactly 6 digits",
      invalidPhone: "Please enter a valid Indian phone number",
      networkError: "Network error. Please check your connection and try again.",
    },
    te: {
      home: "హోమ్",
      about: "మా గురించి",
      contact: "సంప్రదించండి",
      registerTitle: "నమోదు",
      name: "పేరు",
      namePlaceholder: "మీ పూర్తి పేరు నమోదు చేయండి",
      phone: "ఫోన్ నంబర్",
      phonePlaceholder: "+91 XXX-XXX-XXXX",
      phoneHint: "చెల్లుబాటు అయ్యే భారతీయ మొబైల్ నంబర్ నమోదు చేయండి",
      pin: "6 అంకెల పిన్",
      pinPlaceholder: "●●●●●●",
      pinHint: "సరిగ్గా 6 అంకెలు ఉండాలి",
      confirmPin: "పిన్ నిర్ధారించండి",
      pinMismatch: "పిన్‌లు సరిపోలడం లేదు",
      registerBtn: "నమోదు చేసుకోండి",
      registering: "అకౌంట్ సృష్టిస్తోంది...",
      haveAccount: "ఇప్పటికే అకౌంట్ ఉందా?",
      login: "లాగిన్",
      successTitle: "విజయవంతం!",
      warningTitle: "హెచ్చరిక",
      errorTitle: "లోపం",
      successMsg: "నమోదు విజయవంతమైంది! లాగిన్‌కు దారి మళ్ళిస్తోంది...",
      pinNoMatch: "పిన్‌లు సరిపోలడం లేదు! దయచేసి మళ్ళీ ప్రయత్నించండి.",
      pinLength: "పిన్ సరిగ్గా 6 అంకెలు ఉండాలి",
      invalidPhone: "దయచేసి చెల్లుబాటు అయ్యే భారతీయ ఫోన్ నంబర్ నమోదు చేయండి",
      networkError: "నెట్‌వర్క్ లోపం. దయచేసి మీ కనెక్షన్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.",
    },
  };

  const text = t[language];

  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: text.home, path: "/", icon: <Home className="h-4 w-4" /> },
    { name: text.about, path: "/about", icon: <Info className="h-4 w-4" /> },
    { name: text.contact, path: "/contact", icon: <Phone className="h-4 w-4" /> },
  ];

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pin: "",
    confirmPin: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
    show: boolean;
  }>({ message: "", type: "success", show: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "success", show: false });
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.pin !== formData.confirmPin) {
      showNotification(text.pinNoMatch, "warning");
      setIsLoading(false);
      return;
    }
    if (formData.pin.length !== 6) {
      showNotification(text.pinLength, "warning");
      setIsLoading(false);
      return;
    }
    if (!/^(\+91|91)?[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ""))) {
      showNotification(text.invalidPhone, "warning");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, phone: formData.phone, pin: formData.pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.message || "Registration failed. Please try again.", "error");
        setIsLoading(false);
        return;
      }

      showNotification(text.successMsg, "success");
      setFormData({ name: "", phone: "", pin: "", confirmPin: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch {
      showNotification(text.networkError, "error");
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-6 w-6" />;
      case "warning": return <AlertCircle className="h-6 w-6" />;
      case "error": return (
        <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">!</span>
        </div>
      );
      default: return null;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
      case "warning": return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case "error": return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200";
      default: return "";
    }
  };

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-800";
      case "warning": return "text-yellow-800";
      case "error": return "text-red-800";
      default: return "";
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "";
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "success": return text.successTitle;
      case "warning": return text.warningTitle;
      case "error": return text.errorTitle;
      default: return "";
    }
  };

  // Language Toggle
  const LanguageToggle = () => (
    <div className="flex justify-end px-6 pt-3 pb-2  relative z-10">
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          background: "rgba(255, 255, 255, 0.92)",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "999px",
          padding: "3px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
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
          className={`fixed top-20 right-4 z-50 animate-slideIn ${getNotificationBgColor(notification.type)} border rounded-2xl shadow-xl max-w-md overflow-hidden transition-all duration-300`}
        >
          <div className="p-5">
            <div className="flex items-start">
              <div className={`flex-shrink-0 mr-3 ${getNotificationIconColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`font-semibold mb-1 ${getNotificationTextColor(notification.type)}`}>
                  {getNotificationTitle(notification.type)}
                </p>
                <p className={`text-sm ${getNotificationTextColor(notification.type)}`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className={`ml-4 text-lg font-bold hover:opacity-70 ${getNotificationTextColor(notification.type)}`}
              >
                ×
              </button>
            </div>
          </div>
          <div className="h-1.5 w-full bg-gray-200">
            <div
              className={`h-full ${
                notification.type === "success" ? "bg-green-500"
                  : notification.type === "warning" ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ animation: "progressBar 4s linear", animationFillMode: "forwards" }}
            />
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
              <span className="font-heading font-bold text-xl text-primary">AGRILENS</span>
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
                  <div className="flex items-center gap-2">{link.icon}{link.name}</div>
                </Link>
              ))}
            </nav>

            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
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
                      isActive(link.path) ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-secondary"
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

      {/* Main Content */}
      <main className="flex-1 relative bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-black/30" />

        {/* Language Toggle - below header, over background */}
        <LanguageToggle />

        <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-72px)]">
          <div className="w-full max-w-md">
            <div className="bg-card/95 backdrop-blur rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <span className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-heading font-bold text-2xl italic shadow-lg">
                  {text.registerTitle}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">{text.name}</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder={text.namePlaceholder}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    required disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">{text.phone}</label>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder={text.phonePlaceholder}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    required disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{text.phoneHint}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">{text.pin}</label>
                  <input
                    type="password" name="pin" value={formData.pin} onChange={handleChange}
                    placeholder={text.pinPlaceholder} maxLength={6} pattern="\d{6}"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
                    required disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{text.pinHint}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">{text.confirmPin}</label>
                  <input
                    type="password" name="confirmPin" value={formData.confirmPin} onChange={handleChange}
                    placeholder={text.pinPlaceholder} maxLength={6} pattern="\d{6}"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formData.confirmPin && formData.pin !== formData.confirmPin ? "border-red-500" : "border-input"
                    } bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200`}
                    required disabled={isLoading}
                  />
                  {formData.confirmPin && formData.pin !== formData.confirmPin && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {text.pinMismatch}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                    isLoading ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:shadow-lg"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {text.registering}
                    </>
                  ) : text.registerBtn}
                </button>

                <p className="text-center text-sm text-muted-foreground pt-4">
                  {text.haveAccount}{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline hover:text-primary/80 transition-colors duration-200">
                    {text.login}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Register;