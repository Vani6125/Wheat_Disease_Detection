import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS

# -------------------- TF MEMORY OPTIMIZATIONS (must be before tf import) --------------------
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'
os.environ['TF_NUM_INTRAOP_THREADS'] = '1'
os.environ['TF_NUM_INTEROP_THREADS'] = '1'

import tensorflow as tf

# Limit TF thread usage to reduce RAM on single-core free tier
tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

import numpy as np
from PIL import Image
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import hashlib
from dotenv import load_dotenv
from sqlalchemy import func
from flask import send_file
from reportlab.lib.pagesizes import A4, letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.lib.units import inch
from chatbot import wheat_chatbot
import tempfile
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pickle
import pandas as pd

load_dotenv()

# -------------------- APP SETUP --------------------
app = Flask(__name__)
CORS(app)

# -------------------- DATABASE SETUP --------------------
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql://{os.getenv('DB_USER')}:"
    f"{os.getenv('DB_PASSWORD')}@"
    f"{os.getenv('DB_HOST')}:"
    f"{os.getenv('DB_PORT')}/"
    f"{os.getenv('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -------------------- DATABASE MODELS --------------------
class Client(db.Model):
    __tablename__ = 'clients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20))

class DiseasePrediction(db.Model):
    __tablename__ = 'disease_predictions'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'))
    disease_name = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float)
    predicted_at = db.Column(db.DateTime, default=datetime.utcnow)
    client = db.relationship('Client', backref='predictions')

class ClientStats(db.Model):
    __tablename__ = 'client_stats'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), unique=True)
    total_scans = db.Column(db.Integer, default=0)
    diseases_detected = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    client = db.relationship('Client', backref='stats')

with app.app_context():
    db.create_all()
    if not Client.query.first():
        default_client = Client(name="Default Farmer", phone="1234567890")
        db.session.add(default_client)
        db.session.commit()
        default_stats = ClientStats(client_id=default_client.id)
        db.session.add(default_stats)
        db.session.commit()

# -------------------- PATHS --------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "trained_model_efficientnet_b0.h5")

# -------------------- LAZY MODEL LOADING --------------------
# Models are NOT loaded at startup to prevent OOM segfault on 1GB RAM instances.
# They are loaded on first use and cached globally.
_model = None
_fertilizer_model = None

def get_model():
    global _model
    if _model is None:
        try:
            print("Loading TF model...")
            _model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            _model = None
    return _model

def get_fertilizer_model():
    global _fertilizer_model
    if _fertilizer_model is None:
        fertilizer_model_path = os.path.join(BASE_DIR, "fertilizer_recommendation_model.pkl")
        try:
            with open(fertilizer_model_path, "rb") as f:
                _fertilizer_model = pickle.load(f)
            print("✅ Fertilizer model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading fertilizer model: {e}")
            _fertilizer_model = None
    return _fertilizer_model

# -------------------- CLASS NAMES --------------------
CLASS_NAMES = [
    "Aphid", "Black Rust", "Blast", "Brown Rust", "Common Root Rot",
    "Fusarium Head Blight", "Healthy", "Leaf Blight", "Mildew", "Mite",
    "Septoria", "Smut", "Stem fly", "Tan spot", "Yellow Rust"
]

# -------------------- DISEASE SEVERITY --------------------
SEVERITY_MAP = {
    "Aphid": 3, "Black Rust": 3, "Blast": 3, "Brown Rust": 3,
    "Common Root Rot": 2, "Fusarium Head Blight": 3, "Healthy": 0,
    "Leaf Blight": 2, "Mildew": 2, "Mite": 2, "Septoria": 2,
    "Smut": 3, "Stem fly": 2, "Tan spot": 2, "Yellow Rust": 3,
    "Other Disease": 2
}

# -------------------- REMEDY MAPS --------------------
REMEDY_MAP_EN = {
    "Aphid": [
        "Spray Imidacloprid 17.8% SL @ 0.3 ml per litre of water.",
        "Alternatively use Thiamethoxam 25 WG @ 0.2 g per litre.",
        "Encourage natural predators such as lady beetles.",
        "Avoid excessive nitrogen fertilization which attracts aphids.",
        "Regularly monitor the underside of leaves for infestation.",
        "Use yellow sticky traps to monitor aphid population."
    ],
    "Black Rust": [
        "Spray Propiconazole 25 EC @ 1 ml per litre of water.",
        "Apply Tebuconazole 250 EC @ 1 ml per litre if infection spreads.",
        "Remove and destroy infected crop residues after harvest.",
        "Avoid excessive nitrogen fertilizer application.",
        "Plant rust-resistant wheat varieties recommended by local agricultural institutes."
    ],
    "Blast": [
        "Apply Tricyclazole 75 WP @ 0.6 g per litre of water.",
        "Spray Carbendazim 50 WP @ 1 g per litre during early infection.",
        "Avoid high nitrogen fertilization which promotes blast disease.",
        "Maintain proper spacing to improve airflow.",
        "Remove infected plant residues and burn them."
    ],
    "Brown Rust": [
        "Spray Mancozeb 75 WP @ 2 g per litre of water.",
        "Use Propiconazole 25 EC @ 1 ml per litre during severe infection.",
        "Ensure proper field ventilation by maintaining recommended plant spacing.",
        "Use resistant wheat cultivars recommended by agricultural universities.",
        "Monitor weather conditions since rust spreads rapidly in humid climates."
    ],
    "Common Root Rot": [
        "Treat seeds with Carbendazim 2 g per kg seed before sowing.",
        "Apply Trichoderma bio-fungicide to soil to suppress pathogen growth.",
        "Ensure good drainage and avoid waterlogged conditions.",
        "Practice crop rotation with non-cereal crops.",
        "Maintain balanced soil nutrition with adequate potassium."
    ],
    "Fusarium Head Blight": [
        "Spray Tebuconazole 250 EC @ 1 ml per litre at flowering stage.",
        "Avoid overhead irrigation during flowering period.",
        "Use certified disease-free seeds.",
        "Rotate crops with legumes or oilseeds.",
        "Remove infected crop residues from field."
    ],
    "Healthy": [
        "Maintain balanced fertilization based on soil test recommendations.",
        "Apply preventive fungicide sprays during high humidity conditions.",
        "Practice crop rotation to reduce disease pressure.",
        "Regularly monitor crops for early signs of pests or diseases.",
        "Ensure proper irrigation and drainage."
    ],
    "Leaf Blight": [
        "Spray Mancozeb 75 WP @ 2 g per litre of water.",
        "Apply Chlorothalonil 75 WP @ 2 g per litre if disease persists.",
        "Avoid planting wheat after maize to reduce pathogen carryover.",
        "Ensure proper field drainage.",
        "Use resistant wheat varieties recommended for the region."
    ],
    "Mildew": [
        "Spray Sulfur 80 WP @ 2 g per litre of water.",
        "Alternatively use Hexaconazole 5 EC @ 1 ml per litre.",
        "Avoid excessive nitrogen fertilization.",
        "Ensure proper spacing to improve airflow.",
        "Remove infected leaves early to reduce spread."
    ],
    "Mite": [
        "Spray Dicofol 18.5 EC @ 2.5 ml per litre of water.",
        "Alternatively use Abamectin 1.9 EC @ 0.5 ml per litre.",
        "Remove heavily infested leaves.",
        "Maintain field sanitation.",
        "Encourage natural predators such as predatory mites."
    ],
    "Septoria": [
        "Spray Azoxystrobin 250 SC @ 1 ml per litre of water.",
        "Apply Propiconazole 25 EC @ 1 ml per litre if disease spreads.",
        "Use certified disease-free seeds.",
        "Avoid late sowing which increases disease risk.",
        "Ensure proper irrigation management."
    ],
    "Smut": [
        "Treat seeds with Carboxin 75 WP @ 2 g per kg seed.",
        "Use certified treated seeds for sowing.",
        "Practice crop rotation to reduce pathogen survival.",
        "Remove infected plants before spores spread.",
        "Avoid saving seeds from infected fields."
    ],
    "Stem fly": [
        "Spray Chlorpyrifos 20 EC @ 2 ml per litre of water.",
        "Apply Imidacloprid 17.8 SL @ 0.3 ml per litre if infestation increases.",
        "Maintain recommended plant spacing.",
        "Remove infected plants to prevent spread.",
        "Avoid excessive nitrogen fertilization."
    ],
    "Tan spot": [
        "Spray Propiconazole 25 EC @ 1 ml per litre of water.",
        "Apply Mancozeb 75 WP @ 2 g per litre as preventive spray.",
        "Rotate crops with non-host crops such as legumes.",
        "Remove infected plant residues from the field.",
        "Use resistant wheat varieties."
    ],
    "Yellow Rust": [
        "Spray Tebuconazole 250 EC @ 1 ml per litre of water.",
        "Apply Propiconazole 25 EC @ 1 ml per litre during early infection.",
        "Use resistant wheat varieties recommended for your region.",
        "Monitor fields regularly during cool and humid weather.",
        "Avoid excessive nitrogen fertilization."
    ],
    "Other Disease": [
        "Consult a local agricultural expert or extension officer.",
        "Conduct soil and leaf analysis to identify nutrient deficiencies.",
        "Apply broad-spectrum fungicide such as Mancozeb @ 2 g per litre.",
        "Maintain proper crop hygiene and remove infected plants.",
        "Monitor crop health regularly and take preventive measures."
    ]
}

REMEDY_MAP_TE = {
    "Aphid": [
        "నీటిలో లీటరుకు 0.3 ml చొప్పున Imidacloprid 17.8% SL పిచికారి చేయండి.",
        "ప్రత్యామ్నాయంగా లీటరుకు 0.2 g చొప్పున Thiamethoxam 25 WG ఉపయోగించండి.",
        "లేడీ బీటిల్స్ వంటి సహజ శత్రువులను ప్రోత్సహించండి.",
        "చీడపీడలను ఆకర్షించే అధిక నత్రజని ఎరువులను నివారించండి.",
        "చీడపీడల సోకుకోసం ఆకుల అడుగు భాగాన్ని క్రమం తప్పకుండా తనిఖీ చేయండి.",
        "చీడపీడల జనాభాను పర్యవేక్షించడానికి పసుపు జిగురు ఉచ్చులు ఉపయోగించండి."
    ],
    "Black Rust": [
        "నీటిలో లీటరుకు 1 ml చొప్పున Propiconazole 25 EC పిచికారి చేయండి.",
        "సోకు వ్యాపిస్తే లీటరుకు 1 ml చొప్పున Tebuconazole 250 EC వేయండి.",
        "పంట కోత తర్వాత సోకిన పంట అవశేషాలను తొలగించి నాశనం చేయండి.",
        "అధిక నత్రజని ఎరువుల వినియోగాన్ని నివారించండి.",
        "స్థానిక వ్యవసాయ సంస్థలు సిఫార్సు చేసిన తుప్పు-నిరోధక గోధుమ రకాలు నాటండి."
    ],
    "Blast": [
        "నీటిలో లీటరుకు 0.6 g చొప్పున Tricyclazole 75 WP వేయండి.",
        "ప్రారంభ సోకు సమయంలో లీటరుకు 1 g చొప్పున Carbendazim 50 WP పిచికారి చేయండి.",
        "బ్లాస్ట్ వ్యాధిని పెంచే అధిక నత్రజని ఎరువులను నివారించండి.",
        "గాలి ప్రవాహాన్ని మెరుగుపరచడానికి సరైన అంతరం నిర్వహించండి.",
        "సోకిన మొక్కల అవశేషాలను తొలగించి తగలబెట్టండి."
    ],
    "Brown Rust": [
        "నీటిలో లీటరుకు 2 g చొప్పున Mancozeb 75 WP పిచికారి చేయండి.",
        "తీవ్రమైన సోకు సమయంలో లీటరుకు 1 ml చొప్పున Propiconazole 25 EC ఉపయోగించండి.",
        "సిఫార్సు చేసిన మొక్కల అంతరాన్ని నిర్వహించడం ద్వారా సరైన పొలం వాయుసంచారాన్ని నిర్ధారించండి.",
        "వ్యవసాయ విశ్వవిద్యాలయాలు సిఫార్సు చేసిన నిరోధక గోధుమ రకాలు ఉపయోగించండి.",
        "తేమగల వాతావరణంలో తుప్పు వేగంగా వ్యాపిస్తుంది కనుక వాతావరణాన్ని పర్యవేక్షించండి."
    ],
    "Common Root Rot": [
        "విత్తనాలు వేయడానికి ముందు కిలో విత్తనానికి 2 g చొప్పున Carbendazim తో విత్తన శుద్ధి చేయండి.",
        "వ్యాధికారక పెరుగుదలను అణచివేయడానికి నేలకు Trichoderma జీవ శిలీంద్రనాశని వేయండి.",
        "మంచి నీరు పారుదలను నిర్ధారించి నీరు నిల్వపడే పరిస్థితులను నివారించండి.",
        "ధాన్యేతర పంటలతో పంట మార్పిడి చేయండి.",
        "తగిన పొటాషియంతో సమతుల్య నేల పోషణను నిర్వహించండి."
    ],
    "Fusarium Head Blight": [
        "పూత దశలో లీటరుకు 1 ml చొప్పున Tebuconazole 250 EC పిచికారి చేయండి.",
        "పూత కాలంలో తలపై నీటిపారుదలను నివారించండి.",
        "ధృవీకరించిన వ్యాధి-రహిత విత్తనాలు ఉపయోగించండి.",
        "పప్పు ధాన్యాలు లేదా నూనె గింజలతో పంట మార్పిడి చేయండి.",
        "సోకిన పంట అవశేషాలను పొలం నుండి తొలగించండి."
    ],
    "Healthy": [
        "నేల పరీక్ష సిఫార్సుల ఆధారంగా సమతుల్య ఎరువులు నిర్వహించండి.",
        "అధిక తేమ పరిస్థితులలో నివారణ శిలీంద్రనాశని పిచికారి వేయండి.",
        "వ్యాధి ఒత్తిడిని తగ్గించడానికి పంట మార్పిడి చేయండి.",
        "చీడపీడలు లేదా వ్యాధుల ముందస్తు సంకేతాల కోసం పంటలను క్రమం తప్పకుండా పర్యవేక్షించండి.",
        "సరైన నీటిపారుదల మరియు నీరు పారిపోవడాన్ని నిర్ధారించండి."
    ],
    "Leaf Blight": [
        "నీటిలో లీటరుకు 2 g చొప్పున Mancozeb 75 WP పిచికారి చేయండి.",
        "వ్యాధి కొనసాగితే లీటరుకు 2 g చొప్పున Chlorothalonil 75 WP వేయండి.",
        "వ్యాధికారక సంక్రమణను తగ్గించడానికి మొక్కజొన్న తర్వాత గోధుమ నాటడం నివారించండి.",
        "సరైన పొలం నీరు పారుదలను నిర్ధారించండి.",
        "ప్రాంతంలో సిఫార్సు చేసిన నిరోధక గోధుమ రకాలు ఉపయోగించండి."
    ],
    "Mildew": [
        "నీటిలో లీటరుకు 2 g చొప్పున Sulfur 80 WP పిచికారి చేయండి.",
        "ప్రత్యామ్నాయంగా లీటరుకు 1 ml చొప్పున Hexaconazole 5 EC ఉపయోగించండి.",
        "అధిక నత్రజని ఎరువులను నివారించండి.",
        "గాలి ప్రవాహాన్ని మెరుగుపరచడానికి సరైన అంతరాన్ని నిర్ధారించండి.",
        "వ్యాపించకుండా ముందుగా సోకిన ఆకులను తొలగించండి."
    ],
    "Mite": [
        "నీటిలో లీటరుకు 2.5 ml చొప్పున Dicofol 18.5 EC పిచికారి చేయండి.",
        "ప్రత్యామ్నాయంగా లీటరుకు 0.5 ml చొప్పున Abamectin 1.9 EC ఉపయోగించండి.",
        "భారంగా సోకిన ఆకులను తొలగించండి.",
        "పొలం పరిశుభ్రతను నిర్వహించండి.",
        "వేట పురుగులు వంటి సహజ శత్రువులను ప్రోత్సహించండి."
    ],
    "Septoria": [
        "నీటిలో లీటరుకు 1 ml చొప్పున Azoxystrobin 250 SC పిచికారి చేయండి.",
        "వ్యాధి వ్యాపిస్తే లీటరుకు 1 ml చొప్పున Propiconazole 25 EC వేయండి.",
        "ధృవీకరించిన వ్యాధి-రహిత విత్తనాలు ఉపయోగించండి.",
        "వ్యాధి ప్రమాదాన్ని పెంచే ఆలస్యంగా విత్తడాన్ని నివారించండి.",
        "సరైన నీటిపారుదల నిర్వహణను నిర్ధారించండి."
    ],
    "Smut": [
        "కిలో విత్తనానికి 2 g చొప్పున Carboxin 75 WP తో విత్తన శుద్ధి చేయండి.",
        "విత్తనానికి ధృవీకరించిన శుద్ధి చేసిన విత్తనాలు ఉపయోగించండి.",
        "వ్యాధికారక మనుగడను తగ్గించడానికి పంట మార్పిడి చేయండి.",
        "బీజాంశం వ్యాపించే ముందు సోకిన మొక్కలను తొలగించండి.",
        "సోకిన పొలాల నుండి విత్తనాలు నిల్వ చేయడం నివారించండి."
    ],
    "Stem fly": [
        "నీటిలో లీటరుకు 2 ml చొప్పున Chlorpyrifos 20 EC పిచికారి చేయండి.",
        "చీడపీడలు పెరిగితే లీటరుకు 0.3 ml చొప్పున Imidacloprid 17.8 SL వేయండి.",
        "సిఫార్సు చేసిన మొక్కల అంతరాన్ని నిర్వహించండి.",
        "వ్యాపించకుండా సోకిన మొక్కలను తొలగించండి.",
        "అధిక నత్రజని ఎరువులను నివారించండి."
    ],
    "Tan spot": [
        "నీటిలో లీటరుకు 1 ml చొప్పున Propiconazole 25 EC పిచికారి చేయండి.",
        "నివారణ పిచికారిగా లీటరుకు 2 g చొప్పున Mancozeb 75 WP వేయండి.",
        "పప్పు ధాన్యాలు వంటి ఆతిథ్య రహిత పంటలతో పంట మార్పిడి చేయండి.",
        "పొలం నుండి సోకిన మొక్కల అవశేషాలను తొలగించండి.",
        "నిరోధక గోధుమ రకాలు ఉపయోగించండి."
    ],
    "Yellow Rust": [
        "నీటిలో లీటరుకు 1 ml చొప్పున Tebuconazole 250 EC పిచికారి చేయండి.",
        "ప్రారంభ సోకు సమయంలో లీటరుకు 1 ml చొప్పున Propiconazole 25 EC వేయండి.",
        "మీ ప్రాంతంలో సిఫార్సు చేసిన నిరోధక గోధుమ రకాలు ఉపయోగించండి.",
        "చల్లని మరియు తేమగల వాతావరణంలో పొలాలను క్రమం తప్పకుండా పర్యవేక్షించండి.",
        "అధిక నత్రజని ఎరువులను నివారించండి."
    ],
    "Other Disease": [
        "స్థానిక వ్యవసాయ నిపుణులు లేదా విస్తరణ అధికారిని సంప్రదించండి.",
        "పోషక లోపాలను గుర్తించడానికి నేల మరియు ఆకు విశ్లేషణ నిర్వహించండి.",
        "లీటరుకు 2 g చొప్పున Mancozeb వంటి విస్తృత-స్పెక్ట్రమ్ శిలీంద్రనాశని వేయండి.",
        "సరైన పంట పరిశుభ్రతను నిర్వహించి సోకిన మొక్కలను తొలగించండి.",
        "పంట ఆరోగ్యాన్ని క్రమం తప్పకుండా పర్యవేక్షించి నివారణ చర్యలు తీసుకోండి."
    ]
}

# -------------------- FERTILIZER INFO - ENGLISH --------------------
FERTILIZER_INFO_EN = {
    'Urea': {
        'npk': '46-0-0',
        'description': 'High nitrogen content, excellent for vegetative growth',
        'usage': 'Apply during early growth stages'
    },
    'DAP': {
        'npk': '18-46-0',
        'description': 'High phosphorus, promotes root development',
        'usage': 'Apply at sowing time'
    },
    'TSP': {
        'npk': '0-46-0',
        'description': 'Triple superphosphate, concentrated phosphorus',
        'usage': 'Apply during soil preparation'
    },
    '10-26-26': {
        'npk': '10-26-26',
        'description': 'Balanced NPK with higher P and K',
        'usage': 'Suitable for flowering and fruiting stages'
    },
    '14-35-14': {
        'npk': '14-35-14',
        'description': 'Phosphorus-rich balanced fertilizer',
        'usage': 'Apply during flowering stage'
    },
    '17-17-17': {
        'npk': '17-17-17',
        'description': 'Balanced NPK for all-round nutrition',
        'usage': 'Apply throughout growth cycle'
    },
    '20-20': {
        'npk': '20-20-0',
        'description': 'Balanced N-P fertilizer',
        'usage': 'Apply during early to mid growth'
    },
    '28-28': {
        'npk': '28-28-0',
        'description': 'High nitrogen and phosphorus',
        'usage': 'Apply for rapid growth'
    },
    'Potassium chloride': {
        'npk': '0-0-60',
        'description': 'High potassium, enhances disease resistance',
        'usage': 'Apply during fruiting stage'
    },
    'Potassium sulfate.': {
        'npk': '0-0-50',
        'description': 'Sulfate form of potassium, chloride-free',
        'usage': 'Suitable for chloride-sensitive crops'
    }
}

# -------------------- FERTILIZER INFO - TELUGU --------------------
FERTILIZER_INFO_TE = {
    'Urea': {
        'npk': '46-0-0',
        'description': 'అధిక నత్రజని పరిమాణం, సస్యవృద్ధికి అద్భుతంగా పనిచేస్తుంది',
        'usage': 'ప్రారంభ వృద్ధి దశలలో వేయండి'
    },
    'DAP': {
        'npk': '18-46-0',
        'description': 'అధిక భాస్వరం, వేరు అభివృద్ధిని ప్రోత్సహిస్తుంది',
        'usage': 'విత్తన సమయంలో వేయండి'
    },
    'TSP': {
        'npk': '0-46-0',
        'description': 'ట్రిపుల్ సూపర్‌ఫాస్ఫేట్, కేంద్రీకృత భాస్వరం',
        'usage': 'నేల తయారీ సమయంలో వేయండి'
    },
    '10-26-26': {
        'npk': '10-26-26',
        'description': 'అధిక P మరియు K తో సమతుల్య NPK',
        'usage': 'పూత మరియు కాయ దశలకు అనుకూలం'
    },
    '14-35-14': {
        'npk': '14-35-14',
        'description': 'భాస్వరం అధికంగా ఉన్న సమతుల్య ఎరువు',
        'usage': 'పూత దశలో వేయండి'
    },
    '17-17-17': {
        'npk': '17-17-17',
        'description': 'సర్వాంగీణ పోషణకు సమతుల్య NPK',
        'usage': 'మొత్తం వృద్ధి చక్రంలో వేయండి'
    },
    '20-20': {
        'npk': '20-20-0',
        'description': 'సమతుల్య N-P ఎరువు',
        'usage': 'ప్రారంభ నుండి మధ్య వృద్ధి సమయంలో వేయండి'
    },
    '28-28': {
        'npk': '28-28-0',
        'description': 'అధిక నత్రజని మరియు భాస్వరం',
        'usage': 'వేగంగా వృద్ధి చెందడానికి వేయండి'
    },
    'Potassium chloride': {
        'npk': '0-0-60',
        'description': 'అధిక పొటాషియం, వ్యాధి నిరోధకతను పెంచుతుంది',
        'usage': 'కాయ దశలో వేయండి'
    },
    'Potassium sulfate.': {
        'npk': '0-0-50',
        'description': 'పొటాషియం యొక్క సల్ఫేట్ రూపం, క్లోరైడ్-రహితం',
        'usage': 'క్లోరైడ్-సున్నిత పంటలకు అనుకూలం'
    }
}

REMEDY_MAP = REMEDY_MAP_EN  # alias for PDF (always English)

def get_remedy_map(language="en"):
    return REMEDY_MAP_TE if language == "te" else REMEDY_MAP_EN

def get_fertilizer_info(language="en"):
    return FERTILIZER_INFO_TE if language == "te" else FERTILIZER_INFO_EN

IMG_SIZE = 224

# -------------------- IMAGE PREPROCESSING --------------------
def preprocess_image(image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image)
    image = tf.keras.applications.efficientnet.preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image

# -------------------- HELPER FUNCTION --------------------
def update_client_stats(client_id, is_disease):
    client_id = int(client_id)
    stats = ClientStats.query.filter_by(client_id=client_id).first()
    if not stats:
        stats = ClientStats(client_id=client_id, total_scans=0, diseases_detected=0)
        db.session.add(stats)
    stats.total_scans += 1
    if is_disease:
        stats.diseases_detected += 1
    stats.last_updated = datetime.utcnow()

# -------------------- PREDICTION API --------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files["file"]
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' not in file.filename or file.filename.split('.')[-1].lower() not in allowed_extensions:
        return jsonify({"error": "Invalid file type. Allowed: PNG, JPG, JPEG, GIF"}), 400
    client_id = request.form.get("client_id")
    if not client_id:
        return jsonify({"error": "client_id is required"}), 400
    try:
        client_id = int(client_id)
    except ValueError:
        return jsonify({"error": "Invalid client_id"}), 400
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404
    language = request.form.get("language", "en")
    if language not in ("en", "te"):
        language = "en"
    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        if image is None:
            return jsonify({"error": "Invalid image file"}), 400
        model = get_model()  # lazy load
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        img = preprocess_image(image)
        predictions = model.predict(img, verbose=0)
        class_index = np.argmax(predictions)
        predicted_disease = CLASS_NAMES[class_index]
        CONFIDENCE_THRESHOLD = 60.0
        confidence = float(np.max(predictions)) * 100
        if confidence < CONFIDENCE_THRESHOLD:
            predicted_disease = "Other Disease"
        severity = SEVERITY_MAP.get(predicted_disease, SEVERITY_MAP["Other Disease"])
        MAX_SEVERITY = 3
        risk_level = round((confidence / 100) * (severity / MAX_SEVERITY) * 100, 2)
        remedy_map = get_remedy_map(language)
        remedies = remedy_map.get(predicted_disease, remedy_map["Other Disease"])
        prediction_record = DiseasePrediction(
            client_id=client_id, disease_name=predicted_disease, confidence=confidence,
        )
        db.session.add(prediction_record)
        is_disease = predicted_disease != "Healthy"
        update_client_stats(client_id, is_disease)
        db.session.commit()
        return jsonify({
            "success": True, "diseaseName": predicted_disease,
            "confidenceLevel": round(confidence, 2), "riskLevel": risk_level,
            "remedies": remedies, "clientId": client_id, "clientName": client.name
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# -------------------- WEEKLY DASHBOARD API --------------------
@app.route("/weekly-dashboard/<int:client_id>", methods=["GET"])
def weekly_dashboard(client_id):
    try:
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        predictions = DiseasePrediction.query.filter(
            DiseasePrediction.client_id == client_id,
            DiseasePrediction.predicted_at >= one_week_ago
        ).all()
        dashboard = {}
        for p in predictions:
            dashboard[p.disease_name] = dashboard.get(p.disease_name, 0) + 1
        return jsonify(dashboard)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- DASHBOARD STATISTICS API --------------------
@app.route("/dashboard-stats/<int:client_id>", methods=["GET"])
def dashboard_stats(client_id):
    try:
        stats = ClientStats.query.filter_by(client_id=client_id).first()
        if not stats:
            stats = ClientStats(client_id=client_id, total_scans=0, diseases_detected=0)
            db.session.add(stats)
            db.session.commit()
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_predictions = DiseasePrediction.query.filter(
            DiseasePrediction.client_id == client_id,
            DiseasePrediction.predicted_at >= one_week_ago
        ).all()
        avg_confidence = sum(p.confidence for p in weekly_predictions) / len(weekly_predictions) if weekly_predictions else 0
        health_index = ((stats.total_scans - stats.diseases_detected) / stats.total_scans * 100) if stats.total_scans > 0 else 100
        avg_risk = sum((p.confidence * SEVERITY_MAP.get(p.disease_name, 50)) / 100 for p in weekly_predictions) / len(weekly_predictions) if weekly_predictions else 0
        high_confidence_count = sum(1 for p in weekly_predictions if p.confidence >= 85)
        success_rate = (high_confidence_count / len(weekly_predictions) * 100) if weekly_predictions else 0
        return jsonify({
            "totalScans": stats.total_scans, "diseasesDetected": stats.diseases_detected,
            "avgConfidence": round(avg_confidence, 2), "healthIndex": round(health_index, 2),
            "avgRiskLevel": round(avg_risk, 2), "successRate": round(success_rate, 2),
            "fieldsMonitored": 2
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- PDF REPORT GENERATION --------------------
@app.route("/download-report/<int:client_id>", methods=["GET"])
def download_report(client_id):
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404
    stats = ClientStats.query.filter_by(client_id=client_id).first()
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_data = db.session.query(
        DiseasePrediction.disease_name, func.count(DiseasePrediction.id).label('count')
    ).filter(
        DiseasePrediction.client_id == client_id,
        DiseasePrediction.predicted_at >= one_week_ago
    ).group_by(DiseasePrediction.disease_name).all()
    chart_path = None
    if weekly_data:
        diseases = [d[0] for d in weekly_data]
        counts = [d[1] for d in weekly_data]
        temp_dir = tempfile.gettempdir()
        chart_path = os.path.join(temp_dir, f"weekly_chart_{client_id}.png")
        plt.figure(figsize=(8, 5))
        colors_list = ['#4CAF50' if d == 'Healthy' else '#FF6B6B' for d in diseases]
        plt.bar(diseases, counts, color=colors_list, edgecolor='black', linewidth=1.2)
        plt.xlabel('Disease Type', fontsize=12, fontweight='bold')
        plt.ylabel('Number of Cases', fontsize=12, fontweight='bold')
        plt.title('Weekly Disease Distribution', fontsize=14, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()
        plt.savefig(chart_path, dpi=150)
        plt.close()
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf = canvas.Canvas(temp_file.name, pagesize=letter)
    width, height = letter
    pdf.setFillColor(colors.HexColor('#2E7D32'))
    pdf.rect(0, height - 100, width, 100, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawCentredString(width/2, height - 50, "Wheat Disease Detection Report")
    pdf.setFont("Helvetica", 12)
    pdf.drawCentredString(width/2, height - 75, f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
    y = height - 140
    pdf.setFillColor(colors.HexColor('#E8F5E9'))
    pdf.rect(40, y - 80, width - 80, 80, fill=1, stroke=1)
    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(60, y - 25, "Client Information")
    pdf.setFont("Helvetica", 11)
    pdf.drawString(60, y - 45, f"Name: {client.name}")
    pdf.drawString(60, y - 62, f"Phone: {client.phone}")
    pdf.drawString(300, y - 45, f"Client ID: {client.id}")
    pdf.drawString(300, y - 62, f"Report Period: Last 7 days")
    y -= 120
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(40, y, "Statistics Summary")
    y -= 25
    stats_data = [
        ['Metric', 'Value'],
        ['Total Scans', str(stats.total_scans if stats else 0)],
        ['Diseases Detected', str(stats.diseases_detected if stats else 0)],
        ['Healthy Scans', str((stats.total_scans - stats.diseases_detected) if stats else 0)],
        ['Health Index', f"{round(((stats.total_scans - stats.diseases_detected) / stats.total_scans * 100) if stats and stats.total_scans > 0 else 100, 1)}%"]
    ]
    table = Table(stats_data, colWidths=[3*inch, 2*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4CAF50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F1F8E9')),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    table.wrapOn(pdf, width, height)
    table.drawOn(pdf, 40, y - 120)
    y -= 150
    if chart_path:
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(40, y, "Weekly Disease Distribution")
        y -= 15
        pdf.drawImage(chart_path, 60, y - 280, width=480, height=260, preserveAspectRatio=True)
        y -= 300
    pdf.showPage()
    y = height - 50
    pdf.setFillColor(colors.HexColor('#FF6B6B'))
    pdf.rect(0, y, width, 50, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawCentredString(width/2, y + 20, "Recommended Actions & Precautions")
    y -= 70
    pdf.setFillColor(colors.black)
    if weekly_data:
        for disease, count in weekly_data:
            if disease != "Healthy":
                pdf.setFont("Helvetica-Bold", 13)
                pdf.setFillColor(colors.HexColor('#C62828'))
                pdf.drawString(40, y, f"⚠ {disease} ({count} case{'s' if count > 1 else ''})")
                y -= 20
                pdf.setFillColor(colors.black)
                pdf.setFont("Helvetica-Bold", 11)
                pdf.drawString(60, y, "Recommended Remedies:")
                y -= 15
                remedies = REMEDY_MAP_EN.get(disease, REMEDY_MAP_EN["Other Disease"])
                pdf.setFont("Helvetica", 10)
                for i, remedy in enumerate(remedies, 1):
                    pdf.drawString(75, y, f"{i}. {remedy}")
                    y -= 15
                y -= 10
                if y < 100:
                    pdf.showPage()
                    y = height - 50
    if y < 200:
        pdf.showPage()
        y = height - 50
    pdf.setFont("Helvetica-Bold", 14)
    pdf.setFillColor(colors.HexColor('#1976D2'))
    pdf.drawString(40, y, "General Preventive Measures")
    y -= 25
    general_tips = [
        "Regular field monitoring and early disease detection",
        "Maintain optimal irrigation - avoid waterlogging",
        "Use disease-resistant wheat varieties when available",
        "Practice crop rotation to break disease cycles",
        "Remove and destroy infected plant debris promptly",
        "Ensure balanced fertilization - avoid excess nitrogen",
        "Maintain proper plant spacing for air circulation",
        "Use certified and treated seeds from reliable sources",
        "Keep farming equipment clean and sanitized",
        "Consult agricultural experts for severe infestations"
    ]
    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica", 10)
    for tip in general_tips:
        pdf.drawString(60, y, f"✓ {tip}")
        y -= 18
    pdf.setFont("Helvetica-Oblique", 9)
    pdf.setFillColor(colors.grey)
    pdf.drawCentredString(width/2, 30, "This report is generated by Wheat Disease Detection AI System")
    pdf.drawCentredString(width/2, 15, "For support, contact your agricultural advisor")
    pdf.save()
    if chart_path and os.path.exists(chart_path):
        os.remove(chart_path)
    return send_file(
        temp_file.name, as_attachment=True,
        download_name=f"wheat_disease_report_{client.name}_{datetime.now().strftime('%Y%m%d')}.pdf",
        mimetype="application/pdf"
    )

# -------------------- CHATBOT HELPERS --------------------
conversation_history = {}

def get_conversation_key(disease, remote_addr, client_id=""):
    base_str = f"{disease}_{remote_addr}_{client_id}"
    return hashlib.md5(base_str.encode()).hexdigest()[:16]

def analyze_question_intent(question):
    question_lower = question.lower()
    intents = {
        "symptoms": any(word in question_lower for word in ['symptom', 'look like', 'identify', 'recognize', 'లక్షణ', 'గుర్తించ']),
        "treatment": any(word in question_lower for word in ['treat', 'remedy', 'cure', 'spray', 'chemical', 'చికిత్స', 'మందు', 'పిచికారి']),
        "prevention": any(word in question_lower for word in ['prevent', 'avoid', 'stop', 'నివారించ']),
        "causes": any(word in question_lower for word in ['cause', 'why', 'reason', 'కారణ', 'ఎందుకు']),
        "severity": any(word in question_lower for word in ['severe', 'serious', 'dangerous', 'తీవ్రత']),
        "timing": any(word in question_lower for word in ['when', 'time', 'season', 'month', 'ఎప్పుడు', 'సమయ']),
        "cost": any(word in question_lower for word in ['cost', 'price', 'expensive', 'ధర']),
    }
    for intent, is_present in intents.items():
        if is_present:
            return intent
    return "general"

# -------------------- CHATBOT API --------------------
@app.route('/api/wheat-bot', methods=['POST'])
def wheat_bot_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        question = data.get('question', '').strip()
        disease = data.get('disease', '').strip()
        client_id = data.get('client_id', '')
        language = data.get('language', 'en')   # ✅ read language

        if not question:
            return jsonify({'error': 'Question is required'}), 400
        if not disease:
            return jsonify({'error': 'Disease name is required'}), 400
        if language not in ('en', 'te'):
            language = 'en'

        conv_key = get_conversation_key(disease, request.remote_addr, client_id)
        if conv_key not in conversation_history:
            conversation_history[conv_key] = {
                'disease': disease, 'language': language,
                'created_at': datetime.now().isoformat(),
                'messages': [], 'question_types': []
            }
        history = conversation_history[conv_key]
        history['language'] = language

        intent = analyze_question_intent(question)
        history['question_types'].append(intent)

        recent_intents = history['question_types'][-3:]
        if recent_intents.count(intent) > 1:
            question = f"{question} (Please provide different aspects from previous answers)"

        history['messages'].append({
            'role': 'user', 'content': question,
            'intent': intent, 'timestamp': datetime.now().isoformat()
        })

        # ✅ Pass language to chatbot
        reply = wheat_chatbot(question, disease, language=language)

        history['messages'].append({
            'role': 'assistant', 'content': reply,
            'timestamp': datetime.now().isoformat()
        })

        if len(history['messages']) > 20:
            history['messages'] = history['messages'][-20:]
        if len(history['question_types']) > 10:
            history['question_types'] = history['question_types'][-10:]
        conversation_history[conv_key] = history

        return jsonify({
            'reply': reply, 'disease': disease, 'language': language,
            'conversation_id': conv_key,
            'message_count': len(history['messages']),
            'current_intent': intent, 'success': True,
            'suggestions': get_suggestions_based_on_intent(intent, disease, language)
        })
    except Exception as e:
        print(f"❌ Error in wheat-bot endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error', 'message': str(e), 'success': False}), 500


def get_suggestions_based_on_intent(intent, disease, language="en"):
    if language == "te":
        suggestions = {
            "symptoms": [f"{disease} లక్షణాలు ఎంత వేగంగా కనిపిస్తాయి?", f"{disease}లో మొదట ఏ మొక్క భాగాలు ప్రభావితమవుతాయి?", f"{disease}ని ఇతర వ్యాధుల నుండి గుర్తించడం ఎలా?"],
            "treatment": [f"{disease}కి అత్యంత తక్కువ ఖర్చుతో కూడిన చికిత్స ఏమిటి?", f"{disease}కి సేంద్రియ చికిత్స ఏమైనా ఉందా?", f"{disease}కి మందు ఎంత తరచుగా వేయాలి?"],
            "prevention": [f"{disease}కి వ్యతిరేకంగా ఉత్తమ నిరోధక రకాలు ఏమిటి?", f"వచ్చే సీజన్‌లో {disease} ఎలా నివారించాలి?", f"{disease} నివారించడంలో ఏ సాంస్కృతిక పద్ధతులు సహాయపడతాయి?"],
            "general": [f"{disease} వ్యాపించడానికి ఏమి కారణమవుతుంది?", f"{disease} తీవ్రత ఎంత?", f"{disease} వల్ల ఆర్థిక నష్టం ఎంత?"]
        }
    else:
        suggestions = {
            "symptoms": [f"How quickly do symptoms of {disease} appear?", f"What parts of the plant show symptoms first in {disease}?", f"Can {disease} be confused with other diseases?"],
            "treatment": [f"What's the most cost-effective treatment for {disease}?", f"Are there organic options for treating {disease}?", f"How often should I apply treatment for {disease}?"],
            "prevention": [f"What are the best resistant varieties against {disease}?", f"How can I prevent {disease} in the next season?", f"What cultural practices help prevent {disease}?"],
            "general": [f"What causes {disease} to spread?", f"How severe is {disease} compared to other wheat diseases?", f"What's the economic impact of {disease}?"]
        }
    return suggestions.get(intent, suggestions["general"])


@app.route('/api/chat-history/<conversation_id>', methods=['GET'])
def get_chat_history(conversation_id):
    history = conversation_history.get(conversation_id)
    if not history:
        return jsonify({'error': 'Conversation not found'}), 404
    return jsonify({
        'history': history['messages'], 'disease': history['disease'],
        'language': history.get('language', 'en'),
        'created_at': history['created_at'], 'question_types': history['question_types']
    })


@app.route('/api/suggest-questions/<disease>', methods=['GET'])
def suggest_questions(disease):
    language = request.args.get('language', 'en')
    if language == "te":
        questions = {
            "symptoms": [f"{disease} మొదటి సంకేతాలు ఏమిటి?", f"ప్రారంభ దశలో {disease}ని ఎలా గుర్తించాలి?", f"ఆకులపై {disease} లక్షణాలు ఎలా ఉంటాయి?"],
            "treatment": [f"{disease}కి ఉత్తమ రసాయనం ఏమిటి?", f"{disease}కి గృహ నివారణలు ఉన్నాయా?", f"{disease}కి చికిత్స చేయడానికి ఉత్తమ సమయం ఏది?"],
            "prevention": [f"{disease}ని సహజంగా ఎలా నివారించాలి?", f"{disease} ప్రమాదాన్ని తగ్గించే వ్యవసాయ పద్ధతులు ఏమిటి?", f"{disease} నిరోధక గోధుమ రకాలు ఉన్నాయా?"],
            "impact": [f"{disease} వల్ల ఎంత దిగుబడి నష్టం జరుగుతుంది?", f"{disease} ధాన్యపు నాణ్యతను ప్రభావితం చేస్తుందా?", f"{disease} ఇతర పంటలకు వ్యాపిస్తుందా?"]
        }
    else:
        questions = {
            "symptoms": [f"What are the first signs of {disease}?", f"How to identify {disease} in early stages?", f"What do {disease} symptoms look like on leaves?"],
            "treatment": [f"What's the best chemical for {disease}?", f"Are there home remedies for {disease}?", f"When is the best time to treat {disease}?"],
            "prevention": [f"How to prevent {disease} naturally?", f"What farming practices reduce {disease} risk?", f"Are there {disease}-resistant wheat varieties?"],
            "impact": [f"How much yield loss does {disease} cause?", f"Can {disease} affect grain quality?", f"Is {disease} contagious to other crops?"]
        }
    return jsonify(questions)


# -------------------- FERTILIZER API --------------------
@app.route("/predict-fertilizer", methods=["POST"])
def predict_fertilizer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        required_fields = ['temperature', 'humidity', 'moisture', 'soilType',
                           'cropType', 'nitrogen', 'potassium', 'phosphorous']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400
        fertilizer_model = get_fertilizer_model()  # lazy load
        if fertilizer_model is None:
            return jsonify({"error": "Fertilizer model not loaded"}), 500
        try:
            temperature = float(data['temperature'])
            humidity = float(data['humidity'])
            moisture = float(data['moisture'])
            nitrogen = float(data['nitrogen'])
            potassium = float(data['potassium'])
            phosphorous = float(data['phosphorous'])
        except ValueError:
            return jsonify({"error": "Numeric fields must be valid numbers"}), 400
        if not (0 <= humidity <= 100):
            return jsonify({"error": "Humidity must be between 0 and 100"}), 400
        if not (0 <= moisture <= 100):
            return jsonify({"error": "Moisture must be between 0 and 100"}), 400

        soil_type = data['soilType']
        crop_type = data['cropType']
        language = data.get('language', 'en')   # ✅ read language
        if language not in ('en', 'te'):
            language = 'en'

        input_data = pd.DataFrame({
            'Temperature': [temperature], 'Humidity': [humidity], 'Moisture': [moisture],
            'Nitrogen': [nitrogen], 'Phosphorous': [phosphorous], 'Potassium': [potassium],
            'Soil_Type': [soil_type], 'Crop_Type': [crop_type]
        })

        prediction = fertilizer_model.predict(input_data)
        predicted_fertilizer = prediction[0]

        try:
            probabilities = fertilizer_model.predict_proba(input_data)
            confidence = float(max(probabilities[0])) * 100
        except:
            confidence = 95.0

        # ✅ Pick fertilizer info in the correct language
        fertilizer_info = get_fertilizer_info(language)
        fertilizer_details = fertilizer_info.get(predicted_fertilizer, {
            'npk': 'Contact agronomist',
            'description': 'నిపుణులను సంప్రదించండి' if language == 'te' else 'Specialized fertilizer',
            'usage': 'నిపుణుల సిఫార్సులు పాటించండి' if language == 'te' else 'Follow expert recommendations'
        })

        return jsonify({
            "success": True,
            "fertilizer": predicted_fertilizer,
            "confidence": round(confidence, 2),
            "npk_ratio": fertilizer_details['npk'],
            "description": fertilizer_details['description'],
            "usage_instructions": fertilizer_details['usage'],
            "input_parameters": {
                "temperature": temperature, "humidity": humidity, "moisture": moisture,
                "nitrogen": nitrogen, "phosphorous": phosphorous, "potassium": potassium,
                "soil_type": soil_type, "crop_type": crop_type
            }
        })
    except Exception as e:
        print(f"❌ Error in fertilizer prediction: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# -------------------- RUN SERVER --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)