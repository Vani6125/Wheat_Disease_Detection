import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import re

# ---------- Load .env ----------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env!")

# ---------- Initialize Gemini ----------
genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAMES = ['gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro', 'gemini-1.5-flash']
model = None

for model_name in MODEL_NAMES:
    try:
        model = genai.GenerativeModel(model_name)
        print(f"✅ Gemini model '{model_name}' initialized successfully")
        break
    except Exception as e:
        print(f"⚠️  Model '{model_name}' failed: {e}")
        continue

if model is None:
    print("❌ Could not initialize any Gemini model. Using fallback mode.")
    try:
        available_models = genai.list_models()
        print("Available models:")
        for m in available_models:
            if 'generateContent' in m.supported_generation_methods:
                print(f"  ✅ {m.name}")
    except:
        pass

# ---------- Disease Database (same as before - kept for brevity) ----------
DISEASE_DATABASE = {
    "Aphid": {
        "type": "Insect Pest",
        "cause": "Aphid infestation feeding on plant sap, spreads rapidly in warm dry conditions",
        "severity": "7",
        "symptoms": ["Yellowing leaves", "Stunted growth", "Honeydew secretion", "Sooty mold", "Curling leaves", "Ant activity on plants"],
        "precautions": ["Regular monitoring", "Use of reflective mulch", "Avoid excess nitrogen fertilizer", "Early detection"],
        "prevention": ["Early planting", "Use of resistant varieties", "Introduce natural predators (ladybugs)", "Crop rotation with non-host crops", "Remove weed hosts"],
        "remedies": ["Neem oil spray (5ml per liter)", "Insecticidal soap spray", "Imidacloprid (systemic insecticide)", "Pyrethrin-based insecticides", "Spraying with soap water"],
        "risk_season": "Warm, dry conditions",
        "spread_method": "Wind, ants, plant contact"
    },
    "Black Rust": {
        "type": "Fungal Disease",
        "cause": "Puccinia graminis fungus, spreads through wind-borne spores",
        "severity": "9",
        "symptoms": ["Black pustules on stems and leaves", "Leaf yellowing and drying", "Reduced grain fill", "Stem breakage", "Powdery black spores"],
        "precautions": ["Destroy infected crop residues", "Avoid late sowing", "Regular field scouting", "Isolate infected areas"],
        "prevention": ["Plant resistant varieties (like HD 2967)", "Proper plant spacing", "Balanced fertilization", "Timely sowing", "Use certified disease-free seeds"],
        "remedies": ["Tebuconazole (Folicur) at 1ml/liter", "Propiconazole (Tilt) 1ml/liter", "Triazole fungicides", "Sulfur dusting", "Mancozeb spray"],
        "risk_season": "Cool, humid weather (15-25°C)",
        "spread_method": "Wind-borne spores"
    },
    "Brown Rust": {
        "type": "Fungal Disease",
        "cause": "Puccinia recondita fungus",
        "severity": "8",
        "symptoms": ["Brown-orange pustules on leaves", "Yellow halos around pustules", "Premature leaf senescence", "Reduced photosynthesis"],
        "precautions": ["Monitor regularly", "Avoid dense planting", "Remove volunteer plants"],
        "prevention": ["Resistant varieties", "Early sowing", "Balanced nutrition", "Field sanitation"],
        "remedies": ["Tebuconazole", "Propiconazole", "Azoxystrobin", "Mixed fungicide sprays"],
        "risk_season": "Cool to warm humid weather",
        "spread_method": "Wind-borne spores"
    },
    "Yellow Rust": {
        "type": "Fungal Disease",
        "cause": "Puccinia striiformis fungus",
        "severity": "8",
        "symptoms": ["Yellow stripe-like pustules", "Parallel lines on leaves", "Yellow powder on leaves", "Leaf drying from tips"],
        "precautions": ["Regular field inspection", "Avoid late varieties", "Monitor temperature"],
        "prevention": ["Resistant varieties", "Early sowing", "Proper spacing", "Field hygiene"],
        "remedies": ["Triazole fungicides", "Strobilurin fungicides", "Mixed fungicides", "Early application"],
        "risk_season": "Cool temperatures (10-15°C)",
        "spread_method": "Wind-borne spores"
    },
    "Blast": {
        "type": "Fungal Disease",
        "cause": "Magnaporthe oryzae fungus",
        "severity": "9",
        "symptoms": ["Diamond-shaped lesions", "Center grey with brown margins", "Spindle-shaped spots", "Rapid leaf drying"],
        "precautions": ["Avoid waterlogging", "Use balanced fertilizer", "Monitor humidity"],
        "prevention": ["Resistant varieties", "Proper drainage", "Crop rotation", "Seed treatment"],
        "remedies": ["Tricyclazole", "Carbendazim", "Mancozeb", "Isoprothiolane"],
        "risk_season": "Warm humid conditions",
        "spread_method": "Wind and rain splash"
    },
    "Common Root Rot": {
        "type": "Fungal Disease",
        "cause": "Bipolaris sorokiniana fungus",
        "severity": "6",
        "symptoms": ["Brown lesions on roots", "Stunted plants", "Poor tillering", "Premature ripening"],
        "precautions": ["Avoid water stress", "Improve soil drainage", "Test soil pH"],
        "prevention": ["Seed treatment", "Crop rotation", "Deep plowing", "Organic matter addition"],
        "remedies": ["Carboxin + Thiram seed treatment", "Mancozeb soil drench", "Improve soil health"],
        "risk_season": "All seasons, worse in stress",
        "spread_method": "Soil-borne, seed-borne"
    },
    "Fusarium Head Blight": {
        "type": "Fungal Disease",
        "cause": "Fusarium graminearum fungus",
        "severity": "9",
        "symptoms": ["Bleached spikelets", "Pink mold on grains", "Shriveled grains", "Tombstone kernels"],
        "precautions": ["Avoid flowering during rain", "Monitor weather forecasts", "Harvest timely"],
        "prevention": ["Resistant varieties", "Crop rotation", "Proper irrigation", "Field sanitation"],
        "remedies": ["Tebuconazole at flowering", "Prothioconazole", "Mixed fungicides", "Biological control"],
        "risk_season": "Flowering in humid conditions",
        "spread_method": "Rain splash, wind"
    },
    "Healthy": {
        "type": "Healthy Plant",
        "cause": "Optimal growing conditions with good management",
        "severity": "0",
        "symptoms": ["Vibrant green leaves", "Strong upright stems", "Normal growth rate", "Good grain development", "No spots or discoloration"],
        "precautions": ["Continue good practices", "Regular monitoring", "Soil testing every season", "Maintain field hygiene"],
        "prevention": ["Crop rotation", "Balanced NPK fertilization", "Proper irrigation scheduling", "Weed control", "Use quality seeds"],
        "remedies": ["Maintain current practices", "Apply preventive fungicides if nearby fields infected", "Regular scouting"],
        "message": "Excellent! Your wheat crop appears healthy and thriving.",
        "risk_season": "N/A",
        "spread_method": "N/A"
    },
    "Leaf Blight": {
        "type": "Fungal Disease",
        "cause": "Alternaria triticina fungus",
        "severity": "7",
        "symptoms": ["Small oval brown spots", "Yellow halos", "Coalescing lesions", "Leaf blighting"],
        "precautions": ["Avoid overhead irrigation", "Monitor humidity", "Remove infected debris"],
        "prevention": ["Resistant varieties", "Seed treatment", "Proper spacing", "Crop rotation"],
        "remedies": ["Mancozeb", "Chlorothalonil", "Copper-based fungicides", "Early sprays"],
        "risk_season": "Warm humid weather",
        "spread_method": "Wind, rain, infected seeds"
    },
    "Mildew": {
        "type": "Fungal Disease",
        "cause": "Blumeria graminis fungus",
        "severity": "6",
        "symptoms": ["White powdery coating", "Leaf yellowing", "Reduced growth", "Premature senescence"],
        "precautions": ["Avoid excess nitrogen", "Monitor crop density", "Improve air circulation"],
        "prevention": ["Resistant varieties", "Proper spacing", "Balanced fertilization", "Timely sowing"],
        "remedies": ["Sulfur dusting", "Triazole fungicides", "Potassium bicarbonate", "Neem oil"],
        "risk_season": "Cool humid conditions",
        "spread_method": "Wind-borne spores"
    },
    "Mite": {
        "type": "Pest",
        "cause": "Wheat curl mite infestation",
        "severity": "5",
        "symptoms": ["Leaf curling", "Stunted growth", "Silver streaks", "Deformed leaves"],
        "precautions": ["Regular monitoring", "Early detection", "Remove volunteer plants"],
        "prevention": ["Clean cultivation", "Crop rotation", "Resistant varieties", "Field sanitation"],
        "remedies": ["Abamectin", "Spiromesifen", "Sulfur sprays", "Neem oil"],
        "risk_season": "Dry warm conditions",
        "spread_method": "Wind, plant contact"
    },
    "Septoria": {
        "type": "Fungal Disease",
        "cause": "Septoria tritici fungus",
        "severity": "7",
        "symptoms": ["Yellow-brown lesions", "Black pycnidia in lesions", "Leaf yellowing", "Premature defoliation"],
        "precautions": ["Avoid dense stands", "Monitor leaf wetness", "Remove crop debris"],
        "prevention": ["Resistant varieties", "Crop rotation", "Proper fertilization", "Timely sowing"],
        "remedies": ["Triazole fungicides", "Strobilurin fungicides", "Mixed fungicides", "Early application"],
        "risk_season": "Cool wet weather",
        "spread_method": "Rain splash, infected debris"
    },
    "Smut": {
        "type": "Fungal Disease",
        "cause": "Ustilago tritici fungus",
        "severity": "8",
        "symptoms": ["Black powdery mass in spikes", "Destroyed grains", "Stunted plants", "Early heading"],
        "precautions": ["Use certified seeds", "Avoid saving infected seeds", "Test seeds before sowing"],
        "prevention": ["Seed treatment", "Resistant varieties", "Crop rotation", "Deep plowing"],
        "remedies": ["Carboxin + Thiram seed treatment", "Tebuconazole seed treatment", "Hot water treatment"],
        "risk_season": "Germination to flowering",
        "spread_method": "Seed-borne, soil-borne"
    },
    "Stem fly": {
        "type": "Insect Pest",
        "cause": "Meromyza saltatrix infestation",
        "severity": "6",
        "symptoms": ["White streaks on leaves", "Dead heart in seedlings", "Stunted growth", "Reduced tillering"],
        "precautions": ["Early sowing", "Monitor fly activity", "Use yellow sticky traps"],
        "prevention": ["Timely sowing", "Clean cultivation", "Crop rotation", "Resistant varieties"],
        "remedies": ["Imidacloprid seed treatment", "Fipronil soil application", "Spray insecticides", "Neem seed kernel extract"],
        "risk_season": "Winter months",
        "spread_method": "Adult flies flying"
    },
    "Tan spot": {
        "type": "Fungal Disease",
        "cause": "Pyrenophora tritici-repentis fungus",
        "severity": "7",
        "symptoms": ["Tan-brown elliptical spots", "Yellow halos", "Lesion coalescence", "Leaf blighting"],
        "precautions": ["Avoid continuous wheat", "Monitor residue decomposition", "Test soil nutrients"],
        "prevention": ["Crop rotation", "Resistant varieties", "Stubble management", "Balanced fertilization"],
        "remedies": ["Triazole fungicides", "Strobilurin fungicides", "Mixed fungicides", "Early sprays"],
        "risk_season": "Cool moist conditions",
        "spread_method": "Infected crop residue"
    },
    "Other Disease": {
        "type": "Unknown/Other",
        "cause": "Various pathogens or environmental stress",
        "severity": "5",
        "symptoms": ["Abnormal leaf spots", "Stunted growth", "Discoloration", "Wilting", "Unusual patterns"],
        "precautions": ["Consult expert immediately", "Take clear photos", "Isolate affected plants", "Record symptoms"],
        "prevention": ["General field hygiene", "Crop rotation", "Use certified seeds", "Balanced nutrition"],
        "remedies": ["Consult local KVK", "Apply broad-spectrum fungicide", "Improve soil health", "Adjust irrigation"],
        "message": "This appears to be an unidentified issue. Please consult with an agricultural expert.",
        "risk_season": "Variable",
        "spread_method": "Depends on cause"
    }
}

ALL_DISEASE_NAMES = list(DISEASE_DATABASE.keys())
print(f"✅ Loaded {len(ALL_DISEASE_NAMES)} wheat diseases in database")


def find_matching_disease(user_input):
    if not user_input:
        return None
    user_input = user_input.strip().lower()
    for disease in ALL_DISEASE_NAMES:
        if disease.lower() == user_input:
            return disease
    for disease in ALL_DISEASE_NAMES:
        if user_input in disease.lower() or disease.lower() in user_input:
            return disease
    variations = {
        "yellowrust": "Yellow Rust", "blackrust": "Black Rust", "brownrust": "Brown Rust",
        "leafblight": "Leaf Blight", "tan spot": "Tan spot", "stemfly": "Stem fly",
        "rootrot": "Common Root Rot", "fusarium": "Fusarium Head Blight",
        "septoria": "Septoria", "smut": "Smut", "mildew": "Mildew",
        "blast": "Blast", "mite": "Mite", "aphid": "Aphid",
        "healthy": "Healthy", "other": "Other Disease"
    }
    for variation, disease_name in variations.items():
        if variation in user_input.replace(" ", ""):
            return disease_name
    clean_input = re.sub(r'[^a-z]', '', user_input)
    for disease in ALL_DISEASE_NAMES:
        clean_disease = re.sub(r'[^a-z]', '', disease.lower())
        if clean_input in clean_disease or clean_disease in clean_input:
            return disease
    return None


def categorize_question(question: str) -> str:
    question_lower = question.lower()
    patterns = {
        "symptoms": ['symptom', 'look like', 'identify', 'recognize', 'appearance', 'sign', 'spot', 'show', 'visible', 'see',
                     'లక్షణ', 'గుర్తించ', 'కనిపించ', 'చూడ'],
        "treatment": ['treat', 'remedy', 'cure', 'solution', 'control', 'spray', 'chemical', 'fungicide', 'pesticide', 'apply', 'dose', 'dosage', 'medicine',
                      'చికిత్స', 'నివారణ', 'మందు', 'పిచికారి', 'వేయ'],
        "prevention": ['prevent', 'avoid', 'stop', 'protection', 'shield',
                       'నివారించ', 'ఆపు', 'రక్షణ'],
        "causes": ['cause', 'why', 'reason', 'source', 'trigger',
                   'కారణ', 'ఎందుకు', 'వల్ల'],
        "spread": ['spread', 'contagious', 'transmit',
                   'వ్యాపించ', 'సంక్రమణ'],
        "severity": ['severe', 'serious', 'dangerous', 'damage',
                     'తీవ్రత', 'ప్రమాద', 'నష్ట'],
        "timing": ['time', 'when', 'season', 'weather',
                   'సమయ', 'ఎప్పుడు', 'కాలం'],
        "organic": ['natural', 'organic', 'home remedy',
                    'సహజ', 'సేంద్రియ', 'ఇంటి'],
        "impact": ['harvest', 'yield', 'production', 'quality',
                   'దిగుబడి', 'నాణ్యత', 'పంట'],
        "resistance": ['resistant', 'variety', 'cultivar',
                       'నిరోధక', 'రకం'],
        "cultural": ['soil', 'fertilizer', 'water', 'irrigation',
                     'నేల', 'ఎరువు', 'నీటి'],
    }
    for category, category_patterns in patterns.items():
        if any(pattern in question_lower for pattern in category_patterns):
            return category
    if any(word in question_lower for word in ['what', 'how', 'when', 'where', 'why', 'which',
                                                'ఏమి', 'ఎలా', 'ఎప్పుడు', 'ఎక్కడ', 'ఎందుకు']):
        return "general"
    return "unknown"


def format_bullet_list(items, limit=5):
    if isinstance(items, list):
        items = items[:limit]
        return "\n".join([f"• {item}" for item in items])
    elif isinstance(items, str):
        return f"• {items}"
    return "• Information not available"


def create_fallback_response(disease_name, question_type, info, language="en"):
    """Fallback responses in English or Telugu."""

    if language == "te":
        templates = {
            "symptoms": f"""🔍 **{disease_name} గుర్తింపు:**

**ముఖ్యమైన లక్షణాలు:**
{format_bullet_list(info.get('symptoms', []))}

**గుర్తింపు చిట్కాలు:**
• ఆకు పైభాగం మరియు అడుగు భాగం రెండూ తనిఖీ చేయండి
• మొదట చిన్న ఆకులపై ప్రారంభ సంకేతాలు చూడండి
• అదే పొలంలోని ఆరోగ్యకరమైన మొక్కలతో పోల్చండి
• వేర్వేరు కోణాల నుండి స్పష్టమైన ఫోటోలు తీయండి

**తనిఖీ సమయం:** లక్షణాలు అత్యంత స్పష్టంగా కనిపించే తెల్లవారు లేదా సాయంత్రం""",

            "treatment": f"""🩺 **{disease_name} చికిత్స:**

**సిఫార్సు చేసిన చికిత్సలు:**
{format_bullet_list(info.get('remedies', []))}

**వినియోగ మార్గదర్శకాలు:**
• ఉత్తమ శోషణ కోసం తెల్లవారు వేళ పిచికారి చేయండి
• పిచికారి చేయడానికి ముందు శిలీంద్రనాశనులు/కీటకనాశనులను సరిగ్గా కలపండి
• ఆకు రెండు వైపులా పూర్తిగా కప్పండి
• అవసరమైతే 10-15 రోజుల తర్వాత మళ్ళీ వేయండి

⚠️ **జాగ్రత్త:** ఎల్లప్పుడూ లేబుల్ సూచనలు చదివి పాటించండి""",

            "prevention": f"""🛡️ **{disease_name} నివారణ:**

**నివారణ వ్యూహాలు:**
{format_bullet_list(info.get('prevention', []))}

**సాంస్కృతిక పద్ధతులు:**
• పప్పు ధాన్యాలు, నూనె గింజలతో పంట మార్పిడి చేయండి
• నమ్మకమైన మూలాల నుండి ధృవీకరించిన విత్తనాలు ఉపయోగించండి
• సరైన మొక్కల అంతరం నిర్వహించండి (వరుసల మధ్య 15-20 సెం.మీ.)
• నీరు నిల్వ పడకుండా మంచి పొలం నీరు పారుదల నిర్ధారించండి

🌱 **దీర్ఘకాలిక వ్యూహం:** నేల ఆరోగ్యాన్ని మెరుగుపరచండి""",

            "causes": f"""🔬 **{disease_name} కారణాలు:**

**ప్రాథమిక కారణం:** {info.get('cause', 'వివిధ వ్యాధికారకాలు మరియు పర్యావరణ కారకాలు')}

**దోహదపడే కారకాలు:**
• వాతావరణ పరిస్థితులు: {info.get('risk_season', 'నిర్దిష్ట వాతావరణ నమూనాలు')}
• పొలం పరిశుభ్రత లేకపోవడం
• సంక్రమించిన విత్తన సామగ్రి లేదా కలుషితమైన విత్తనాలు
• అసమతుల్య ఎరువులు (ముఖ్యంగా అధిక నత్రజని)
• నీటి ఒత్తిడి లేదా సరికాని సేద్యపు నీరు

🌦️ **ప్రమాదం పెరిగే సమయం:** {info.get('risk_season', 'నిర్దిష్ట వాతావరణ పరిస్థితులు')}""",

            "general": f"""🌾 **{disease_name} గురించి:**

**ప్రాథమిక సమాచారం:**
• రకం: {info.get('type', 'పంట వ్యాధి/చీడ')}
• తీవ్రత స్థాయి: {info.get('severity', '5')}/10
• ముఖ్య కారణం: {info.get('cause', 'వివిధ కారకాలు')[:80]}...

**త్వరిత చర్యలు:**
1. మీ పంటను క్రమం తప్పకుండా పర్యవేక్షించండి
2. ముందుగా నివారణ చర్యలు తీసుకోండి
3. స్థానిక సిఫార్సుల కోసం KVK ని సంప్రదించండి
4. భవిష్యత్ సూచన కోసం పొలం రికార్డులు ఉంచండి

👨‍🌾 **రైతు సలహా:** వ్యాధి విజయవంతంగా నిర్వహించడానికి ముందస్తు గుర్తింపు మరియు సకాలంలో చర్య కీలకం."""
        }
    else:
        templates = {
            "symptoms": f"""🔍 **Identifying {disease_name}:**

**Main Symptoms:**
{format_bullet_list(info.get('symptoms', []))}

**Identification Tips:**
• Check both upper and lower leaf surfaces
• Look for early signs on younger leaves first
• Compare with healthy plants in the same field
• Take clear photos from different angles
• Note the pattern and progression of symptoms

**When to inspect:** Early morning or late afternoon when symptoms are most visible""",

            "treatment": f"""🩺 **Treating {disease_name}:**

**Recommended Treatments:**
{format_bullet_list(info.get('remedies', []))}

**Application Guidelines:**
• Apply in early morning for best absorption
• Mix fungicides/insecticides properly before spraying
• Cover both sides of leaves thoroughly
• Repeat application after 10-15 days if needed

⚠️ **Safety First:** Always read and follow label instructions""",

            "prevention": f"""🛡️ **Preventing {disease_name}:**

**Prevention Strategies:**
{format_bullet_list(info.get('prevention', []))}

**Cultural Practices:**
• Rotate with non-host crops (pulses, oilseeds, legumes)
• Use certified disease-free seeds from reliable sources
• Maintain proper plant spacing (15-20 cm between rows)
• Ensure good field drainage to avoid waterlogging

🌱 **Long-term Strategy:** Build soil health and use integrated pest management""",

            "causes": f"""🔬 **Causes of {disease_name}:**

**Primary Cause:** {info.get('cause', 'Various pathogens and environmental factors')}

**Contributing Factors:**
• Weather conditions: {info.get('risk_season', 'Specific weather patterns')}
• Poor field sanitation and crop residue management
• Infected planting material or contaminated seeds
• Imbalanced fertilization (especially excess nitrogen)
• Water stress or improper irrigation

🌦️ **Risk Increases During:** {info.get('risk_season', 'Specific weather conditions')}""",

            "general": f"""🌾 **About {disease_name}:**

**Basic Information:**
• Type: {info.get('type', 'Crop disease/pest')}
• Severity Level: {info.get('severity', '5')}/10
• Main Cause: {info.get('cause', 'Various factors')[:80]}...

**Quick Actions:**
1. Monitor your crop regularly
2. Take preventive measures early
3. Consult KVK for local recommendations
4. Keep field records for future reference

👨‍🌾 **Farmer Advice:** Early detection and timely action are key to successful management."""
        }

    return templates.get(question_type, templates["general"])


def wheat_chatbot(user_question: str, disease_input: str, language: str = "en") -> str:
    """
    Main chatbot function.
    language: "en" for English, "te" for Telugu
    """
    if not disease_input or not disease_input.strip():
        if language == "te":
            return "🌾 నిర్దిష్ట సలహా పొందడానికి దయచేసి పైన జాబితా నుండి గోధుమ వ్యాధిని ఎంచుకోండి."
        return "🌾 Please select a wheat disease from the list above to get specific advice."

    matched_disease = find_matching_disease(disease_input)

    if not matched_disease:
        clean_input = disease_input.strip().title()
        if clean_input in ALL_DISEASE_NAMES:
            matched_disease = clean_input
        else:
            available_diseases = ", ".join(ALL_DISEASE_NAMES[:8]) + "..."
            if language == "te":
                return f"🌾 నేను నిర్దిష్ట గోధుమ వ్యాధులపై దృష్టి పెడతాను. దయచేసి వీటిలో నుండి ఎంచుకోండి: {available_diseases}"
            return f"🌾 I focus on specific wheat diseases. Please select from: {available_diseases}"

    info = DISEASE_DATABASE.get(matched_disease, DISEASE_DATABASE["Other Disease"])

    # Handle healthy plants
    if matched_disease == "Healthy":
        if language == "te":
            return f"""✅ మీ గోధుమ పంట ఆరోగ్యంగా మరియు వర్ధిల్లుతోంది!

💡 **నిర్వహణ చిట్కాలు:**
• పప్పు ధాన్యాలతో పంట మార్పిడి కొనసాగించండి
• ప్రతి సీజన్ నేల పోషకాలను పరీక్షించండి
• చీడపీడల ముందస్తు సంకేతాల కోసం పర్యవేక్షించండి
• సరైన సేద్యపు నీరు మరియు నీరు పారుదల నిర్వహించండి
• ట్రాకింగ్ కోసం పొలం రికార్డులు ఉంచండి

🌱 **రక్షిత గా ఉండండి:**
సమీపంలోని పొలాలలో వ్యాధి లక్షణాలు కనిపిస్తే మాత్రమే నివారణ శిలీంద్రనాశనులు వేయండి."""
        healthy_msg = info.get("message", "✅ Your wheat crop is healthy!")
        return f"""{healthy_msg}

💡 **Maintenance Tips:**
• Continue crop rotation with legumes
• Test soil nutrients every season
• Monitor for early pest signs
• Maintain optimal irrigation
• Keep field records for tracking

🌱 **Stay Protected:**
Apply preventive fungicides only if nearby fields show disease symptoms."""

    question_type = categorize_question(user_question)

    # ── AI path ────────────────────────────────────────────────────────────────
    if model is not None:
        try:
            if language == "te":
                # Stronger Telugu language enforcement
                language_instruction = """CRITICAL INSTRUCTION: You MUST respond ENTIRELY in Telugu language (తెలుగు).

STRICT RULES:
1. ALL text must be in Telugu - including headings, explanations, bullet points, and recommendations
2. ONLY these can be in English: 
   - Chemical names (e.g., Tebuconazole, Mancozeb, Propiconazole)
   - Measurements (ml, g, litre, kg, hectare)
   - Numbers and percentages
   - Scientific/Latin names
3. Format ALL advice using simple Telugu that rural farmers can easily understand
4. Use Telugu bullet points (•) for lists
5. ALL headings must be in Telugu

Example format:
**ముఖ్య సిఫార్సులు:**
• [Telugu text with English chemical names only]
• [Telugu text]

**నివారించవలసిన తప్పులు:**
• [Telugu text]"""

                doctor_name = "డా. గోధుమ నిపుణుడు, సీనియర్ గోధుమ వ్యాధి నిపుణుడు"
            else:
                language_instruction = "Respond in clear, simple English suitable for Indian farmers. Use bullet points with • for lists."
                doctor_name = "Dr. Wheatley, Senior Wheat Pathologist"

            prompt = f"""You are an expert wheat disease pathologist with 30+ years experience advising Indian farmers.

{language_instruction}

FARMER'S QUESTION: "{user_question}"
DISEASE: {matched_disease}

DISEASE BACKGROUND:
- Type: {info.get('type', 'wheat disease')}
- Main Cause: {info.get('cause', 'Various factors')}
- Key Symptoms: {', '.join(info.get('symptoms', [])[:3])}
- Spread Method: {info.get('spread_method', 'Various means')}
- Risk Season: {info.get('risk_season', 'Specific conditions')}

QUESTION TYPE: {question_type.upper()}

REQUIREMENTS:
1. Answer ONLY what was asked — be specific and direct
2. Give practical, actionable advice for Indian farmers
3. Mention specific products available in India with exact dosages
4. Suggest both chemical and organic options where relevant
5. Warn about common mistakes farmers make
6. Keep response 200-300 words
7. Be encouraging and supportive

FORMAT YOUR RESPONSE AS:
{'**ప్రత్యక్ష సమాధానం:**' if language == 'te' else '**Direct Answer:**'}
[Direct answer to the specific question]

{'**ముఖ్య సిఫార్సులు:**' if language == 'te' else '**Key Recommendations:**'}
• [Action 1 with details]
• [Action 2 with details]
• [Action 3 with details]

{'**నివారించవలసిన తప్పులు:**' if language == 'te' else '**Avoid These Mistakes:**'}
• [Mistake 1]
• [Mistake 2]

{'**తదుపరి చర్య:**' if language == 'te' else '**Next Step:**'}
[One specific follow-up action]

{'**ప్రోత్సాహక సందేశం:**' if language == 'te' else '**Encouraging Message:**'}
[Encouraging closing line]"""

            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 600,
                }
            )

            answer = response.text.strip()
            if answer and len(answer) > 100:
                return f"""{answer}

---
🌾 **{'వ్యాధి' if language == 'te' else 'Disease'}:** {matched_disease}
👨‍🔬 *{doctor_name}*"""

        except Exception as e:
            print(f"⚠️  AI generation failed, using fallback: {e}")

    # ── Fallback path ──────────────────────────────────────────────────────────
    return create_fallback_response(matched_disease, question_type, info, language)


# Test
if __name__ == "__main__":
    print("🧪 Testing disease name matching...")
    test_inputs = ["aphid", "Aphid", "black rust", "yellow rust", "stem fly", "healthy", ""]
    for test in test_inputs:
        match = find_matching_disease(test)
        print(f"Input: '{test}' -> Match: '{match}'")
    print(f"\n✅ Total diseases in database: {len(ALL_DISEASE_NAMES)}")

    # Test Telugu response
    print("\n🧪 Testing Telugu response...")
    reply = wheat_chatbot("మందు ఎప్పుడు వేయాలి?", "Black Rust", language="te")
    print(reply[:300])