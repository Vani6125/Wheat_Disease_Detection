```sh

# 🌾 Early Detection of Wheat Diseases

An AI-powered web application designed to detect wheat diseases at an early stage using Machine Learning and Deep Learning techniques. The system helps farmers reduce crop loss by providing instant diagnosis, weather insights, and intelligent recommendations.

🔗 **Live Demo:** https://agrilens-beta.vercel.app/

---

## 📌 Project Overview

Wheat is a crucial staple crop, but its yield is heavily affected by diseases like rust, blight, and mildew. Traditional detection methods are slow and often ineffective.

This project leverages **AI, ML, and DL** to provide:

* Early disease detection
* Real-time monitoring
* Smart recommendations
* Weather-based insights


##  Features

###  1. AI-Based Disease Detection

* Upload wheat leaf images
* ML/DL model predicts disease
* Displays:

  * Disease name
  * Confidence score
  * Suggested remedies

###  2. Auto-Updating Dashboard

* Real-time updates after each scan
* Tracks:

  * Disease history
  * Field health
  * Trends and analytics

###  3. Weather Information & Forecast

* Integrated with OpenWeather API
* Provides:

  * Current weather conditions
  * Forecast data
  * Disease risk prediction based on climate

###  4. Intelligent Chatbot

* Powered by Gemini API
* Helps users:

  * Understand diseases
  * Get treatment suggestions
  * Ask agriculture-related queries

---

##  Tech Stack

###  Frontend

* React.js
* Figma (UI/UX Design)

###  Backend

* Flask (Python)
* REST APIs

###  AI/ML/DL

* Python
* Jupyter Notebook
* Deep Learning models (MobileNet / EfficientNet)

###  Database

* PostgreSQL (AWS RDS)

###  Cloud & Deployment

* AWS EC2
* AWS RDS

###  APIs

* OpenWeather API
* Gemini API

###  Tools

* Git & GitHub
* VS Code

---

##  System Architecture

```
User → React Frontend → Flask Backend → ML/DL Model
                                  ↓
                         PostgreSQL (AWS RDS)
                                  ↓
                       APIs (Weather + Gemini)
                                  ↓
                            Dashboard UI
```

---

##  Project Structure

```
Early-Detection-of-Wheat-Diseases/
│
├── public/          
├── backend/           # Flask APIs
    ├── database/          # DB schema & configs
├── src/             # Frontend
├── assets/            # Images & UI assets
└── README.md
```

---

##  Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Vani6125/Wheat_Disease_Detection.git
cd Early-Detection-of-Wheat-Diseases
```

### 2️⃣ Setup Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3️⃣ Setup Frontend (React)

```bash
cd frontend
npm install
npm start
```

---

## 🌍 Future Enhancements

* 📱 Mobile App Integration
* 📡 Drone-based monitoring
* 🧠 Improved model accuracy with larger datasets
* 🌐 Multi-language support for farmers
* 🔔 SMS/WhatsApp alert system

---

##  Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

##  License

This project is licensed under the MIT License.

---

##  Authors

* Manukonda Vani
* Kandula Prasannatha
* Sanku Vasuki Anila
* Thota Tejaswini


##  Support

If you like this project, give it a ⭐ on GitHub!


```
