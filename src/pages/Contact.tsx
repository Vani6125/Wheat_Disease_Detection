import { Mail, Phone, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import supportIllustration from "@/assets/support-illustration.png";
import { useState } from "react";

const Contact = () => {
  const [language, setLanguage] = useState("en");

  const t = {
    en: {
      title: "Support",
      getInTouch: "Get in Touch",
      description:
        "Have questions or need assistance? Our support team is here to help you with any queries related to the AgriLens application.",
      email: "Email",
      phone: "Phone",
      address: "Address",
      addressValue: "Agricultural Tech Hub, India",
      appQueries: "For app related queries:",
    },
    te: {
      title: "మద్దతు",
      getInTouch: "సంప్రదించండి",
      description:
        "మీకు ప్రశ్నలు ఉన్నాయా లేదా సహాయం అవసరమా? AgriLens అప్లికేషన్‌కు సంబంధించిన ఏదైనా సందేహాలకు మా మద్దతు బృందం సహాయం చేయడానికి సిద్ధంగా ఉంది.",
      email: "ఇమెయిల్",
      phone: "ఫోన్",
      address: "చిరునామా",
      addressValue: "వ్యవసాయ సాంకేతిక కేంద్రం, భారతదేశం",
      appQueries: "యాప్ సంబంధిత సందేహాలకు:",
    },
  };

  const text = t[language];

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

      <div className="py-16 bg-agri-mint min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4">
          <h1 className="section-title text-center mb-12">{text.title}</h1>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-md border border-border">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Illustration */}
                <div className="text-center">
                  <img
                    src={supportIllustration}
                    alt="Customer support"
                    className="max-w-xs mx-auto"
                  />
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <h2 className="font-heading text-2xl font-semibold text-primary">
                    {text.getInTouch}
                  </h2>
                  <p className="text-muted-foreground">{text.description}</p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{text.email}</p>
                        <p className="font-medium text-foreground">
                          support@agrilens.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{text.phone}</p>
                        <p className="font-medium text-foreground">
                          +91 XX-XXX-XXXX
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{text.address}</p>
                        <p className="font-medium text-foreground">
                          {text.addressValue}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground pt-4 border-t border-border">
                    {text.appQueries}{" "}
                    <a
                      href="mailto:abc@support.xyz.com"
                      className="text-primary hover:underline"
                    >
                      abc@support.xyz.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;