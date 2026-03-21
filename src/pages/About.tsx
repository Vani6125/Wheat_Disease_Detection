import Layout from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import farmerField from "@/assets/farmer-field.jpg";
import farmerTech from "@/assets/farmer-tech-illustration.png";
import { useState } from "react";

const About = () => {
  const [language, setLanguage] = useState("en");

  const t = {
    en: {
      vision: "Our Vision",
      technology: "Our Technology",
      expert: "Expert-Backed Solutions",
      faqTitle: "Frequently Asked Questions (FAQs)",
      visionText1:
        "Agri Lens was founded with a mission to empower wheat farmers by bridging the gap between traditional farming and modern technology. We believe that by providing accessible, AI-driven insights, we can help growers protect their livelihoods and ensure global food security.",
      visionText2:
        "Our goal is to make precision agriculture a standard tool for every farmer, regardless of their scale or location.",
    },
    te: {
      vision: "మా దృష్టి",
      technology: "మా సాంకేతికత",
      expert: "నిపుణుల ఆధారిత పరిష్కారాలు",
      faqTitle: "తరచుగా అడిగే ప్రశ్నలు (FAQs)",
      visionText1:
        "Agri Lens సంప్రదాయ వ్యవసాయం మరియు ఆధునిక సాంకేతికత మధ్య అంతరాన్ని తగ్గించి గోధుమ రైతులను శక్తివంతం చేయడానికి స్థాపించబడింది. అందుబాటులో ఉండే AI-ఆధారిత అంతర్దృష్టులను అందించడం ద్వారా రైతులు తమ జీవనోపాధిని రక్షించుకోవడంలో సహాయపడగలమని మేము విశ్వసిస్తున్నాము.",
      visionText2:
        "ప్రతి రైతుకు ఖచ్చితమైన వ్యవసాయం ఒక సాధారణ సాధనంగా మారడం మా లక్ష్యం.",
    },
  };

  const text = t[language];

  const faqs = [
    {
      question:
        language === "te"
          ? "Agri Lens వ్యాధి గుర్తింపు ఎంత ఖచ్చితంగా ఉంటుంది?"
          : "How accurate is the Agri Lens disease detection?",
      answer:
        language === "te"
          ? "AgriLens రస్ట్, సెప్టోరియా మరియు పౌడరీ మిల్డ్యూ వంటి సాధారణ గోధుమ వ్యాధులను గుర్తించడంలో 95% వరకు ఖచ్చితత్వాన్ని సాధిస్తుంది. మా AI మోడల్ వేలాది ధృవీకరించిన నమూనాలపై నిరంతరం శిక్షణ పొందుతోంది."
          : "AgriLens achieves up to 95% accuracy in detecting common wheat diseases such as Rust, Septoria, and Powdery Mildew. Our AI model is continuously trained on thousands of verified samples.",
    },
    {
      question:
        language === "te"
          ? "యాప్ వ్యాధిని గుర్తించలేకపోతే ఏమి చేయాలి?"
          : "What should I do if the app cannot identify the disease?",
      answer:
        language === "te"
          ? "యాప్ వ్యాధిని గుర్తించలేకపోతే, మీరు నిపుణుల సమీక్ష కోసం చిత్రాన్ని సమర్పించవచ్చు. మా వ్యవసాయ నిపుణుల బృందం మీ నమూనాను విశ్లేషించి 24-48 గంటల్లో మార్గదర్శకత్వం అందిస్తుంది."
          : "If the app cannot identify the disease, you can submit the image for expert review. Our team of agronomists will analyze your sample and provide personalized guidance within 24-48 hours.",
    },
    {
      question:
        language === "te"
          ? "యాప్ ఉపయోగించడానికి నిరంతర ఇంటర్నెట్ కనెక్షన్ అవసరమా?"
          : "Do I need a constant internet connection to use the app?",
      answer:
        language === "te"
          ? "ఉత్తమ అనుభవం కోసం ఇంటర్నెట్ కనెక్షన్ సిఫార్సు చేయబడినప్పటికీ, AgriLens ప్రాథమిక స్కానింగ్ మరియు గతంలో సేవ్ చేసిన ఫలితాలను వీక్షించడానికి పరిమిత ఆఫ్‌లైన్ కార్యాచరణను అందిస్తుంది."
          : "While an internet connection is recommended for the best experience and real-time analysis, AgriLens offers limited offline functionality for basic scanning and viewing previously saved results.",
    },
    {
      question:
        language === "te"
          ? "వ్యాధి లేకపోయినా పంట ఒత్తిడిలో ఉంటే యాప్ సహాయపడుతుందా?"
          : "Can the app help me if my wheat is just 'stressed' but not diseased?",
      answer:
        language === "te"
          ? "అవును! AgriLens పోషక లోపం, నీటి ఒత్తిడి మరియు ఇతర వ్యాధి రహిత సమస్యల సంకేతాలను గుర్తించగలదు. మొత్తం పంట ఆరోగ్యాన్ని మెరుగుపరచడానికి యాప్ సిఫార్సులు అందిస్తుంది."
          : "Yes! AgriLens can detect signs of nutrient deficiency, water stress, and other non-disease related issues. The app provides recommendations for improving overall crop health.",
    },
    {
      question:
        language === "te"
          ? "వాతావరణ డేటా ఎంత తరచుగా నవీకరించబడుతుంది?"
          : "How often is the weather data updated?",
      answer:
        language === "te"
          ? "వాతావరణ డేటా బహుళ విశ్వసనీయ మూలాల నుండి ప్రతి గంటకు నవీకరించబడుతుంది. వ్యాధి వ్యాప్తి అంచనాలు ప్రస్తుత వాతావరణ పరిస్థితుల ఆధారంగా ప్రతి 6 గంటలకు రిఫ్రెష్ చేయబడతాయి."
          : "Weather data is updated every hour from multiple reliable sources. Disease outbreak predictions are refreshed every 6 hours based on current meteorological conditions.",
    },
  ];

  return (
    <Layout>

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

      {/* Vision Section */}
      <section className="py-16 bg-agri-mint">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-6">{text.vision}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {text.visionText1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {text.visionText2}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={farmerField}
                alt="Farmer inspecting wheat"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src={farmerTech}
                alt="Smart farming technology"
                className="rounded-2xl shadow-xl max-w-md mx-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="section-title mb-6">{text.technology}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {text.visionText1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {text.visionText2}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expert-Backed Solutions */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-6">{text.expert}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {text.visionText1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {text.visionText2}
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={farmerField}
                alt="Expert farmer"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="section-title text-center mb-12">
            {text.faqTitle}
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6"
              >
                <AccordionTrigger className="text-left font-medium text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

    </Layout>
  );
};

export default About;