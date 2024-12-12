import React, { useState, useEffect } from 'react'; 
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  return (
    <Router>
      <div className="App">
        <h1>Find Companies that Match Your Values</h1>
        <Routes>
          <Route path="/step2" element={<Step2 />} />
          <Route path="/step3" element={<Step3 />} />
          <Route path="/step4" element={<Step4 />} />
          <Route path="/" element={<Step1 />} />
        </Routes>
      </div>
    </Router>
  );
};

const Step1 = () => {
  const navigate = useNavigate();
  const valuesList = [
    "Innovation", "Sustainability", "Teamwork", "Customer Focus", "Integrity", 
    "Accountability", "Creativity", "Transparency", "Quality", "Adaptability", 
    "Collaboration", "Diversity", "Respect", "Empathy", "Excellence", "Leadership", 
    "Passion", "Community", "Trust", "Learning",
  ];

  const [selectedValues, setSelectedValues] = useState([]);
  const [scores, setScores] = useState({});

  const handleValueChange = (value) => {
    const newSelectedValues = [...selectedValues];
    if (newSelectedValues.includes(value)) {
      newSelectedValues.splice(newSelectedValues.indexOf(value), 1);
    } else {
      if (newSelectedValues.length < 5) {
        newSelectedValues.push(value);
      }
    }
    setSelectedValues(newSelectedValues);
  };

  const handleScoreChange = (value, score) => {
    setScores({ ...scores, [value]: score });
  };

  const handleSubmit = () => {
    if (selectedValues.length === 5) {
      localStorage.setItem("selectedValues", JSON.stringify(selectedValues));
      localStorage.setItem("scores", JSON.stringify(scores));
      navigate("/step2");
    } else {
      alert("Please select exactly 5 values.");
    }
  };

  return (
    <div>
      <h2>Select Your Core Values</h2>
      <div className="value-buttons">
        {valuesList.map((value, index) => (
          <button 
            key={index} 
            className={`value-button ${selectedValues.includes(value) ? 'selected' : ''}`} 
            onClick={() => handleValueChange(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {selectedValues.length === 5 && (
        <div>
          <h3>Rate the Importance of Each Value</h3>
          {selectedValues.map((value, index) => (
            <div key={index} className="scoring-section">
              <label>{value}</label>
              <div className="score-bar">
                {[1, 2, 3].map((score) => (
                  <div 
                    key={score} 
                    className={`score-box ${scores[value] >= score ? 'selected' : ''}`} 
                    onClick={() => handleScoreChange(value, score)}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="submit-button" onClick={handleSubmit}>Next</button>
    </div>
  );
};

const Step2 = () => {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const domainsList = [
    "Automotive", "Fintech", "Banking", "Healthcare", "Retail", "Technology", 
    "Telecommunications", "Energy", "Real Estate", "Manufacturing",
  ];

  const countriesList = [
    "USA", "UK", "Germany", "France", "Italy", "Spain", "Canada", "Australia", 
    "Japan", "China",
  ];

  const navigate = useNavigate();

  const handleSubmit = () => {
    if (selectedDomain && selectedCountry) {
      localStorage.setItem("selectedDomain", selectedDomain);
      localStorage.setItem("selectedCountry", selectedCountry);
      navigate("/step3");
    } else {
      alert("Please select both domain and country.");
    }
  };

  return (
    <div>
      <h2>Select Your Desired Business Domain and Country</h2>

      <div className="selection-buttons">
        <h3>Business Domain</h3>
        <div className="domain-buttons">
          {domainsList.map((domain, index) => (
            <button 
              key={index} 
              className={`domain-button ${selectedDomain === domain ? 'selected' : ''}`} 
              onClick={() => setSelectedDomain(domain)}
            >
              {domain}
            </button>
          ))}
        </div>
        
        <h3>Country</h3>
        <div className="country-buttons">
          {countriesList.map((country, index) => (
            <button 
              key={index} 
              className={`country-button ${selectedCountry === country ? 'selected' : ''}`} 
              onClick={() => setSelectedCountry(country)}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="submit-button" onClick={handleSubmit}>Next</button>
    </div>
  );
};


const Step3 = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const fetchCompanies = async () => {
    const values = JSON.parse(localStorage.getItem("selectedValues")); // User's selected values
    const scores = JSON.parse(localStorage.getItem("scores")); // User's scores for values
  
    setLoading(true);
  
    // Dummy company values for the 20 possible values
    const companyData = {
      "Company A": [1, 3, 2, 1, 3, 2, 3, 3, 2, 1, 2, 3, 1, 2, 3, 3, 3, 2, 1, 3],
      "Company B": [2, 2, 3, 2, 3, 3, 2, 1, 3, 2, 3, 3, 2, 1, 2, 3, 1, 2, 3, 2],
      "Company C": [3, 1, 2, 1, 2, 2, 2, 3, 2, 3, 2, 3, 1, 2, 3, 3, 3, 1, 2, 3],
    };
  
    // Prepare data for the radar chart
    const labels = values; // These are the 5 selected values
  
    // Target data: The scores the user selected for the 5 values
    const targetData = values.map(value => scores[value]);
  
    // Filter the company data to only include the selected values
    const datasets = Object.keys(companyData).map((company, index) => {
      // Get the company's values, filtered by the selected values' indices
      const companyValues = companyData[company];
      const filteredValues = values.map((_, i) => companyValues[i]);
  
      return {
        label: company,
        data: filteredValues,
        backgroundColor: `rgba(${(index + 1) * 50}, ${(index + 1) * 100}, ${(index + 1) * 150}, 0.3)`, // Semi-transparent shading
        borderColor: `rgba(${(index + 1) * 50}, ${(index + 1) * 100}, ${(index + 1) * 150}, 1)`, // Solid border
        borderWidth: 2,
        fill: true, // Ensure the chart is filled
      };
    });
  
    // Add target dataset (user's scores)
    datasets.push({
      label: "Your Target",
      data: targetData,
      backgroundColor: "rgba(0, 255, 0, 0.3)", // Semi-transparent light green for target area
      borderColor: "rgba(0, 255, 0, 1)", // Solid border
      borderWidth: 2,
      fill: true,
    });
  
    setChartData({
      labels: labels, // 5 values as labels for the radar chart
      datasets: datasets,
    });
  
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h2>Your Best Matching Companies</h2>
      {loading ? (
        <p>Loading...</p>
      ) : chartData ? (
        <Radar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              r: {
                min: 0, // Set the minimum value to 0
                ticks: {
                  display: true,
                  font: {
                    size: 20, // Increase text size
                  },
                },
                pointlabels: {
                  font: {
                    size: 20, // Increase font size for labels
                  },
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  font: {
                    size: 20, // Increase legend text size
                  },
                },
              },
            },
          }}
        />
      ) : (
        <p>No chart data available.</p>
      )}

      {/* Button to navigate to Step 4 */}
      <button className="submit-button" onClick={() => navigate("/step4")}>Finish</button>
    </div>
  );
};



const Step4 = () => {
  return (
    <div>
      <h2>Thank You for Using the App!</h2>
      <p>Let us know how the interview went with your matching company </p>
      <p>and Feel free to explore more companies or start again.</p>
      <Link to="/">Go Back to Step 1</Link>
    </div>
  );
};

export default App;
