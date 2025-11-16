import React from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

const SummaryReport = ({ data }) => {
  return (
    <div>
      <h1>FBA Assessment Complete</h1>
      <p>Data has been successfully saved to the database.</p>
      
      <h3>Summary of Data Collected:</h3>
      <pre>
        {/* Displays the full accumulated JSON data for confirmation */}
        {JSON.stringify(data, null, 2)}
      </pre>
      
      {/* You could add a button here to start a new assessment or view a full report */}
    </div>
  );
};

export default SummaryReport;
