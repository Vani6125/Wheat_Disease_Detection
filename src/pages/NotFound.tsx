import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [language, setLanguage] = useState("en");

  const t = {
    en: {
      title: "Oops! Page not found",
      returnHome: "Return to Home",
    },
    te: {
      title: "అయ్యో! పేజీ కనుగొనబడలేదు",
      returnHome: "హోమ్‌కు తిరిగి వెళ్ళండి",
    },
  };

  const text = t[language];

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted">

      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
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

      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{text.title}</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          {text.returnHome}
        </a>
      </div>
    </div>
  );
};

export default NotFound;