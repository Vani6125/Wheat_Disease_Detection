import { useState, useRef, useCallback } from "react";
import { Upload, Camera, X, ZoomIn, CheckCircle, AlertTriangle, Leaf, ScanLine, FlaskConical } from "lucide-react";
import Layout from "@/components/Layout";
import MetricCircle from "@/components/MetricCircle";

interface DetectionResult {
  diseaseName: string;
  riskLevel: number;
  confidenceLevel: number;
  remedies: string[];
}

const TRANSLATIONS = {
  en: {
    pageTitle: "Wheat Disease Detection",
    pageSubtitle: "Upload or capture a photo of your wheat crop for instant AI-powered disease analysis",
    disclaimerTitle: "⚠️ Disclaimer",
    disclaimerText1: "This AI model can detect",
    disclaimerBold1: "only 15 predefined wheat diseases",
    disclaimerText2: "based on image analysis. Results may vary depending on image quality and disease stage, and should be used for",
    disclaimerBold2: "preliminary assessment only",
    disclaimerText3: ". Always consult an agricultural expert for confirmation and treatment.",
    uploadTitle: "Upload Image",
    uploadSub: "PNG, JPG, JPEG supported",
    cameraTitle: "Live Camera",
    cameraSub: "Capture in real time",
    or: "or",
    analyzing: "Analysing...",
    submit: "Analyse Crop",
    changeImage: "Change Image",
    diseaseDetected: "Disease Detected",
    healthyDetected: "Healthy Wheat",
    riskLevel: "Risk Level",
    confidenceLevel: "Confidence",
    recommendations: "Recommendations",
    remedy: "Remedies",
    loginAlert: "Please log in to use the disease detection model",
    // camera modal
    cameraModalTitle: "Live Camera Capture",
    captureBtn: "Capture Photo",
    retakeBtn: "Retake",
    usePhotoBtn: "Use This Photo",
    closeCameraBtn: "Close",
    cameraError: "Camera access denied. Please allow camera permissions.",
    switchCamera: "Switch Camera",
  },
  te: {
    pageTitle: "గోధుమ వ్యాధి గుర్తింపు",
    pageSubtitle: "తక్షణ AI ఆధారిత వ్యాధి విశ్లేషణ కోసం మీ గోధుమ పంట ఫోటో అప్‌లోడ్ చేయండి లేదా తీయండి",
    disclaimerTitle: "⚠️ నిరాకరణ",
    disclaimerText1: "ఈ AI మోడల్ చిత్ర విశ్లేషణ ఆధారంగా",
    disclaimerBold1: "కేవలం 15 నిర్దిష్ట గోధుమ వ్యాధులను మాత్రమే",
    disclaimerText2: "గుర్తించగలదు. చిత్రం నాణ్యత మరియు వ్యాధి దశను బట్టి ఫలితాలు మారవచ్చు, మరియు వీటిని",
    disclaimerBold2: "ప్రాథమిక అంచనా మాత్రమే",
    disclaimerText3: "గా ఉపయోగించాలి. నిర్ధారణ మరియు చికిత్స కోసం ఎల్లప్పుడూ వ్యవసాయ నిపుణులను సంప్రదించండి.",
    uploadTitle: "చిత్రం అప్‌లోడ్",
    uploadSub: "PNG, JPG, JPEG మద్దతు ఉంది",
    cameraTitle: "లైవ్ కెమెరా",
    cameraSub: "నేరుగా తీయండి",
    or: "లేదా",
    analyzing: "విశ్లేషిస్తోంది...",
    submit: "పంట విశ్లేషించండి",
    changeImage: "చిత్రం మార్చండి",
    diseaseDetected: "వ్యాధి గుర్తించబడింది",
    healthyDetected: "ఆరోగ్యకరమైన గోధుమ",
    riskLevel: "ప్రమాద స్థాయి",
    confidenceLevel: "విశ్వాసం",
    recommendations: "సిఫార్సులు",
    remedy: "నివారణలు",
    loginAlert: "వ్యాధి గుర్తింపు మోడల్ ఉపయోగించడానికి దయచేసి లాగిన్ చేయండి",
    cameraModalTitle: "లైవ్ కెమెరా క్యాప్చర్",
    captureBtn: "ఫోటో తీయండి",
    retakeBtn: "మళ్ళీ తీయండి",
    usePhotoBtn: "ఈ ఫోటో వాడండి",
    closeCameraBtn: "మూసివేయండి",
    cameraError: "కెమెరా అనుమతి లేదు. దయచేసి కెమెరా అనుమతులు ఇవ్వండి.",
    switchCamera: "కెమెరా మార్చండి",
  }
};

// ─── Camera Modal ────────────────────────────────────────────────────────────
const CameraModal = ({
  onCapture,
  onClose,
  t,
}: {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  t: typeof TRANSLATIONS["en"];
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [started, setStarted] = useState(false);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setCaptured(null);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStarted(true);
    } catch {
      setError(t.cameraError);
    }
  }, [t.cameraError]);

  // Auto-start on mount
  useState(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  });

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const retake = () => {
    setCaptured(null);
    startCamera(facingMode);
  };

  const switchCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const usePhoto = () => {
    if (captured) {
      onCapture(captured);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg">
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(135deg, #1a4d2e 0%, #2d7a47 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-white text-lg">{t.cameraModalTitle}</span>
          </div>
          <button
            onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onClose(); }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative bg-black" style={{ minHeight: 320 }}>
          {error ? (
            <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
              <Camera className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-300 text-sm">{error}</p>
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full object-cover" style={{ maxHeight: 380 }} />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full object-cover"
                style={{ maxHeight: 380, display: "block" }}
              />
              {/* Crop guide overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                  className="border-2 rounded-2xl"
                  style={{
                    width: "75%", height: "65%",
                    borderColor: "rgba(255,255,255,0.6)",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
                  }}
                />
                {/* Corner markers */}
                {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute w-6 h-6 border-white`}
                    style={{
                      top: pos.includes("top") ? "17.5%" : undefined,
                      bottom: pos.includes("bottom") ? "17.5%" : undefined,
                      left: pos.includes("left") ? "12.5%" : undefined,
                      right: pos.includes("right") ? "12.5%" : undefined,
                      borderTopWidth: pos.includes("top") ? 3 : 0,
                      borderBottomWidth: pos.includes("bottom") ? 3 : 0,
                      borderLeftWidth: pos.includes("left") ? 3 : 0,
                      borderRightWidth: pos.includes("right") ? 3 : 0,
                      borderTopLeftRadius: pos === "top-0 left-0" ? 6 : 0,
                      borderTopRightRadius: pos === "top-0 right-0" ? 6 : 0,
                      borderBottomLeftRadius: pos === "bottom-0 left-0" ? 6 : 0,
                      borderBottomRightRadius: pos === "bottom-0 right-0" ? 6 : 0,
                    }}
                  />
                ))}
                {/* Scanning line animation */}
                <div
                  className="absolute"
                  style={{
                    top: "17.5%", left: "12.5%",
                    width: "75%", height: "1px",
                    background: "linear-gradient(90deg, transparent, #4ade80, transparent)",
                    animation: "scanLine 2s ease-in-out infinite",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-5 bg-gray-50 flex items-center justify-between gap-3">
          {!captured ? (
            <>
              <button
                onClick={switchCamera}
                disabled={!!error}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-green-300 hover:text-green-700 transition-all disabled:opacity-40"
              >
                <Camera className="h-4 w-4" />
                {t.switchCamera}
              </button>
              <button
                onClick={capture}
                disabled={!!error || !started}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 shadow-lg"
                style={{ background: "linear-gradient(135deg, #1a4d2e, #2d7a47)" }}
              >
                <div className="w-3 h-3 rounded-full bg-white" />
                {t.captureBtn}
              </button>
              <div className="w-24" /> {/* spacer */}
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all"
              >
                <X className="h-4 w-4" />
                {t.retakeBtn}
              </button>
              <button
                onClick={usePhoto}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all"
                style={{ background: "linear-gradient(135deg, #1a4d2e, #2d7a47)" }}
              >
                <CheckCircle className="h-4 w-4" />
                {t.usePhotoBtn}
              </button>
            </>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 17.5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: calc(17.5% + 65%); }
        }
      `}</style>
    </div>
  );
};

// ─── Main Model Page ─────────────────────────────────────────────────────────
const Model = () => {
  const [language, setLanguage] = useState("en");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const t = TRANSLATIONS[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setResult(null);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        alert(t.loginAlert);
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], "wheat-image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", user.id.toString());
      formData.append("language", language);

      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Prediction failed");
      }

      const data = await res.json();
      setResult({
        diseaseName: data.diseaseName,
        riskLevel: data.riskLevel,
        confidenceLevel: data.confidenceLevel,
        remedies: data.remedies,
      });
      window.dispatchEvent(new CustomEvent("predictionComplete"));
    } catch (error) {
      alert(`Prediction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isHealthy = result?.diseaseName === "Healthy";

  return (
    <Layout>
      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          t={t}
        />
      )}

      <div className="min-h-[calc(100vh-64px)] bg-agri-mint">
        {/* Page Hero Strip */}
        <div
          className="relative overflow-hidden py-10 px-4"
          style={{ background: "linear-gradient(135deg, #1a4d2e 0%, #2d7a47 60%, #3a9e5f 100%)" }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
          <div className="absolute -bottom-14 -left-8 w-56 h-56 rounded-full opacity-10" style={{ background: "#fff" }} />

          <div className="container mx-auto relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur p-3 rounded-2xl">
                <FlaskConical className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{t.pageTitle}</h1>
                <p className="text-green-200 text-sm mt-0.5 max-w-md">{t.pageSubtitle}</p>
              </div>
            </div>

            {/* Language Toggle */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: "2px",
                background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: "999px", padding: "3px",
              }}
            >
              {[{ code: "en", flag: "🇬🇧", label: "English" }, { code: "te", flag: "🇮🇳", label: "తెలుగు" }].map(({ code, flag, label }) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 14px", borderRadius: "999px", fontSize: "13px",
                    fontWeight: language === code ? "600" : "400", border: "none", cursor: "pointer",
                    background: language === code ? "rgba(255,255,255,0.9)" : "transparent",
                    color: language === code ? "#1a4d2e" : "rgba(255,255,255,0.85)",
                    transition: "all 0.2s ease",
                    boxShadow: language === code ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                  }}
                >
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Disclaimer */}
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">{t.disclaimerTitle}</p>
              <p className="leading-relaxed">
                {t.disclaimerText1} <strong>{t.disclaimerBold1}</strong> {t.disclaimerText2} <strong>{t.disclaimerBold2}</strong>{t.disclaimerText3}
              </p>
            </div>
          </div>

          {/* Upload Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden mb-6">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <ScanLine className="h-5 w-5 text-green-700" />
              <span className="font-semibold text-gray-800">Image Input</span>
            </div>

            <div className="p-6">
              {!selectedImage ? (
                /* Upload / Camera options */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <label className="cursor-pointer group block">
                    <div
                      className="rounded-2xl p-8 text-center border-2 border-dashed transition-all"
                      style={{ borderColor: "#c8e6c9" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#1a4d2e")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#c8e6c9")}
                    >
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#e8f5e9" }}>
                        <Upload className="h-7 w-7" style={{ color: "#1a4d2e" }} />
                      </div>
                      <p className="font-semibold text-gray-800 mb-1">{t.uploadTitle}</p>
                      <p className="text-xs text-gray-400">{t.uploadSub}</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>

                  {/* Live Camera */}
                  <button
                    onClick={() => setShowCamera(true)}
                    className="cursor-pointer group block w-full text-left"
                  >
                    <div
                      className="rounded-2xl p-8 text-center border-2 border-dashed transition-all h-full"
                      style={{ borderColor: "#c8e6c9" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = "#1a4d2e")}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#c8e6c9")}
                    >
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#e8f5e9" }}>
                        <Camera className="h-7 w-7" style={{ color: "#1a4d2e" }} />
                      </div>
                      <p className="font-semibold text-gray-800 mb-1">{t.cameraTitle}</p>
                      <p className="text-xs text-gray-400">{t.cameraSub}</p>
                    </div>
                  </button>
                </div>
              ) : (
                /* Image Preview */
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden border border-green-100 bg-gray-50">
                    <img
                      src={selectedImage}
                      alt="Selected wheat crop"
                      className="w-full object-cover"
                      style={{ maxHeight: 320 }}
                    />
                  </div>
                  {/* Change image button */}
                  <div className="mt-4 flex justify-center gap-3">
                    <label className="cursor-pointer">
                      <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                        style={{ borderColor: "#c8e6c9", color: "#1a4d2e" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#e8f5e9")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <Upload className="h-4 w-4" />
                        {t.changeImage}
                      </span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      onClick={() => setShowCamera(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                      style={{ borderColor: "#c8e6c9", color: "#1a4d2e" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#e8f5e9")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Camera className="h-4 w-4" />
                      {t.cameraTitle}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedImage || isAnalyzing}
                  className="inline-flex items-center gap-3 px-10 py-3.5 rounded-2xl font-semibold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{
                    background: selectedImage && !isAnalyzing
                      ? "linear-gradient(135deg, #1a4d2e, #2d7a47)"
                      : "#9ca3af",
                    boxShadow: selectedImage && !isAnalyzing ? "0 4px 20px rgba(26,77,46,0.35)" : "none",
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <ZoomIn className="h-5 w-5" />
                      {t.submit}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div
              className="bg-white rounded-3xl shadow-lg border overflow-hidden animate-fade-in"
              style={{ borderColor: isHealthy ? "#bbf7d0" : "#fecaca" }}
            >
              {/* Result Header */}
              <div
                className="px-6 py-5 flex items-center gap-4"
                style={{
                  background: isHealthy
                    ? "linear-gradient(135deg, #1a4d2e, #2d7a47)"
                    : "linear-gradient(135deg, #7f1d1d, #dc2626)",
                }}
              >
                <div className="bg-white/20 p-3 rounded-2xl">
                  {isHealthy
                    ? <Leaf className="h-7 w-7 text-white" />
                    : <AlertTriangle className="h-7 w-7 text-white" />
                  }
                </div>
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {isHealthy ? t.healthyDetected : t.diseaseDetected}
                  </p>
                  <h2 className="text-white text-2xl font-bold">{result.diseaseName}</h2>
                </div>
              </div>

              <div className="p-6">
                {/* Metrics */}
                <div className="flex flex-wrap justify-center gap-8 mb-6 py-4 bg-gray-50 rounded-2xl">
                  <MetricCircle
                    value={result.riskLevel}
                    label={t.riskLevel}
                    type={result.riskLevel > 70 ? "danger" : result.riskLevel > 40 ? "warning" : "success"}
                  />
                  <MetricCircle
                    value={result.confidenceLevel}
                    label={t.confidenceLevel}
                    type="success"
                  />
                </div>

                {/* Remedies */}
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    background: isHealthy ? "#f0fdf4" : "#fff7f7",
                    borderColor: isHealthy ? "#bbf7d0" : "#fecaca",
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: isHealthy ? "#1a4d2e" : "#dc2626" }}
                    />
                    {isHealthy ? t.recommendations : t.remedy}
                  </h3>
                  <ol className="space-y-3">
                    {result.remedies.map((remedy, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                          style={{ background: isHealthy ? "#1a4d2e" : "#dc2626" }}
                        >
                          {index + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed text-sm">{remedy}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Model;