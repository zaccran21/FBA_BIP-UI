import React, { useState } from 'react';

// Receives nextStage function and 'data' containing { headerId, ... }
const ABCEventLog = ({ nextStage, data }) => {
  const [eventData, setEventData] = useState({
    antecedent: '',
    behavior: '',
    consequence: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    // The payload needs headerId to link the data hierarchically
    const payload = {
      headerId: data.headerId, 
      ...eventData,
    };

    try {
      // Submit to the new backend endpoint for ABC events
      const response = await fetch('http://localhost:3000/api/forms/abc-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to submit ABC event: ${errorData.error}`);
      }

      const result = await response.json();
      console.log("Event submitted successfully, ID:", result.eventId);

      // Move to the next stage (Summary report)
      nextStage('SUMMARY'); 

    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error submitting ABC event: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmitEvent}>
      <h2>Log ABC Event (Header ID: {data.headerId})</h2>
      <div>
        <label>Antecedent:
          <input type="text" name="antecedent" value={eventData.antecedent} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>Behavior:
          <input type="text" name="behavior" value={eventData.behavior} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>Consequence:
          <input type="text" name="consequence" value={eventData.consequence} onChange={handleChange} required />
        </label>
      </div>
      <button type="submit">Save Event & View Summary</button>
    </form>
  );
};

export default ABCEventLog;
