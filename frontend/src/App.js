import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Country, State } from 'country-state-city';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    console.log("Fetching jobs...");
    fetch('https://remotive.io/api/remote-jobs')
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
      })
      .catch((err) => console.error('Failed to load jobs:', err));
  }, []);

  useEffect(() => {
    const countryList = Country.getAllCountries();
    setCountries(countryList);
  }, []);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedCountry(countryCode);
    const stateList = State.getStatesOfCountry(countryCode);
    setStates(stateList);
    setSelectedState('');
  };

  const handleStateChange = (e) => {
    setSelectedState(e.target.value);
  };

  const handleSearch = () => {
    let filtered = jobs;

    if (selectedCountry) {
      filtered = filtered.filter((job) =>
        job.candidate_required_location.toLowerCase().includes(selectedCountry.toLowerCase())
      );
    }

    if (selectedState) {
      filtered = filtered.filter((job) =>
        job.candidate_required_location.toLowerCase().includes(selectedState.toLowerCase())
      );
    }

    if (searchKeyword) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
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
      setMessage(data.message + ' 📄 Extracted keywords: ' + data.keywords.join(', '));
    } catch (err) {
      console.error(err);
      setMessage('Upload failed.');
    }
  };

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

  return (
    <div className="App">
      <h1>Job Application Portal</h1>

      {/* Resume Upload */}
      <div className="upload-box">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Resume</button>
        <p>{message}</p>
      </div>

      {/* Filters */}
      <div className="filter-box">
        <select value={selectedCountry} onChange={handleCountryChange}>
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>

        <select value={selectedState} onChange={handleStateChange} disabled={!selectedCountry}>
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by keyword"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Job Cards */}
      <div className="job-section">
        {filteredJobs.map((job) => (
          <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
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
          <p><strong>Location:</strong> {selectedJob.candidate_required_location}</p>
          <p dangerouslySetInnerHTML={{ __html: selectedJob.description }}></p>
          <button onClick={() => setSelectedJob(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
