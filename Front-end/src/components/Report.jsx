import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Report.css";

const Report = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:3000/reports'); // Replace with your actual API endpoint
        const data = await response.json();
        // Group sessions by child name
        const groupedReports = data.reduce((acc, curr) => {
          const { childname, sessionid } = curr;
          if (!acc[childname]) {
            acc[childname] = { childname, sessions: [] };
          }
          acc[childname].sessions.push({ sessionid });
          return acc;
        }, {});
        setReports(Object.values(groupedReports)); // Convert grouped object to array
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // Modified handleAnalyze function
  const handleAnalyze = async (childName, sessionId) => {
    try {
      // Call the /process route on the server to start analysis
      const response = await fetch('http://127.0.0.1:3000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId,childName }),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
  
      const result = await response.json();
      console.log(result);
      alert(`Analysis for session ${sessionId} processed! Check console for details.`);
    } catch (error) {
      console.error('Error processing analysis:', error);
      alert(`Failed to process analysis for session ${sessionId}.`);
    }
  };

  return (
    <div className="report-screen">
      <h1>Admin Report</h1>
      
      {/* Scroll to Top Button */}
      <button className="scroll-top-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        ↑
      </button>

      {/* Table Wrapper */}
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Child Name</th>
              <th>Session IDs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{report.childname}</td>
                <td>
                  {report.sessions.map((session, i) => (
                    <div key={i}>{session.sessionid}</div>
                  ))}
                </td>
                <td>
                  {report.sessions.map((session, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnalyze(report.childname, session.sessionid)}
                      className="analyze-button"
                    >
                      Analyze {session.sessionid}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="back-button" onClick={() => navigate("/")}>
        Back to Start
      </button>
    </div>
  );
};

export default Report;
