import { useState, useEffect } from "react";
import { Loader2, AlertCircle, CheckCircle, Cloud, Droplets, ThermometerSun } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TRANSLATIONS = {
  en: {
    pageTitle: "RECOMMENDING FERTILIZER FOR YOUR CROP",
    weatherLoading: "Fetching weather data...",
    weatherFetched: "Weather data auto-filled! Temperature and humidity values updated.",
    errorLabel: "Error",
    tempLabel: "Temperature (°C)",
    tempPlaceholder: "Enter temperature",
    autoFilled: "Auto-filled from weather data",
    humidityLabel: "Humidity (%)",
    humidityPlaceholder: "Enter humidity",
    moistureLabel: "Soil Moisture (%)",
    moisturePlaceholder: "Enter soil moisture percentage",
    soilTypeLabel: "Soil Type",
    cropTypeLabel: "Crop Type",
    nitrogenLabel: "Nitrogen (kg/ha)",
    nitrogenPlaceholder: "N content",
    phosphorousLabel: "Phosphorous (kg/ha)",
    phosphorousPlaceholder: "P content",
    potassiumLabel: "Potassium (kg/ha)",
    potassiumPlaceholder: "K content",
    predictBtn: "Get Recommendation",
    analyzing: "Analyzing...",
    resultTitle: "Recommended Fertilizer",
    npkLabel: "NPK Ratio:",
    confidenceLabel: "Confidence:",
    descriptionLabel: "Description",
    usageLabel: "Usage Instructions",
    parametersLabel: "Applied Parameters",
    temperatureParam: "Temperature",
    humidityParam: "Humidity",
    soilTypeParam: "Soil Type",
    cropParam: "Crop",
    refreshWeather: "Refresh Weather Data",
    fetchingWeather: "Fetching...",
    fillAllFields: "Please fill in all fields",
    humidityRange: "Humidity must be between 0 and 100",
    moistureRange: "Moisture must be between 0 and 100",
    tempUnusual: "Temperature seems unusual. Please check the value.",
    fetchFailed: "Failed to fetch weather data. Please enter values manually.",
    predictionFailed: "Failed to get fertilizer recommendation",
    unexpectedResponse: "Unexpected response from server",
    soilTypes: {
      Black: "Black",
      Red: "Red",
      Clayey: "Clayey",
      Loamy: "Loamy",
      Sandy: "Sandy",
    },
    cropTypes: {
      Wheat: "Wheat",
      Barley: "Barley",
      Maize: "Maize",
      Cotton: "Cotton",
      Sugarcane: "Sugarcane",
      "Ground Nuts": "Ground Nuts",
      Pulses: "Pulses",
      Paddy: "Paddy",
      rice: "Rice",
    },
  },
  te: {
    pageTitle: "మీ పంటకు ఎరువు సిఫార్సు",
    weatherLoading: "వాతావరణ డేటా తెస్తోంది...",
    weatherFetched: "వాతావరణ డేటా స్వయంచాలకంగా నింపబడింది! ఉష్ణోగ్రత మరియు తేమ విలువలు నవీకరించబడ్డాయి.",
    errorLabel: "లోపం",
    tempLabel: "ఉష్ణోగ్రత (°C)",
    tempPlaceholder: "ఉష్ణోగ్రత నమోదు చేయండి",
    autoFilled: "వాతావరణ డేటా నుండి స్వయంచాలకంగా నింపబడింది",
    humidityLabel: "తేమ (%)",
    humidityPlaceholder: "తేమ నమోదు చేయండి",
    moistureLabel: "నేల తేమ (%)",
    moisturePlaceholder: "నేల తేమ శాతం నమోదు చేయండి",
    soilTypeLabel: "నేల రకం",
    cropTypeLabel: "పంట రకం",
    nitrogenLabel: "నత్రజని (kg/ha)",
    nitrogenPlaceholder: "N పరిమాణం",
    phosphorousLabel: "భాస్వరం (kg/ha)",
    phosphorousPlaceholder: "P పరిమాణం",
    potassiumLabel: "పొటాషియం (kg/ha)",
    potassiumPlaceholder: "K పరిమాణం",
    predictBtn: "సిఫార్సు పొందండి",
    analyzing: "విశ్లేషిస్తోంది...",
    resultTitle: "సిఫార్సు చేయబడిన ఎరువు",
    npkLabel: "NPK నిష్పత్తి:",
    confidenceLabel: "విశ్వాసం:",
    descriptionLabel: "వివరణ",
    usageLabel: "వినియోగ సూచనలు",
    parametersLabel: "వర్తింపజేసిన పారామీటర్లు",
    temperatureParam: "ఉష్ణోగ్రత",
    humidityParam: "తేమ",
    soilTypeParam: "నేల రకం",
    cropParam: "పంట",
    refreshWeather: "వాతావరణ డేటా రిఫ్రెష్ చేయండి",
    fetchingWeather: "తెస్తోంది...",
    fillAllFields: "దయచేసి అన్ని ఫీల్డ్‌లు పూరించండి",
    humidityRange: "తేమ 0 మరియు 100 మధ్య ఉండాలి",
    moistureRange: "తేమ 0 మరియు 100 మధ్య ఉండాలి",
    tempUnusual: "ఉష్ణోగ్రత అసాధారణంగా ఉంది. దయచేసి విలువను తనిఖీ చేయండి.",
    fetchFailed: "వాతావరణ డేటా తీసుకురావడం విఫలమైంది. దయచేసి విలువలను మాన్యువల్‌గా నమోదు చేయండి.",
    predictionFailed: "ఎరువు సిఫార్సు పొందడం విఫలమైంది",
    unexpectedResponse: "సర్వర్ నుండి అనూహ్య ప్రతిస్పందన",
    soilTypes: {
      Black: "నల్ల నేల",
      Red: "ఎర్ర నేల",
      Clayey: "మట్టి నేల",
      Loamy: "లోమీ నేల",
      Sandy: "ఇసుక నేల",
    },
    cropTypes: {
      Wheat: "గోధుమ",
      Barley: "బార్లీ",
      Maize: "మొక్కజొన్న",
      Cotton: "పత్తి",
      Sugarcane: "చెరకు",
      "Ground Nuts": "పల్లీలు",
      Pulses: "పప్పులు",
      Paddy: "వరి",
      rice: "వరి",
    },
  }
};

// Language Toggle Component
const LanguageToggle = ({ language, setLanguage }) => (
  <div className="flex justify-end px-2 pt-2 pb-1">
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
  </div>
);

const FertilizerRecommendation = () => {
  const [language, setLanguage] = useState("en");
  const t = TRANSLATIONS[language];

  const [formData, setFormData] = useState({
    temperature: "", humidity: "", moisture: "",
    soilType: "Black", cropType: "Wheat",
    nitrogen: "", potassium: "", phosphorous: "",
  });

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherFetched, setWeatherFetched] = useState(false);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const soilTypes = ["Black", "Red", "Clayey", "Loamy", "Sandy"];
  const cropTypes = ["Wheat", "Barley", "Maize", "Cotton", "Sugarcane", "Ground Nuts", "Pulses", "Paddy", "rice"];

  useEffect(() => { fetchWeatherData(); }, []);

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    setError(null);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByCoords(latitude, longitude);
          },
          async () => { await getWeatherByCity("Delhi"); }
        );
      } else {
        await getWeatherByCity("Delhi");
      }
    } catch {
      setError(t.fetchFailed);
      setWeatherLoading(false);
    }
  };

  const getWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`);
      if (!response.ok) throw new Error("Failed to fetch weather data");
      updateWeatherData(await response.json());
    } catch {
      setError(t.fetchFailed);
      setWeatherLoading(false);
    }
  };

  const getWeatherByCity = async (city) => {
    try {
      const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
      if (!response.ok) throw new Error("Failed to fetch weather data");
      updateWeatherData(await response.json());
    } catch {
      setError(t.fetchFailed);
      setWeatherLoading(false);
    }
  };

  const updateWeatherData = (data) => {
    setFormData((prev) => ({
      ...prev,
      temperature: Math.round(data.current.temp_c).toString(),
      humidity: data.current.humidity.toString(),
    }));
    setWeatherFetched(true);
    setWeatherLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validateForm = () => {
    const { temperature, humidity, moisture, nitrogen, potassium, phosphorous } = formData;
    if (!temperature || !humidity || !moisture || !nitrogen || !potassium || !phosphorous) {
      setError(t.fillAllFields); return false;
    }
    if (parseFloat(humidity) < 0 || parseFloat(humidity) > 100) {
      setError(t.humidityRange); return false;
    }
    if (parseFloat(moisture) < 0 || parseFloat(moisture) > 100) {
      setError(t.moistureRange); return false;
    }
    if (parseFloat(temperature) < -50 || parseFloat(temperature) > 60) {
      setError(t.tempUnusual); return false;
    }
    return true;
  };

  const handlePredict = async () => {
    if (!validateForm()) return;
    setLoading(true); setError(null); setRecommendation(null);
    try {
      const response = await fetch(`${BASE_URL}/predict-fertilizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          moisture: parseFloat(formData.moisture),
          soilType: formData.soilType,
          cropType: formData.cropType,
          nitrogen: parseFloat(formData.nitrogen),
          potassium: parseFloat(formData.potassium),
          phosphorous: parseFloat(formData.phosphorous),
          language: language,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.predictionFailed);
      if (data.success) setRecommendation(data);
      else throw new Error(t.unexpectedResponse);
    } catch (err) {
      setError(err.message || t.predictionFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white text-center tracking-wide">
                {t.pageTitle}
              </h1>
            </div>

            {/* Language Toggle */}
            <LanguageToggle language={language} setLanguage={setLanguage} />

            {/* Weather Status Banner */}
            {weatherLoading && (
              <div className="bg-blue-50 border-b-2 border-blue-200 px-8 py-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <p className="text-blue-700 font-medium">{t.weatherLoading}</p>
                </div>
              </div>
            )}

            {weatherFetched && (
              <div className="bg-green-50 border-b-2 border-green-200 px-8 py-4">
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 font-medium">{t.weatherFetched}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-b-2 border-red-200 px-8 py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">{t.errorLabel}</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="p-8 md:p-12 space-y-6">
              {/* Temperature & Humidity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg flex items-center gap-2">
                    <ThermometerSun className="h-5 w-5 text-orange-500" />{t.tempLabel}
                  </label>
                  <input type="number" name="temperature" value={formData.temperature} onChange={handleChange}
                    placeholder={t.tempPlaceholder} step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400" />
                  {weatherFetched && formData.temperature && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />{t.autoFilled}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-500" />{t.humidityLabel}
                  </label>
                  <input type="number" name="humidity" value={formData.humidity} onChange={handleChange}
                    placeholder={t.humidityPlaceholder} step="0.1" min="0" max="100"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400" />
                  {weatherFetched && formData.humidity && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />{t.autoFilled}
                    </p>
                  )}
                </div>
              </div>

              {/* Moisture */}
              <div className="space-y-2">
                <label className="block text-gray-600 font-semibold text-lg">{t.moistureLabel}</label>
                <input type="number" name="moisture" value={formData.moisture} onChange={handleChange}
                  placeholder={t.moisturePlaceholder} step="0.1" min="0" max="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400" />
              </div>

              {/* Soil Type & Crop Type */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg">{t.soilTypeLabel}</label>
                  <select name="soilType" value={formData.soilType} onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 bg-white cursor-pointer">
                    {soilTypes.map((soil) => (
                      <option key={soil} value={soil}>
                        {t.soilTypes[soil]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg">{t.cropTypeLabel}</label>
                  <select name="cropType" value={formData.cropType} onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 bg-white cursor-pointer">
                    {cropTypes.map((crop) => (
                      <option key={crop} value={crop}>
                        {t.cropTypes[crop]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NPK */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg">{t.nitrogenLabel}</label>
                  <input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange}
                    placeholder={t.nitrogenPlaceholder} step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400" />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg">{t.phosphorousLabel}</label>
                  <input type="number" name="phosphorous" value={formData.phosphorous} onChange={handleChange}
                    placeholder={t.phosphorousPlaceholder} step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400" />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-600 font-semibold text-lg">{t.potassiumLabel}</label>
                  <input type="number" name="potassium" value={formData.potassium} onChange={handleChange}
                    placeholder={t.potassiumPlaceholder} step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-gray-700 placeholder-gray-400" />
                </div>
              </div>

              {/* Predict Button */}
              <button onClick={handlePredict} disabled={loading}
                className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" />{t.analyzing}
                  </span>
                ) : t.predictBtn}
              </button>

              {/* Recommendation */}
              {recommendation && (
                <div className="mt-8 bg-gradient-to-r from-green-700 to-emerald-800 rounded-2xl p-8 shadow-xl animate-fadeIn">
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-white mr-3" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{t.resultTitle}</h2>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                    <p className="text-4xl font-bold text-white text-center mb-2">{recommendation.fertilizer}</p>
                    <p className="text-green-100 text-center text-lg">{t.npkLabel} {recommendation.npk_ratio}</p>
                    <div className="mt-4 flex justify-center">
                      <div className="bg-green-600 px-4 py-2 rounded-full">
                        <p className="text-white text-sm font-semibold">{t.confidenceLabel} {recommendation.confidence}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{t.descriptionLabel}</h3>
                      <p className="text-green-50">{recommendation.description}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{t.usageLabel}</h3>
                      <p className="text-green-50">{recommendation.usage_instructions}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-white font-bold text-lg mb-2">{t.parametersLabel}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-green-200 text-xs">{t.temperatureParam}</p>
                          <p className="text-white font-semibold">{recommendation.input_parameters.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-green-200 text-xs">{t.humidityParam}</p>
                          <p className="text-white font-semibold">{recommendation.input_parameters.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-green-200 text-xs">{t.soilTypeParam}</p>
                          <p className="text-white font-semibold">{recommendation.input_parameters.soil_type}</p>
                        </div>
                        <div>
                          <p className="text-green-200 text-xs">{t.cropParam}</p>
                          <p className="text-white font-semibold">{recommendation.input_parameters.crop_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Refresh Weather */}
          <div className="mt-6 text-center">
            <button onClick={fetchWeatherData} disabled={weatherLoading}
              className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold">
              <Cloud className="h-5 w-5" />
              {weatherLoading ? t.fetchingWeather : t.refreshWeather}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default FertilizerRecommendation;