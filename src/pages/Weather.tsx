import { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSun, CloudSnow, Wind, Droplets, Eye, Gauge, MapPin, Loader2, AlertCircle, Search, Navigation } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TRANSLATIONS = {
  en: {
    pageTitle: "Weather Dashboard",
    loadingText: "Loading weather data...",
    errorTitle: "Error Loading Weather",
    retryBtn: "Retry",
    currentWeather: "Current Weather",
    feelsLike: "Feels like",
    lastUpdated: "Last updated:",
    windLabel: "Wind",
    humidityLabel: "Humidity",
    visibilityLabel: "Visibility",
    pressureLabel: "Pressure",
    hourlyTitle: "Hourly Forecast",
    dailyTitle: "3-Day Forecast",
    today: "Today",
    highRiskTitle: "High Disease Risk Alert",
    moderateRiskTitle: "Moderate Disease Risk Alert",
    lowRiskTitle: "Low Disease Risk Alert",
    highRiskMsg: "High risk of fungal diseases like Septoria leaf blotch. Consider immediate preventive fungicide application.",
    moderateRiskMsg: "Moderate risk of disease outbreak. Monitor crops closely and prepare for preventive measures.",
    lowRiskMsg: "Low disease risk. Continue regular monitoring practices.",
    currentConditions: "Current conditions:",
    temperature: "temperature",
    searchPlaceholder: "Search location...",
    searchBtn: "Search",
    myLocation: "My Location",
  },
  te: {
    pageTitle: "వాతావరణ డాష్‌బోర్డ్",
    loadingText: "వాతావరణ డేటా లోడ్ అవుతోంది...",
    errorTitle: "వాతావరణం లోడ్ చేయడంలో లోపం",
    retryBtn: "మళ్ళీ ప్రయత్నించండి",
    currentWeather: "ప్రస్తుత వాతావరణం",
    feelsLike: "అనుభవమవుతోంది",
    lastUpdated: "చివరగా నవీకరించబడింది:",
    windLabel: "గాలి",
    humidityLabel: "తేమ",
    visibilityLabel: "దృశ్యమానత",
    pressureLabel: "వత్తిడి",
    hourlyTitle: "గంటవారీ అంచనా",
    dailyTitle: "3-రోజుల అంచనా",
    today: "నేడు",
    highRiskTitle: "అధిక వ్యాధి ప్రమాద హెచ్చరిక",
    moderateRiskTitle: "మధ్యస్థ వ్యాధి ప్రమాద హెచ్చరిక",
    lowRiskTitle: "తక్కువ వ్యాధి ప్రమాద హెచ్చరిక",
    highRiskMsg: "సెప్టోరియా లీఫ్ బ్లాచ్ వంటి శిలీంద్ర వ్యాధుల అధిక ప్రమాదం ఉంది. తక్షణ నివారణ శిలీంద్రనాశని వాడాలి.",
    moderateRiskMsg: "వ్యాధి వ్యాప్తి మధ్యస్థ ప్రమాదం. పంటలను నిశితంగా పర్యవేక్షించి నివారణ చర్యలకు సిద్ధంగా ఉండండి.",
    lowRiskMsg: "తక్కువ వ్యాధి ప్రమాదం. క్రమపద్ధతిలో పర్యవేక్షణ కొనసాగించండి.",
    currentConditions: "ప్రస్తుత పరిస్థితులు:",
    temperature: "ఉష్ణోగ్రత",
    searchPlaceholder: "స్థానం వెతకండి...",
    searchBtn: "వెతకండి",
    myLocation: "నా స్థానం",
  }
};


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

const Weather = () => {
  const [language, setLanguage] = useState("en");
  const t = TRANSLATIONS[language];

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => { getUserLocation(); }, []);
  useEffect(() => { if (location) fetchWeatherData(); }, [location]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { const { latitude, longitude } = position.coords; setLocation(`${latitude},${longitude}`); },
        () => { setLocation("Chennai"); }
      );
    } else { setLocation("Chennai"); }
  };

  const handleSearchLocation = (e) => {
    e.preventDefault();
    if (searchInput.trim()) { setLocation(searchInput.trim()); setSearchInput(""); }
  };

  const fetchWeatherData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=5&aqi=no`);
      if (!response.ok) throw new Error("Failed to fetch weather data");
      setWeatherData(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const code = condition?.code || 1000;
    if (code === 1000) return Sun;
    if ([1003, 1006].includes(code)) return CloudSun;
    if ([1009, 1030, 1135, 1147].includes(code)) return Cloud;
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return CloudRain;
    if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return CloudSnow;
    return CloudSun;
  };

  const calculateDiseaseRisk = (current) => {
    if (!current) return null;
    const humidity = current.humidity;
    const temp = current.temp_c;
    if (humidity > 70 && temp > 15 && temp < 25) {
      return {
        level: t.highRiskTitle, color: "text-red-600", bgColor: "bg-red-50 border-red-300",
        message: t.highRiskMsg
      };
    } else if (humidity > 60 && temp > 10 && temp < 30) {
      return {
        level: t.moderateRiskTitle, color: "text-amber-700", bgColor: "bg-amber-50 border-amber-300",
        message: t.moderateRiskMsg
      };
    } else {
      return {
        level: t.lowRiskTitle, color: "text-green-700", bgColor: "bg-green-50 border-green-300",
        message: t.lowRiskMsg
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-700 text-lg">{t.loadingText}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">{t.errorTitle}</h2>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <button onClick={fetchWeatherData}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              {t.retryBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { location: loc, current, forecast } = weatherData;
  const WeatherIcon = getWeatherIcon(current.condition);
  const diseaseRisk = calculateDiseaseRisk(current);
  const hourlyData = forecast.forecastday[0].hour.filter((_, index) => index % 3 === 0).slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">

          {/* Page Header with toggle */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.pageTitle}</h1>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-lg">{loc.name}, {loc.region}, {loc.country}</span>
              </div>
            </div>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>

          {/* Location Search */}
          <form onSubmit={handleSearchLocation} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full" />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              {t.searchBtn}
            </button>
            <button type="button" onClick={getUserLocation}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              title={t.myLocation}>
              <Navigation className="h-5 w-5" />
              <span className="hidden sm:inline">{t.myLocation}</span>
            </button>
          </form>

          {/* Current Weather Hero */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 mb-8 shadow-2xl text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-green-100 text-lg mb-2">{t.currentWeather}</p>
                <div className="flex items-baseline mb-4">
                  <h2 className="text-7xl font-bold">{Math.round(current.temp_c)}°</h2>
                  <span className="text-3xl ml-2 text-green-100">C</span>
                </div>
                <p className="text-2xl mb-2">{current.condition.text}</p>
                <p className="text-green-100">{t.feelsLike} {Math.round(current.feelslike_c)}°C</p>
                <p className="text-sm text-green-100 mt-4">
                  {t.lastUpdated} {new Date(current.last_updated).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex justify-center">
                <WeatherIcon className="h-40 w-40 text-amber-300 drop-shadow-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2"><Wind className="h-5 w-5 mr-2" /><span className="text-sm text-green-100">{t.windLabel}</span></div>
                <p className="text-2xl font-semibold">{current.wind_kph} km/h</p>
                <p className="text-xs text-green-100">{current.wind_dir}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2"><Droplets className="h-5 w-5 mr-2" /><span className="text-sm text-green-100">{t.humidityLabel}</span></div>
                <p className="text-2xl font-semibold">{current.humidity}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2"><Eye className="h-5 w-5 mr-2" /><span className="text-sm text-green-100">{t.visibilityLabel}</span></div>
                <p className="text-2xl font-semibold">{current.vis_km} km</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2"><Gauge className="h-5 w-5 mr-2" /><span className="text-sm text-green-100">{t.pressureLabel}</span></div>
                <p className="text-2xl font-semibold">{current.pressure_mb} mb</p>
              </div>
            </div>
          </div>

          {/* Hourly & Daily Forecast */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Cloud className="h-6 w-6 mr-2 text-green-600" />{t.hourlyTitle}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {hourlyData.map((hour, index) => {
                  const HourIcon = getWeatherIcon(hour.condition);
                  const time = new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                  return (
                    <div key={index} className="text-center p-3 rounded-xl hover:bg-green-50 transition-colors">
                      <p className="text-sm text-gray-600 mb-2 font-medium">{time}</p>
                      <HourIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="font-bold text-gray-800 text-lg">{Math.round(hour.temp_c)}°</p>
                      <p className="text-xs text-gray-500 mt-1">{hour.condition.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Sun className="h-6 w-6 mr-2 text-amber-500" />{t.dailyTitle}
              </h3>
              <div className="space-y-3">
                {forecast.forecastday.map((day, index) => {
                  const DayIcon = getWeatherIcon(day.day.condition);
                  const date = new Date(day.date);
                  const dayName = index === 0 ? t.today : date.toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors">
                      <div className="flex items-center flex-1">
                        <p className="font-semibold text-gray-700 w-16">{dayName}</p>
                        <DayIcon className="h-8 w-8 mx-4 text-green-600" />
                        <p className="text-sm text-gray-600 flex-1">{day.day.condition.text}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-800 text-lg">{Math.round(day.day.maxtemp_c)}°</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{Math.round(day.day.mintemp_c)}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Disease Risk Alert */}
          {diseaseRisk && (
            <div className={`${diseaseRisk.bgColor} border-2 rounded-2xl p-6 shadow-md`}>
              <div className="flex items-start">
                <AlertCircle className={`h-6 w-6 ${diseaseRisk.color} mr-3 flex-shrink-0 mt-1`} />
                <div>
                  <h3 className={`text-xl font-bold ${diseaseRisk.color} mb-2`}>{diseaseRisk.level}</h3>
                  <p className="text-gray-700 leading-relaxed">{diseaseRisk.message}</p>
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">{t.currentConditions}</span> {current.humidity}% {t.humidityLabel.toLowerCase()}, {Math.round(current.temp_c)}°C {t.temperature}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Weather;