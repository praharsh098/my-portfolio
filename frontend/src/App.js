import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('');

  const handleSwipe = async (e, action, job) => {
    e.stopPropagation();

    if (action === 'apply') {
      console.log('Applying to:', job.title);

      try {
        const res = await axios.post('http://localhost:5000/apply', {
          jobId: job.id,
          title: job.title,
          resumeFileName: resumeFile ? resumeFile.name : 'not_uploaded',
        });

        setMessage(res.data.message || 'Applied successfully!');
      } catch (error) {
        console.error('Apply error:', error);
        setMessage('Failed to apply.');
      }
    } else {
      console.log('Skipped:', job.title);
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await axios.post('http://localhost:5000/upload-resume', formData);
      const data = res.data;
      setMessage(data.message + " 📄 Extracted keywords: " + data.keywords.join(", "));
      console.log("Resume Text Snippet:", data.text_snippet);
    } catch (err) {
      console.error(err);
      setMessage('Upload failed.');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch('https://remotive.io/api/remote-jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else {
          setJobs([]);
          console.error("Unexpected job response format");
        }
      })
      .catch((err) => {
        console.error('Failed to load jobs:', err);
        setJobs([]);
        setMessage('Failed to fetch jobs.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchLocation = locationFilter === '' || job.candidate_required_location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchKeyword = keywordFilter === '' || job.title.toLowerCase().includes(keywordFilter.toLowerCase());
    return matchLocation && matchKeyword;
  });

  return (
    <div className="App">
      <h1>Job Application Portal</h1>

      {/* Resume Upload */}
      <div className="upload-box">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Resume</button>
        <p>{message}</p>
      </div>

      {/* Filter Options */}
      <div className="filter-box">
        <input
          type="text"
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={keywordFilter}
          onChange={(e) => setKeywordFilter(e.target.value)}
        />
      </div>

      {/* Loading Message */}
      {loading && <p>Loading jobs...</p>}

      {/* Job Cards */}
      <div className="job-section">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="job-card"
            onClick={() => setSelectedJob(job)}
          >
            <h2>{job.title}</h2>
            <h4>{job.company_name}</h4>
            <p>{job.candidate_required_location}</p>
            <div className="swipe-buttons">
              <button onClick={(e) => handleSwipe(e, 'skip', job)}>Skip</button>
              <button onClick={(e) => handleSwipe(e, 'apply', job)}>Apply</button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail View */}
      {selectedJob && (
        <div className="job-detail">
          <h2>{selectedJob.title}</h2>
          <h3>{selectedJob.company_name}</h3>
          <p>
            <strong>Location:</strong> {selectedJob.candidate_required_location}
          </p>
          <p dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
          <button onClick={() => setSelectedJob(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
