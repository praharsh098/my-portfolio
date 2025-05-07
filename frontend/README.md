# 🧠 Smart Job Auto Apply App (React + Flask)

A full-stack web application that helps users find and apply to real, remote jobs with just a few clicks. Users can upload a resume, view job details, and apply instantly — all within a clean and responsive UI.

---

## 🚀 Features

- 🔍 **Real-Time Job Feed** from [Remotive API](https://remotive.io/)
- 📄 **Resume Upload** with backend parsing (PDF only)
- ✨ **Keyword Extraction** from resume for personalization
- 📬 **Apply / Skip** buttons with backend simulation
- 🖱️ **Click to View Job Details**
- 💻 **Responsive Design** with:
  - Scrollable job cards (mobile)
  - Keyboard navigation (desktop - coming soon)

---

## 📁 Project Structure

job-auto-apply-app/
│
├── backend/ # Flask backend
│ └── app.py # Handles resume upload & apply actions
│
├── frontend/ # React frontend
│ ├── public/
│ ├── src/
│ │ ├── App.js # Main application logic
│ │ └── App.css # Styling
│ └── package.json
│
└── README.md # This file

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/job-auto-apply-app.git
cd job-auto-apply-app

### BACKEND SETUP(Flask)
cd backend
python -m venv venv
source venv/bin/activate  # on Windows use: venv\Scripts\activate
pip install -r requirements.txt
python app.py

#dependencies
flask
flask-cors
PyPDF2
nltk

###FRONTEND SETUP(REACT)
cd frontend
npm install
npm start

###Working
📄 Resume Upload
Uploads PDF file to backend via /upload-resume
Backend saves it and extracts keywords
Response includes:

✅ Success message
📄 Snippet of resume text
🧠 Top keywords

💼 Job Search
Jobs fetched from Remotive API
Displayed as cards (scrollable)
Click on a card to view full job description

📨 Apply / Skip
Clicking Apply sends a POST to /apply with job info
Clicking Skip just logs the action and shows the next job


### Future Enhancements

✅ Arrow key navigation (desktop)
🧠 Smart matching based on resume keywords
📝 Save favorite jobs
🔍 Filters by category/location
📊 Dashboard with application history

👨‍💻 Developed By
Praharsh (Data Science Major)
Assisted by OpenAI's GPT-based guidance

📄 License
MIT License - free to use, modify and distribute.