import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Scan,
  FlaskConical,
  Cloud,
  LayoutDashboard,
  Bell,
  Map,
} from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import FeatureCard from "@/components/FeatureCard";
import heroImage from "@/assets/hero-wheat-field.jpg";


const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

const [language, setLanguage] = useState("en"); // ✅ NEW
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Translations
  const t = {
    en: {
      heading1: "Protect Your Yield with",
      heading2: "AI-Powered Wheat Diagnostics",
      desc: "Instantly detect wheat diseases, receive expert remedies, and monitor field health with the power of Agri Lens.",
      loginMsg: "Please login / register to scan 🌾",
      startBtn: "Start Scanning Now",
      features: "Key Features",
      why: "Why AgriLens?",
      whyDesc: "AgriLens modernizes how farmers detect and prevent crop diseases.",
      contact: "Reach out!!",
      fullName: "Full Name",
      lastName: "Last Name",
      email: "Email",
      message: "Message",
      submit: "Submit",
      placeholders: {
        name: "Your name",
        last: "Your last name",
        email: "your@email.com",
        message: "How can we help you?"
      }
    },
    te: {
      heading1: "మీ దిగుబడిని రక్షించండి",
      heading2: "AI ఆధారిత గోధుమ వ్యాధి నిర్ధారణ",
      desc: "గోధుమ వ్యాధులను వెంటనే గుర్తించండి, నిపుణుల పరిష్కారాలు పొందండి మరియు Agri Lens సహాయంతో పంట ఆరోగ్యాన్ని పర్యవేక్షించండి.",
      loginMsg: "స్కాన్ చేయడానికి దయచేసి లాగిన్ / నమోదు చేయండి 🌾",
      startBtn: "స్కాన్ ప్రారంభించండి",
      features: "ప్రధాన లక్షణాలు",
      why: "ఎందుకు AgriLens?",
      whyDesc: "AgriLens రైతులు పంట వ్యాధులను గుర్తించి నివారించే విధానాన్ని ఆధునికంగా మారుస్తుంది.",
      contact: "మమ్మల్ని సంప్రదించండి!!",
      fullName: "పూర్తి పేరు",
      lastName: "చివరి పేరు",
      email: "ఈమెయిల్",
      message: "సందేశం",
      submit: "సమర్పించండి",
      placeholders: {
        name: "మీ పేరు",
        last: "మీ చివరి పేరు",
        email: "మీ ఈమెయిల్",
        message: "మేము మీకు ఎలా సహాయం చేయగలం?"
      }
    }
  };

  const text = t[language];

  // ✅ Get logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (location.state?.scrollTo === "features") {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const handleStartScanning = () => {
    if (!user) {
      navigate("/login", {
        state: { message: "Please login or register to scan" },
      });
    } else {
      navigate("/model");
    }
  };

  const features = [
    { icon: Scan, title: language === "te" ? "AI ఆధారిత నిర్ధారణ" : "AI-Powered Instant Diagnosis" },
    { icon: FlaskConical, title: language === "te" ? "ఖచ్చితమైన పరిష్కారం" : "Precision Remedy Engine" },
    { icon: Cloud, title: language === "te" ? "స్థానిక వాతావరణ సమాచారం" : "Hyper-Local Weather Intelligence" },
    { icon: LayoutDashboard, title: language === "te" ? "ఇంటరాక్టివ్ డాష్‌బోర్డ్" : "Interactive Health Dashboard" },
    { icon: Bell, title: language === "te" ? "ముందస్తు హెచ్చరిక వ్యవస్థ" : "Early Warning System" },
    { icon: Map, title: language === "te" ? "వినియోగదారు ధృవీకరణ" : "User Authentication" },
  ];

  const benefits = [
    {
      title: language === "te" ? "20% దిగుబడి నష్టాన్ని నివారించండి" : "Prevent 20% Yield Loss",
      description:
        language === "te"
          ? "రస్ట్ మరియు సెప్టోరియా వంటి వ్యాధులు గ్లోబల్ ఉత్పత్తిలో 20% వరకు నష్టాన్ని కలిగిస్తాయి. AgriLens వీటిని ప్రారంభ దశలోనే గుర్తిస్తుంది."
          : "Wheat diseases like Rust and Septoria can destroy up to 20% of global production annually."
    },
    {
      title: language === "te" ? "నిపుణుల లోటును తగ్గించండి" : "Bridge the Expert Gap",
      description:
        language === "te"
          ? "మీకు ప్రత్యేక డిగ్రీ అవసరం లేదు — AgriLens వెంటనే సరైన సూచనలు ఇస్తుంది."
          : "AgriLens provides 95% accurate diagnoses and expert-verified treatments instantly."
    },
    {
      title: language === "te" ? "రసాయన ఖర్చులు తగ్గించండి" : "Reduce Chemical Costs",
      description:
        language === "te"
          ? "అవసరమైన చోట మాత్రమే మందులు వాడండి."
          : "Apply fungicides only where they matter."
    },
    {
      title: language === "te" ? "వాతావరణానికి ముందుగా సిద్ధంగా ఉండండి" : "Stay Ahead of the Weather",
      description:
        language === "te"
          ? "వాతావరణ మార్పులతో వ్యాధులను ముందే అంచనా వేయండి."
          : "AgriLens predicts outbreaks using weather trends."
    },
  ];

  return (
    <Layout>

      {/* Hero Section */}
      <section className="relative">
        <div
          className="h-[500px] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
           {/* ✅ Language Toggle - Floating over hero image */}
    <div className="absolute top-4 right-4 z-20">
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          borderRadius: "999px",
          padding: "3px",
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
              background:
                language === code
                  ? "rgba(255, 255, 255, 0.88)"
                  : "transparent",
              color:
                language === code
                  ? "#1a4d2e"
                  : "rgba(255, 255, 255, 0.85)",
              transition: "all 0.2s ease",
              boxShadow:
                language === code
                  ? "0 1px 4px rgba(0,0,0,0.15)"
                  : "none",
            }}
          >
            <span style={{ fontSize: "14px", lineHeight: 1 }}>{flag}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div className="max-w-2xl text-primary-foreground">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                {text.heading1}
                <span className="block text-agri-yellow">
                  {text.heading2}
                </span>
              </h1>

              <p className="text-lg md:text-xl mb-6 text-primary-foreground/90">
                {text.desc}
              </p>

              {!user && (
                <p className="mb-3 text-sm font-medium text-agri-yellow">
                  {text.loginMsg}
                </p>
              )}

              <button
                onClick={handleStartScanning}
                className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-lg font-heading font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                {text.startBtn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-background scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">{text.features}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} />
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-4">{text.why}</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">{text.whyDesc}</p>

          <div className="space-y-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="font-heading font-semibold text-lg text-primary mb-2">
                  • {b.title}
                </h3>
                <p className="text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8 text-center">{text.contact}</h2>

          <div className="max-w-xl mx-auto">
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder={text.placeholders.name} className="w-full px-4 py-3 border rounded-lg" />
                <input placeholder={text.placeholders.last} className="w-full px-4 py-3 border rounded-lg" />
              </div>

              <input placeholder={text.placeholders.email} className="w-full px-4 py-3 border rounded-lg" />

              <textarea rows={4} placeholder={text.placeholders.message} className="w-full px-4 py-3 border rounded-lg" />

              <div className="flex justify-center">
                <button className="btn-submit w-full md:w-auto">
                  {text.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Index;