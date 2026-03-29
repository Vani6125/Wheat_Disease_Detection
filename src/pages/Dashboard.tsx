import Layout from "@/components/Layout";
import MetricCircle from "@/components/MetricCircle";
import { useEffect, useState } from "react";
import { Download, FileText, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";

const TRANSLATIONS = {
  en: {
    pageTitle: "Wheat Disease Detection Model",
    pageSubtitle: "Real-time monitoring and analysis",
    downloadBtn: "Download Report",
    generatingReport: "Generating Report...",
    loading: "Loading dashboard data...",
    errorTitle: "⚠️ Error loading dashboard:",
    errorChecklist: "Please ensure:",
    errorLoggedIn: "You are logged in",
    errorBackend: "Backend is running on http://127.0.0.1:5000",
    errorConsole: "Check browser console for detailed errors",
    healthyScans: "healthy scans",
    basedOn: "Based on",
    predictions: "predictions",
    highRisk: "⚠️ High risk detected",
    moderateRisk: "⚡ Moderate risk",
    lowRisk: "✅ Low risk",
    weeklyTitle: "📊 Weekly Disease Report",
    lastSevenDays: "Last 7 days",
    noData: "No disease predictions found for the past week",
    noDataSub: "Upload images to start tracking",
    totalScans: "Total Scans",
    allTime: "All time",
    diseasesDetected: "Diseases Detected",
    fieldsMonitored: "Fields Monitored",
    activeFields: "Active fields",
    healthIndex: "Health Index",
    avgConfidence: "Avg Confidence (Weekly)",
    avgRisk: "Avg Risk Level (Weekly)",
    loginError: "User not logged in",
    downloadLoginAlert: "Please log in to download the report",
    downloadFailed: "Failed to download report",
    cases: "Cases",
  },
  te: {
    pageTitle: "గోధుమ వ్యాధి గుర్తింపు మోడల్",
    pageSubtitle: "రియల్-టైమ్ పర్యవేక్షణ మరియు విశ్లేషణ",
    downloadBtn: "నివేదిక డౌన్‌లోడ్ చేయండి",
    generatingReport: "నివేదిక తయారవుతోంది...",
    loading: "డాష్‌బోర్డ్ డేటా లోడ్ అవుతోంది...",
    errorTitle: "⚠️ డాష్‌బోర్డ్ లోడ్ చేయడంలో లోపం:",
    errorChecklist: "దయచేసి నిర్ధారించండి:",
    errorLoggedIn: "మీరు లాగిన్ అయ్యారు",
    errorBackend: "బ్యాకెండ్ http://127.0.0.1:5000 లో నడుస్తోంది",
    errorConsole: "వివరణాత్మక లోపాల కోసం బ్రౌజర్ కన్సోల్ తనిఖీ చేయండి",
    healthyScans: "ఆరోగ్యకరమైన స్కాన్‌లు",
    basedOn: "ఆధారంగా",
    predictions: "అంచనాలు",
    highRisk: "⚠️ అధిక ప్రమాదం గుర్తించబడింది",
    moderateRisk: "⚡ మధ్యస్థ ప్రమాదం",
    lowRisk: "✅ తక్కువ ప్రమాదం",
    weeklyTitle: "📊 వారపు వ్యాధి నివేదిక",
    lastSevenDays: "చివరి 7 రోజులు",
    noData: "గత వారం వ్యాధి అంచనాలు కనుగొనబడలేదు",
    noDataSub: "ట్రాకింగ్ ప్రారంభించడానికి చిత్రాలు అప్‌లోడ్ చేయండి",
    totalScans: "మొత్తం స్కాన్‌లు",
    allTime: "అన్ని సమయం",
    diseasesDetected: "వ్యాధులు గుర్తించబడ్డాయి",
    fieldsMonitored: "పొలాలు పర్యవేక్షించబడుతున్నాయి",
    activeFields: "క్రియాశీల పొలాలు",
    healthIndex: "ఆరోగ్య సూచిక",
    avgConfidence: "సగటు విశ్వాసం (వారపు)",
    avgRisk: "సగటు ప్రమాద స్థాయి (వారపు)",
    loginError: "వినియోగదారు లాగిన్ కాలేదు",
    downloadLoginAlert: "నివేదిక డౌన్‌లోడ్ చేయడానికి దయచేసి లాగిన్ చేయండి",
    downloadFailed: "నివేదిక డౌన్‌లోడ్ విఫలమైంది",
    cases: "కేసులు",
  }
};
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Language Toggle Component
const LanguageToggle = ({ language, setLanguage }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: "2px",
    background: "rgba(255,255,255,0.92)", border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "999px", padding: "3px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  }}>
    {[{ code: "en", flag: "🇬🇧", label: "English" }, { code: "te", flag: "🇮🇳", label: "తెలుగు" }].map(({ code, flag, label }) => (
      <button key={code} onClick={() => setLanguage(code)} style={{
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
);

const Dashboard = () => {
  const [language, setLanguage] = useState("en");
  const t = TRANSLATIONS[language];

  const [weeklyData, setWeeklyData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalScans: 0, diseasesDetected: 0, avgConfidence: 0,
    healthIndex: 100, avgRiskLevel: 0, successRate: 0, fieldsMonitored: 2
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const increaseFields = () => setDashboardStats(prev => ({ ...prev, fieldsMonitored: prev.fieldsMonitored + 1 }));
  const decreaseFields = () => setDashboardStats(prev => ({ ...prev, fieldsMonitored: prev.fieldsMonitored > 1 ? prev.fieldsMonitored - 1 : 1 }));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user || !user.id) { setError(t.loginError); setLoading(false); return; }
        const clientId = user.id;

        const weeklyResponse = await fetch(`${BASE_URL}/weekly-dashboard/${clientId}`);
        if (!weeklyResponse.ok) throw new Error(`HTTP error! status: ${weeklyResponse.status}`);
        const weeklyDataJson = await weeklyResponse.json();
        if (weeklyDataJson.error) throw new Error(weeklyDataJson.error);

        const formattedWeekly = Object.entries(weeklyDataJson).map(([disease, count]) => ({
          disease, count, fill: disease === 'Healthy' ? '#4CAF50' : '#FF6B6B'
        }));
        setWeeklyData(formattedWeekly);

        const statsResponse = await fetch(`${BASE_URL}/dashboard-stats/${clientId}`);
        if (!statsResponse.ok) throw new Error(`HTTP error! status: ${statsResponse.status}`);
        const statsData = await statsResponse.json();
        if (statsData.error) throw new Error(statsData.error);
        setDashboardStats(statsData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setWeeklyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    const handlePredictionComplete = () => fetchDashboardData();
    window.addEventListener('predictionComplete', handlePredictionComplete);
    return () => { clearInterval(interval); window.removeEventListener('predictionComplete', handlePredictionComplete); };
  }, []);

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const clientId = user?.id;
      if (!clientId) { alert(t.downloadLoginAlert); return; }
      window.open(`${BASE_URL}/download-report/${clientId}`, "_blank");
      setTimeout(() => setDownloading(false), 2000);
    } catch {
      alert(t.downloadFailed);
      setDownloading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary/20">
          <p className="font-semibold text-primary">{payload[0].payload.disease}</p>
          <p className="text-sm text-muted-foreground">
            {t.cases}: <span className="font-bold text-foreground">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="py-8 bg-agri-mint min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4">

          {/* Header with toggle + download */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="section-title mb-2">{t.pageTitle}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />{t.pageSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <LanguageToggle language={language} setLanguage={setLanguage} />
              <button onClick={handleDownloadReport} disabled={downloading}
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {downloading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>{t.generatingReport}</span></>
                ) : (
                  <><Download className="w-5 h-5 group-hover:animate-bounce" /><span>{t.downloadBtn}</span><FileText className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12 bg-card rounded-xl shadow-md border border-border">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary mb-4"></div>
              <p className="text-lg font-medium">{t.loading}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl mb-6 shadow-md">
              <p className="font-bold text-lg">{t.errorTitle} {error}</p>
              <p className="text-sm mt-2">{t.errorChecklist}</p>
              <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                <li>{t.errorLoggedIn}</li>
                <li>{t.errorBackend}</li>
                <li>{t.errorConsole}</li>
              </ul>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Metrics Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow flex flex-col items-center">
                  <MetricCircle value={dashboardStats.healthIndex} label={t.healthIndex} type="success" size="lg" />
                  <p className="text-sm text-muted-foreground mt-3 font-medium">
                    {dashboardStats.totalScans - dashboardStats.diseasesDetected} {t.healthyScans}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow flex flex-col items-center">
                  <MetricCircle value={dashboardStats.avgConfidence} label={t.avgConfidence} type="success" size="lg" />
                  <p className="text-sm text-muted-foreground mt-3 font-medium">
                    {t.basedOn} {weeklyData.reduce((acc, item) => acc + item.count, 0)} {t.predictions}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-shadow flex flex-col items-center">
                  <MetricCircle value={dashboardStats.avgRiskLevel} label={t.avgRisk}
                    type={dashboardStats.avgRiskLevel > 70 ? "danger" : dashboardStats.avgRiskLevel > 40 ? "warning" : "success"} size="lg" />
                  <p className="text-sm text-muted-foreground mt-3 font-medium">
                    {dashboardStats.avgRiskLevel > 70 ? t.highRisk : dashboardStats.avgRiskLevel > 40 ? t.moderateRisk : t.lowRisk}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-primary/20 hover:shadow-xl transition-shadow mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-bold text-2xl text-primary">{t.weeklyTitle}</h2>
                  <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">{t.lastSevenDays}</span>
                </div>
                <div className="h-96">
                  {weeklyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileText className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-lg">{t.noData}</p>
                      <p className="text-sm mt-2">{t.noDataSub}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <defs>
                          <linearGradient id="healthyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#4CAF50" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="diseaseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="disease" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fontSize: 12, fontWeight: 500 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                        <Tooltip content={<CustomTooltip active={undefined} payload={undefined} />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={() => t.cases} />
                        <Bar dataKey="count" name={t.cases} radius={[8, 8, 0, 0]}>
                          {weeklyData.map((entry, index) => (
                            <Cell key={`cell-${index}`}
                              fill={entry.disease === 'Healthy' ? 'url(#healthyGradient)' : 'url(#diseaseGradient)'}
                              stroke={entry.disease === 'Healthy' ? '#4CAF50' : '#FF6B6B'}
                              strokeWidth={2}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="inline-block p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl mb-3">📸</div>
                  <p className="text-4xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">{dashboardStats.totalScans}</p>
                  <p className="text-muted-foreground font-semibold">{t.totalScans}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.allTime}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="inline-block p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-2xl mb-3">⚠️</div>
                  <p className="text-4xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">{dashboardStats.diseasesDetected}</p>
                  <p className="text-muted-foreground font-semibold">{t.diseasesDetected}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.allTime}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="inline-block p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-2xl mb-3">🌾</div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <button onClick={decreaseFields}
                      className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-lg font-bold text-red-700 transition-colors">−</button>
                    <span className="text-4xl font-bold text-primary">{dashboardStats.fieldsMonitored}</span>
                    <button onClick={increaseFields}
                      className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 rounded-lg font-bold text-green-700 transition-colors">+</button>
                  </div>
                  <p className="text-muted-foreground font-semibold">{t.fieldsMonitored}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.activeFields}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;