import { useState } from "react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [language, setLanguage] = useState("en");

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
    show: boolean;
  }>({ message: "", type: "success", show: false });

  const t = {
    en: {
      pleaseLogin: "Please login first",
      agriUser: "AgriLens User",
      fullName: "Full Name",
      phone: "Phone Number",
      logout: "Logout",
      logoutMsg: "Logged out successfully! Redirecting...",
    },
    te: {
      pleaseLogin: "దయచేసి ముందు లాగిన్ చేయండి",
      agriUser: "AgriLens వినియోగదారు",
      fullName: "పూర్తి పేరు",
      phone: "ఫోన్ నంబర్",
      logout: "లాగ్అవుట్",
      logoutMsg: "విజయవంతంగా లాగ్అవుట్ అయ్యారు! దారి మళ్ళిస్తోంది...",
    },
  };

  const text = t[language];

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: "", type: "success", show: false });
    }, 3000);
  };

  const handleLogout = () => {
    showNotification(text.logoutMsg, "success");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }, 1500);
  };

  if (!user) {
    return (
      <>
        <Header />
        <p className="text-center mt-10">{text.pleaseLogin}</p>
      </>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
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
            <div
              className={`mr-3 ${
                notification.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
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

      <Header />

      {/* Language Toggle - just below header, right-aligned */}
      <div className="flex justify-end px-6 pt-4 pb-2 bg-agri-mint">
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
                boxShadow:
                  language === code ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <span style={{ fontSize: "14px", lineHeight: 1 }}>{flag}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-screen bg-agri-mint py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Decorative header */}
            <div className="bg-primary h-32 relative">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="w-32 h-32 rounded-full bg-agri-mint border-4 border-white flex items-center justify-center shadow-lg">
                  <span className="text-primary text-5xl font-bold">
                    {getInitials(user.name)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile content */}
            <div className="pt-20 pb-8 px-6">
              <h2 className="text-2xl font-bold text-primary text-center mb-2">
                {user.name}
              </h2>
              <p className="text-gray-500 text-center mb-8">{text.agriUser}</p>

              <div className="space-y-5 bg-agri-mint-light rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{text.fullName}</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{text.phone}</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-8 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {text.logout}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Profile;