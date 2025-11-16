import React, { useState } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

const HeaderForm = ({ nextStage }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    dob_age_grade: '',
    target_behavior: '',
    context_label: '',
    observer_name: '',
    observer_role: '',
    ioa_observer_name: '',
    date: '',
    start_time: '',
    end_time: '',
    session_number: 1,
    session_length_minutes: 30,
    safety_monitor: '',
    consent_confirmed: false,
    video_consent_confirmed: false,
    form_version: '',
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let message = "";

    if (["student_id","student_name","target_behavior","context_label","observer_name"].includes(name) && !value) {
      message = "This field is required.";
    }

    if (name === "session_number" && value < 1) {
      message = "Session number must be at least 1.";
    }

    if (name === "session_length_minutes" && value < 1) {
      message = "Session length must be at least 1.";
    }

    if (name === "date" && value) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) message = "Date must be YYYY-MM-DD.";
    }

    setErrors(prev => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
    validateField(name, newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasErrors = Object.values(errors).some(msg => msg);
    if (hasErrors) return;

    // Auto-generate start_time and end_time
    const now = new Date();
    const endTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const start = new Date(now.getTime() - formData.session_length_minutes * 60000);
    const startTime = start.toTimeString().split(' ')[0]; // HH:MM:SS

    const payload = {
      header: {
        ...formData,
        date: now.toISOString().split('T')[0], // YYYY-MM-DD
        start_time: startTime,
        end_time: endTime,
        submission_timestamp: now.toISOString()
      }
    };

    try {
      const response = await fetch('http://localhost:3000/api/forms/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || JSON.stringify(errorData.errors));
      }

      const result = await response.json();
      const headerId = result.headerId;
      console.log("Header submitted successfully, ID:", headerId);

      nextStage('ABC_LOG', { headerId, headerData: formData }); 
    } catch (error) {
      console.error("Submission Error:", error);
      setErrors(prev => ({ ...prev, submit: error.message }));
    }
  };

  const getBorderColor = (fieldName) => {
    if (errors[fieldName]) return "red";
    if (formData[fieldName] && !errors[fieldName]) return "green";
    return "";
  };

  // Build live payload preview
  const now = new Date();
  const previewPayload = {
    ...formData,
    start_time: new Date(now.getTime() - formData.session_length_minutes * 60000)
      .toTimeString().split(' ')[0],
    end_time: now.toTimeString().split(' ')[0],
    submission_timestamp: now.toISOString()
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2>FBA Header Information</h2>
        {errors.submit && <p style={{ color: "red" }}>{errors.submit}</p>}

        {/* Required fields */}
        <div>
          <label>Student ID:
            <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} required style={{ borderColor: getBorderColor("student_id") }} />
          </label>
          {errors.student_id && <p style={{ color: "red" }}>{errors.student_id}</p>}
        </div>

        <div>
          <label>Student Name:
            <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required style={{ borderColor: getBorderColor("student_name") }} />
          </label>
          {errors.student_name && <p style={{ color: "red" }}>{errors.student_name}</p>}
        </div>

        <div>
          <label>Target Behavior:
            <input type="text" name="target_behavior" value={formData.target_behavior} onChange={handleChange} required style={{ borderColor: getBorderColor("target_behavior") }} />
          </label>
          {errors.target_behavior && <p style={{ color: "red" }}>{errors.target_behavior}</p>}
        </div>

        <div>
          <label>Context Label:
            <input type="text" name="context_label" value={formData.context_label} onChange={handleChange} required style={{ borderColor: getBorderColor("context_label") }} />
          </label>
          {errors.context_label && <p style={{ color: "red" }}>{errors.context_label}</p>}
        </div>

        <div>
          <label>Observer Name:
            <input type="text" name="observer_name" value={formData.observer_name} onChange={handleChange} required style={{ borderColor: getBorderColor("observer_name") }} />
          </label>
          {errors.observer_name && <p style={{ color: "red" }}>{errors.observer_name}</p>}
        </div>

        <div>
          <label>Date (YYYY-MM-DD):
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{ borderColor: getBorderColor("date") }}
            />
          </label>
          {errors.date && <p style={{ color: "red" }}>{errors.date}</p>}
        </div>

        <div>
          <label>Session Number:
            <input
              type="number"
              name="session_number"
              value={formData.session_number}
              onChange={handleChange}
              min="1"
              required
              style={{ borderColor: getBorderColor("session_number") }}
            />
          </label>
          {errors.session_number && <p style={{ color: "red" }}>{errors.session_number}</p>}
        </div>

        <div>
          <label>Session Length (minutes):
            <input
              type="number"
              name="session_length_minutes"
              value={formData.session_length_minutes}
              onChange={handleChange}
              min="1"
              required
              style={{ borderColor: getBorderColor("session_length_minutes") }}
            />
          </label>
          {errors.session_length_minutes && <p style={{ color: "red" }}>{errors.session_length_minutes}</p>}
        </div>

        {/* Read-only preview of calculated times */}
        <div>
          <p><strong>Calculated Start Time:</strong> {previewPayload.start_time}</p>
          <p><strong>Calculated End Time:</strong> {previewPayload.end_time}</p>
        </div>

        {/* Optional fields */}
        <div>
          <label>DOB/Age/Grade:
            <input type="text" name="dob_age_grade" value={formData.dob_age_grade} onChange={handleChange} style={{ borderColor: getBorderColor("dob_age_grade") }} />
          </label>
        </div>

        <div>
          <label>Observer Role:
            <select
              name="observer_role"
              value={formData.observer_role || "Observer"} // default to "Observer"
              onChange={handleChange}
              required
              style={{ borderColor: getBorderColor("observer_role") }}
            >
              <option value="Observer">Observer</option>
              <option value="Observer2">Observer2</option>
              <option value="DataLead">DataLead</option>
              <option value="SafetyMonitor">SafetyMonitor</option>
              <option value="Parent">Parent</option>
            </select>
          </label>
          {errors.observer_role && <p style={{ color: "red" }}>{errors.observer_role}</p>}
        </div>

        <div>
          <label>IOA Observer Name:
            <input type="text" name="ioa_observer_name" value={formData.ioa_observer_name} onChange={handleChange} style={{ borderColor: getBorderColor("ioa_observer_name") }} />
          </label>
        </div>

        <div>
          <label>Safety Monitor:
            <input
              type="text"
              name="safety_monitor"
              value={formData.safety_monitor}
              onChange={handleChange}
              style={{ borderColor: getBorderColor("safety_monitor") }}
            />
          </label>
        </div>

        <div>
          <label>Video Consent Confirmed:
            <input
              type="checkbox"
              name="video_consent_confirmed"
              checked={formData.video_consent_confirmed}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>Consent Confirmed:
            <input
              type="checkbox"
              name="consent_confirmed"
              checked={formData.consent_confirmed}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>Form Version:
            <input
              type="text"
              name="form_version"
              value={formData.form_version}
              onChange={handleChange}
              style={{ borderColor: getBorderColor("form_version") }}
            />
          </label>
        </div>

        <button type="submit">Start Data Collection (Go to ABC Log)</button>
      </form>

{/* Live JSON preview */}
<JSONInput
  id="json-preview"
  placeholder={{
    required_fields: {
      student_id: previewPayload.student_id,
      student_name: previewPayload.student_name,
      target_behavior: previewPayload.target_behavior,
      context_label: previewPayload.context_label,
      observer_name: previewPayload.observer_name,
      date: previewPayload.date,
      session_number: previewPayload.session_number,
      session_length_minutes: previewPayload.session_length_minutes,
      start_time: previewPayload.start_time,
      end_time: previewPayload.end_time,
      submission_timestamp: previewPayload.submission_timestamp
    },
    optional_fields: {
      dob_age_grade: previewPayload.dob_age_grade,
      observer_role: previewPayload.observer_role,
      ioa_observer_name: previewPayload.ioa_observer_name,
      safety_monitor: previewPayload.safety_monitor,
      consent_confirmed: previewPayload.consent_confirmed,
      video_consent_confirmed: previewPayload.video_consent_confirmed,
      form_version: previewPayload.form_version
    }
  }}
  locale={locale}
  height="400px"
  width="100%"
  viewOnly={true}   // 🔒 makes the editor read‑only
  style={{ marginTop: "20px", padding: "10px", borderRadius: "5px" }}
/>

    </>
  );
};

export default HeaderForm;
