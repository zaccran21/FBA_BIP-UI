import React, { useState } from 'react';

import HeaderForm from './components/HeaderForm'; 
import DurationLog from './components/DurationLog.jsx';
import ABCEventLog from './components/ABCEventLog';
import SummaryReport from './components/SummaryReport';

function App() {
  console.log("✅ React App mounted successfully");

  // State to track the current active stage in the workflow
  const [currentStage, setCurrentStage] = useState('HEADER'); 

  // State to accumulate all FBA data across stages
  const [fbaData, setFbaData] = useState({});

  // Function to move to the next stage and save data
  const nextStage = (stageName, data = {}) => {
    setFbaData(prevData => ({ ...prevData, ...data }));
    setCurrentStage(stageName);
    console.log("➡️ Moving to stage:", stageName, "with data:", data);
  };

  // --- Conditional Rendering Logic ---
  const renderStage = () => {
    switch (currentStage) {
      case 'HEADER':
        return <HeaderForm nextStage={nextStage} />;
      case 'DURATION_LOG':
        return <DurationLog nextStage={nextStage} data={fbaData} />;
      case 'ABC_LOG':
        return <ABCEventLog nextStage={nextStage} data={fbaData} />;
      case 'SUMMARY':
        return <SummaryReport data={fbaData} />;
      default:
        return <div style={{ color: "red" }}>Error: Unknown stage</div>;
    }
  };

  return (
    <div className="App">
      <h1>My FBA UI</h1>
      {renderStage()}

      {/* Temporary navigation buttons for testing */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setCurrentStage('HEADER')}>Go to Header</button>
        <button onClick={() => setCurrentStage('DURATION_LOG')}>Go to Duration Log</button>
        <button onClick={() => setCurrentStage('ABC_LOG')}>Go to ABC Log</button>
        <button onClick={() => setCurrentStage('SUMMARY')}>Go to Summary</button>
      </div>
    </div>
  );
}

export default App;
