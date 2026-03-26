import { useState, useEffect, useRef } from "react";
import { 
  Send, Bot, Loader2, AlertCircle, Sparkles, Brain, Zap, Clock,
  Search, MessageSquare, FileText, Shield, Sprout, TrendingUp, X
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CLASS_NAMES = [
  "Aphid", "Black Rust", "Blast", "Brown Rust", "Common Root Rot",
  "Fusarium Head Blight", "Healthy", "Leaf Blight", "Mildew", "Mite",
  "Septoria", "Smut", "Stem fly", "Tan spot", "Yellow Rust", "Other Disease"
];

// Language-aware quick questions
const getQuickQuestions = (language) => {
  const en = {
    symptoms: {
      icon: <Search className="h-4 w-4" />, color: "text-blue-600",
      bgColor: "bg-blue-50", borderColor: "border-blue-200",
      questions: [
        "What are the first visible symptoms?",
        "How to distinguish this from similar diseases?",
        "What do the early signs look like?",
        "Which plant parts are affected first?",
        "How quickly do symptoms appear?"
      ]
    },
    treatment: {
      icon: <FileText className="h-4 w-4" />, color: "text-red-600",
      bgColor: "bg-red-50", borderColor: "border-red-200",
      questions: [
        "What's the most effective chemical treatment?",
        "Any home remedies I can try first?",
        "When should I apply fungicide?",
        "What's the recommended dosage?",
        "How often should I apply treatment?"
      ]
    },
    prevention: {
      icon: <Shield className="h-4 w-4" />, color: "text-green-600",
      bgColor: "bg-green-50", borderColor: "border-green-200",
      questions: [
        "How can I prevent this next season?",
        "Are there resistant wheat varieties?",
        "What cultural practices help prevent this?",
        "Should I change my irrigation pattern?",
        "What's the best crop rotation for prevention?"
      ]
    },
    impact: {
      icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-600",
      bgColor: "bg-purple-50", borderColor: "border-purple-200",
      questions: [
        "How much yield loss can I expect?",
        "Will it affect grain quality?",
        "Is the damage reversible?",
        "What's the economic impact?",
        "How does it affect harvest timing?"
      ]
    },
    causes: {
      icon: <Sprout className="h-4 w-4" />, color: "text-amber-600",
      bgColor: "bg-amber-50", borderColor: "border-amber-200",
      questions: [
        "What causes this disease to spread?",
        "Is it weather-dependent?",
        "Can soil conditions cause it?",
        "Is it seed-borne or soil-borne?",
        "What triggers disease outbreaks?"
      ]
    }
  };

  const te = {
    symptoms: {
      icon: <Search className="h-4 w-4" />, color: "text-blue-600",
      bgColor: "bg-blue-50", borderColor: "border-blue-200",
      questions: [
        "మొదటి లక్షణాలు ఏమిటి?",
        "ఇలాంటి వ్యాధుల నుండి ఎలా వేరు చేయాలి?",
        "ప్రారంభ సంకేతాలు ఎలా ఉంటాయి?",
        "ఏ మొక్క భాగాలు ముందుగా ప్రభావితమవుతాయి?",
        "లక్షణాలు ఎంత త్వరగా కనిపిస్తాయి?"
      ]
    },
    treatment: {
      icon: <FileText className="h-4 w-4" />, color: "text-red-600",
      bgColor: "bg-red-50", borderColor: "border-red-200",
      questions: [
        "అత్యంత ప్రభావవంతమైన రసాయన చికిత్స ఏమిటి?",
        "ఏమైనా ఇంటి నివారణలు ఉన్నాయా?",
        "ఎప్పుడు శిలీంద్రనాశని వేయాలి?",
        "సిఫార్సు చేసిన మోతాదు ఎంత?",
        "ఎంత తరచుగా చికిత్స చేయాలి?"
      ]
    },
    prevention: {
      icon: <Shield className="h-4 w-4" />, color: "text-green-600",
      bgColor: "bg-green-50", borderColor: "border-green-200",
      questions: [
        "వచ్చే సీజన్లో ఇది ఎలా నివారించాలి?",
        "నిరోధక గోధుమ రకాలు ఉన్నాయా?",
        "ఏ సాంస్కృతిక పద్ధతులు నివారణకు సహాయపడతాయి?",
        "నా నీటిపారుదల విధానం మార్చాలా?",
        "నివారణకు ఉత్తమ పంట మార్పిడి ఏమిటి?"
      ]
    },
    impact: {
      icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-600",
      bgColor: "bg-purple-50", borderColor: "border-purple-200",
      questions: [
        "ఎంత దిగుబడి నష్టం ఆశించవచ్చు?",
        "ధాన్యం నాణ్యతను ప్రభావితం చేస్తుందా?",
        "నష్టం తిరగబెట్టుకోవచ్చా?",
        "ఆర్థిక ప్రభావం ఎంత?",
        "కోత సమయాన్ని ఎలా ప్రభావితం చేస్తుంది?"
      ]
    },
    causes: {
      icon: <Sprout className="h-4 w-4" />, color: "text-amber-600",
      bgColor: "bg-amber-50", borderColor: "border-amber-200",
      questions: [
        "ఈ వ్యాధి వ్యాపించడానికి కారణం ఏమిటి?",
        "ఇది వాతావరణం మీద ఆధారపడి ఉంటుందా?",
        "నేల పరిస్థితులు దీనికి కారణం కాగలవా?",
        "ఇది విత్తనాల ద్వారా వ్యాపిస్తుందా లేక నేల ద్వారా?",
        "వ్యాధి వ్యాప్తికి ట్రిగ్గర్ ఏమిటి?"
      ]
    }
  };

  return language === 'te' ? te : en;
};

const TRANSLATIONS = {
  en: {
    heroTitle: "Wheat Disease AI Assistant",
    heroSubtitle: "Get expert advice on wheat diseases. Ask about symptoms, treatments, prevention, and more.",
    selectDisease: "Select Disease",
    searchPlaceholder: "Search disease...",
    selected: "Selected",
    quickQuestions: "Quick Questions",
    chatStarted: "Chat started",
    questions: "questions",
    advisingOn: "Advising on:",
    selectToBegin: "Select a disease to begin",
    newChat: "New Chat",
    welcomeTitle: "Welcome to Wheat AI Assistant",
    welcomeSubtitle: "Select a disease from the left panel and ask any question to get expert agricultural advice.",
    readyToAsk: "Ready to ask about",
    youCanAsk: "You can ask questions like:",
    pressEnter: "Press Enter to send",
    selectFirst: "Select disease",
    askAbout: "Ask about",
    errorTitle: "Error",
    aiPowered: "AI Powered Assistant",
    expertAdvice: "Expert agricultural advice",
    beta: "Beta",
    footerNote: "Note: This AI assistant provides guidance based on agricultural best practices. Always consult with local agricultural experts for field-specific recommendations.",
    you: "You",
    assistantName: "Wheat AI Assistant",
    tryAsking: "Try asking:",
    errorEnterQ: "Please enter a question",
    errorSelectD: "Please select a disease",
    errorNotSupported: "is not in our supported list. Please select from the dropdown.",
    errorNetwork: "Failed to get response. Check if backend is running.",
    categories: { symptoms: "Symptoms", treatment: "Treatment", prevention: "Prevention", impact: "Impact", causes: "Causes" },
    featureCards: [
      { label: "Symptoms", desc: "Ask about symptoms for any disease" },
      { label: "Treatment", desc: "Ask about treatment for any disease" },
      { label: "Prevention", desc: "Ask about prevention for any disease" },
      { label: "Causes", desc: "Ask about causes for any disease" },
      { label: "Impact", desc: "Ask about impact for any disease" },
      { label: "Timing", desc: "Ask about timing for any disease" },
    ]
  },
  te: {
    heroTitle: "గోధుమ వ్యాధి AI సహాయకుడు",
    heroSubtitle: "గోధుమ వ్యాధులపై నిపుణుల సలహా పొందండి. లక్షణాలు, చికిత్సలు, నివారణ మరియు మరిన్నింటి గురించి అడగండి.",
    selectDisease: "వ్యాధిని ఎంచుకోండి",
    searchPlaceholder: "వ్యాధి వెతకండి...",
    selected: "ఎంచుకున్నారు",
    quickQuestions: "త్వరిత ప్రశ్నలు",
    chatStarted: "చాట్ ప్రారంభమైంది",
    questions: "ప్రశ్నలు",
    advisingOn: "సలహా ఇస్తోంది:",
    selectToBegin: "ప్రారంభించడానికి వ్యాధిని ఎంచుకోండి",
    newChat: "కొత్త చాట్",
    welcomeTitle: "గోధుమ AI సహాయకునికి స్వాగతం",
    welcomeSubtitle: "నిపుణుల వ్యవసాయ సలహా పొందడానికి ఎడమ పలకపై వ్యాధిని ఎంచుకుని ఏదైనా ప్రశ్న అడగండి.",
    readyToAsk: "ప్రశ్నించడానికి సిద్ధంగా ఉంది",
    youCanAsk: "మీరు ఇలాంటి ప్రశ్నలు అడగవచ్చు:",
    pressEnter: "పంపడానికి Enter నొక్కండి",
    selectFirst: "వ్యాధిని ఎంచుకోండి",
    askAbout: "గురించి అడగండి",
    errorTitle: "లోపం",
    aiPowered: "AI ఆధారిత సహాయకుడు",
    expertAdvice: "నిపుణుల వ్యవసాయ సలహా",
    beta: "బీటా",
    footerNote: "గమనిక: ఈ AI సహాయకుడు వ్యవసాయ ఉత్తమ పద్ధతుల ఆధారంగా మార్గదర్శకత్వం అందిస్తుంది. పొల-నిర్దిష్ట సిఫార్సుల కోసం ఎల్లప్పుడూ స్థానిక వ్యవసాయ నిపుణులను సంప్రదించండి.",
    you: "మీరు",
    assistantName: "గోధుమ AI సహాయకుడు",
    tryAsking: "ఇవి అడగండి:",
    errorEnterQ: "దయచేసి ప్రశ్న నమోదు చేయండి",
    errorSelectD: "దయచేసి వ్యాధిని ఎంచుకోండి",
    errorNotSupported: "మా మద్దతు జాబితాలో లేదు. దయచేసి డ్రాప్‌డౌన్ నుండి ఎంచుకోండి.",
    errorNetwork: "ప్రతిస్పందన పొందడం విఫలమైంది. బ్యాకెండ్ నడుస్తోందో తనిఖీ చేయండి.",
    categories: { symptoms: "లక్షణాలు", treatment: "చికిత్స", prevention: "నివారణ", impact: "ప్రభావం", causes: "కారణాలు" },
    featureCards: [
      { label: "లక్షణాలు", desc: "ఏదైనా వ్యాధి యొక్క లక్షణాల గురించి అడగండి" },
      { label: "చికిత్స", desc: "ఏదైనా వ్యాధికి చికిత్స గురించి అడగండి" },
      { label: "నివారణ", desc: "ఏదైనా వ్యాధి నివారణ గురించి అడగండి" },
      { label: "కారణాలు", desc: "ఏదైనా వ్యాధి కారణాల గురించి అడగండి" },
      { label: "ప్రభావం", desc: "ఏదైనా వ్యాధి ప్రభావం గురించి అడగండి" },
      { label: "సమయం", desc: "ఏదైనా వ్యాధి సమయం గురించి అడగండి" },
    ]
  }
};

const CATEGORY_KEYS = ["symptoms", "treatment", "prevention", "impact", "causes"];
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WheatBot = () => {
  const [language, setLanguage] = useState("en");
  const t = TRANSLATIONS[language];
  const quickQuestions = getQuickQuestions(language);

  const [question, setQuestion] = useState("");
  const [disease, setDisease] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState("symptoms");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const normalizeDiseaseName = (name) => {
    if (!name) return "";
    const trimmed = name.trim();
    const lowerName = trimmed.toLowerCase();
    const variations = {
      "yellow rust": "Yellow Rust", "black rust": "Black Rust", "brown rust": "Brown Rust",
      "leaf blight": "Leaf Blight", "tan spot": "Tan spot", "stem fly": "Stem fly",
      "common root rot": "Common Root Rot", "fusarium head blight": "Fusarium Head Blight",
      "septoria": "Septoria", "smut": "Smut", "mildew": "Mildew", "blast": "Blast",
      "mite": "Mite", "aphid": "Aphid", "healthy": "Healthy", "other disease": "Other Disease"
    };
    if (variations[lowerName]) return variations[lowerName];
    const exactMatch = CLASS_NAMES.find(cls => cls.toLowerCase() === lowerName);
    if (exactMatch) return exactMatch;
    return trimmed;
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  useEffect(() => {
    if (disease && inputRef.current) setTimeout(() => inputRef.current.focus(), 100);
  }, [disease]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setConversationHistory([]);
    setConversationId("");
    setShowSuggestions(true);
    setActiveCategory("symptoms");
    setError("");
  };

  const askBot = async () => {
    if (!question.trim()) { setError(t.errorEnterQ); return; }
    if (!disease) { setError(t.errorSelectD); return; }
    const normalizedDisease = normalizeDiseaseName(disease);
    if (!CLASS_NAMES.includes(normalizedDisease)) {
      setError(`"${disease}" ${t.errorNotSupported}`); return;
    }
    setLoading(true); setIsTyping(true); setError("");
    try {
      const payload = {
        question: question.trim(),
        disease: normalizedDisease,
        conversation_id: conversationId || undefined,
        language: language
      };
      const res = await fetch(`${BASE_URL}/api/wheat-bot`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t.errorNetwork);
      } else {
        setConversationId(data.conversation_id);
        const newHistory = [
          ...conversationHistory,
          { role: "user", content: question.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), disease: normalizedDisease },
          { role: "assistant", content: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), suggestions: data.suggestions || [] }
        ];
        setConversationHistory(newHistory);
        setQuestion("");
        setShowSuggestions(false);
      }
    } catch {
      setError(t.errorNetwork);
    } finally {
      setLoading(false); setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askBot(); }
  };

  const handleQuickQuestion = (q) => {
    setQuestion(q);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDiseaseInput = (e) => {
    const value = e.target.value;
    setDisease(value);
    setFilteredDiseases(value ? CLASS_NAMES.filter(cls => cls.toLowerCase().includes(value.toLowerCase())) : []);
  };

  const selectDisease = (name) => {
    setDisease(normalizeDiseaseName(name));
    setFilteredDiseases([]);
    setConversationHistory([]);
    setConversationId("");
    setShowSuggestions(true);
    setActiveCategory("symptoms");
  };

  const clearConversation = () => {
    setQuestion(""); setError(""); setDisease("");
    setConversationHistory([]); setConversationId("");
    setShowSuggestions(true);
  };

  const formatAnswer = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    let inList = false, listItems = [];
    return lines.map((line, idx) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || /^\d+\./.test(trimmedLine)) {
        if (!inList) { inList = true; listItems = []; }
        listItems.push(
          <div key={`item-${idx}`} className="flex items-start gap-2 ml-1 my-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            <span className="text-gray-700">{trimmedLine.replace(/^[•\-\d\.\s]+/, '').trim()}</span>
          </div>
        );
        return null;
      } else if (inList && trimmedLine === '') {
        inList = false;
        const list = <div key={`list-${idx}`} className="my-2 ml-4">{listItems}</div>;
        listItems = [];
        return list;
      } else if (inList) {
        inList = false;
        const list = <div key={`list-${idx}`} className="my-2 ml-4">{listItems}</div>;
        listItems = [];
        return <>{list}<div key={idx} className="text-gray-700 my-1">{line}</div></>;
      }
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**'))
        return <div key={idx} className="font-bold text-gray-800 text-lg mt-4 mb-2">{trimmedLine.replace(/\*\*/g, '')}</div>;
      if (trimmedLine.startsWith('---') || trimmedLine.startsWith('___'))
        return <hr key={idx} className="my-4 border-gray-300" />;
      if (trimmedLine === '') return <div key={idx} className="h-3" />;
      return <div key={idx} className="text-gray-700 my-2 leading-relaxed">{line}</div>;
    }).filter(Boolean);
  };

  // Language Toggle
  const LanguageToggle = () => (
    <div className="flex justify-end px-6 pt-3 pb-2 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "2px",
        background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: "999px", padding: "3px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}>
        {[{ code: "en", flag: "🇬🇧", label: "English" }, { code: "te", flag: "🇮🇳", label: "తెలుగు" }].map(({ code, flag, label }) => (
          <button key={code} onClick={() => handleLanguageChange(code)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", borderRadius: "999px", fontSize: "13px",
            fontWeight: language === code ? "600" : "400", border: "none", cursor: "pointer",
            background: language === code ? "#1a4d2e" : "transparent",
            color: language === code ? "#ffffff" : "#555555",
            transition: "all 0.2s ease",
            boxShadow: language === code ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
          }}>
            <span style={{ fontSize: "14px", lineHeight: 1 }}>{flag}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );

  const featureIconMap = { Symptoms: <Search />, Treatment: <FileText />, Prevention: <Shield />, Causes: <Sprout />, Impact: <TrendingUp />, Timing: <Clock />, లక్షణాలు: <Search />, చికిత్స: <FileText />, నివారణ: <Shield />, కారణాలు: <Sprout />, ప్రభావం: <TrendingUp />, సమయం: <Clock /> };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <LanguageToggle />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.heroTitle}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t.heroSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 sticky top-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-800">{t.selectDisease}</h2>
                </div>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input type="text" value={disease} onChange={handleDiseaseInput}
                      placeholder={t.searchPlaceholder}
                      className="w-full border-2 border-gray-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" />
                  </div>
                  {filteredDiseases.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 shadow-lg max-h-64 overflow-y-auto">
                      {filteredDiseases.map((cls, idx) => (
                        <li key={idx} onClick={() => selectDisease(cls)}
                          className="px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between">
                          <span className="font-medium text-gray-800">{cls}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {disease && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{disease}</h3>
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">{t.selected}</span>
                    </div>
                  </div>
                )}
              </div>

              {disease && disease !== "Healthy" && showSuggestions && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-bold text-gray-800">{t.quickQuestions}</h2>
                  </div>
                  <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-hide">
                    {CATEGORY_KEYS.map((category) => {
                      const config = quickQuestions[category];
                      return (
                        <button key={category} onClick={() => setActiveCategory(category)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeCategory === category
                              ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}>
                          {config.icon}
                          {t.categories[category]}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {quickQuestions[activeCategory]?.questions?.map((q, idx) => (
                      <button key={idx} onClick={() => handleQuickQuestion(q)} disabled={loading}
                        className={`w-full text-left p-3 ${quickQuestions[activeCategory].bgColor} hover:opacity-90 rounded-lg border ${quickQuestions[activeCategory].borderColor} transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group`}>
                        <div className="flex items-start gap-2">
                          <MessageSquare className={`h-4 w-4 ${quickQuestions[activeCategory].color} mt-0.5 flex-shrink-0`} />
                          <span className={`text-sm ${quickQuestions[activeCategory].color} font-medium group-hover:underline`}>{q}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {conversationHistory.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{t.chatStarted}</span>
                    </div>
                    <span className="font-medium">{conversationHistory.length / 2} {t.questions}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden h-full flex flex-col">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full"><Bot className="h-6 w-6" /></div>
                    <div>
                      <h3 className="text-xl font-bold">{t.assistantName}</h3>
                      <p className="text-green-100 text-sm flex items-center gap-2">
                        {disease ? <><span>{t.advisingOn}</span><span className="font-semibold">{disease}</span></> : t.selectToBegin}
                      </p>
                    </div>
                  </div>
                  {conversationHistory.length > 0 && (
                    <button onClick={clearConversation}
                      className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                      <X className="h-4 w-4" />{t.newChat}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
                {conversationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
                      <Bot className="h-16 w-16 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{t.welcomeTitle}</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">{t.welcomeSubtitle}</p>
                    {!disease ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        {t.featureCards.map((card) => (
                          <div key={card.label} className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3 mx-auto text-green-600">
                              {featureIconMap[card.label]}
                            </div>
                            <h4 className="font-bold text-green-700 text-center mb-1">{card.label}</h4>
                            <p className="text-xs text-gray-600 text-center">{card.desc}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto">
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                          <h4 className="font-bold text-green-700 mb-3">{t.readyToAsk} {disease}</h4>
                          <p className="text-gray-600 mb-4">{t.youCanAsk}</p>
                          <div className="space-y-2">
                            {quickQuestions.symptoms.questions.slice(0, 2).map((q, idx) => (
                              <button key={idx} onClick={() => handleQuickQuestion(q)}
                                className="w-full text-left p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-gray-700">{q}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {conversationHistory.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                        {msg.role === "assistant" && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-tr-none"
                            : "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-tl-none"
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs opacity-75 font-medium">{msg.role === "user" ? t.you : t.assistantName}</span>
                            <span className="text-xs opacity-75">{msg.time}</span>
                          </div>
                          <div>{msg.role === "assistant" ? formatAnswer(msg.content) : msg.content}</div>
                          {msg.role === "assistant" && msg.suggestions?.length > 0 && idx === conversationHistory.length - 1 && (
                            <div className="mt-4 pt-3 border-t border-green-200">
                              <p className="text-xs text-gray-600 mb-2 font-medium">{t.tryAsking}</p>
                              <div className="flex flex-wrap gap-2">
                                {msg.suggestions.slice(0, 3).map((suggestion, sIdx) => (
                                  <button key={sIdx} onClick={() => handleQuickQuestion(suggestion)}
                                    className="text-xs bg-white text-green-700 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-50 transition-colors">
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                              <span className="text-sm font-bold text-gray-600">U</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t p-6 bg-gradient-to-r from-gray-50 to-green-50">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{t.errorTitle}</p>
                      <p className="text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError("")} className="ml-auto text-red-600 hover:text-red-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <textarea ref={inputRef} value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={disease ? `${t.askAbout} ${disease}...` : t.selectFirst}
                    className="w-full border-2 border-gray-300 p-4 pr-24 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all shadow-sm"
                    rows={3} disabled={loading || !disease} />
                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {disease ? t.pressEnter : t.selectFirst}
                    </div>
                    <button onClick={askBot} disabled={loading || !question.trim() || !disease}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                      title="Send message">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>{t.aiPowered}</span>
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">{t.expertAdvice}</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{t.beta}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>{t.footerNote}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WheatBot;