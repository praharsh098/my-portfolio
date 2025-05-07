from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2  # Make sure to install this: pip install PyPDF2
import requests
from flask import jsonify


app = Flask(__name__)
CORS(app)  # Enables cross-origin requests (frontend <-> backend)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/api/jobs", methods=['GET'])
def get_jobs():
    try:
        response= requests.get('https://remotive.io/api/remote-jobs')
        jobs_data = response.json()
        return jsonify(jobs_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/")
def home():
    return "✅ Job Auto Apply Backend Running"

@app.route("/upload-resume", methods=["POST"])
def upload_resume():
    resume = request.files.get("resume")
    if not resume:
        return jsonify({"error": "No file uploaded"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, resume.filename)
    resume.save(filepath)

    # Extract resume content (basic)
    try:
        reader = PyPDF2.PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        snippet = text[:300]  # Preview
        keywords = extract_keywords(text)
    except Exception as e:
        print("Error reading PDF:", e)
        snippet = ""
        keywords = []

    return jsonify({
        "message": "Resume uploaded successfully!",
        "keywords": keywords,
        "text_snippet": snippet
    }), 200

@app.route("/apply", methods=["POST"])
def apply():
    data = request.get_json()
    print(f"📩 Application received for: {data.get('title')} (ID: {data.get('jobId')})")
    return jsonify({"message": f"Application submitted for {data.get('title')}!"}), 200

def extract_keywords(text):
    # Simple keyword extraction (could be improved with NLP later)
    import re
    words = re.findall(r'\b\w+\b', text.lower())
    stopwords = {"and", "the", "a", "to", "in", "of", "for", "on", "with", "as", "by", "is", "this", "that"}
    freq = {}
    for word in words:
        if word not in stopwords and len(word) > 3:
            freq[word] = freq.get(word, 0) + 1
    sorted_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, count in sorted_keywords[:10]]

if __name__ == "__main__":
    app.run(debug=True)
