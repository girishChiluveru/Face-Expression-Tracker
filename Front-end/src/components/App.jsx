// /* eslint-disable no-unused-vars */
// import React, { useState } from 'react';
// import StartScreen from './StartScreen';
// import Quiz from './Quiz';
// import AnimalGame from './AnimalGame';
// import MemoryGame from './MemoryGame';
// import '../styles/App.css';

// function App() {
//   const [gameStage, setGameStage] = useState('start');
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [childName, setChildName] = useState('');
//   const [sessionId, setSessionId] = useState('');
//   const [currentSessionData, setCurrentSessionData] = useState({
//     quizScores: [],
//     animalGameScore: 0,
//     memoryGameScore: 0,
//     expressionTally: { quiz: 0, animalGame: 0, memoryGame: 0 }
//   });
//   const [allSessions, setAllSessions] = useState([]);
//   const [selectedSession, setSelectedSession] = useState(null);

//   const handleAdminLogin = () => {
//     setIsAdmin(true);
//   };

//   const handleStartQuiz = (name, sid) => {
//     setChildName(name);
//     setSessionId(sid);
//     setCurrentSessionData({
//       quizScores: [],
//       animalGameScore: 0,
//       memoryGameScore: 0,
//       expressionTally: { quiz: 0, animalGame: 0, memoryGame: 0 }
//     });
//     setGameStage('quiz');
//   };

//   const handleQuizEnd = (score, expressionTally) => {
//     setCurrentSessionData(prev => ({
//       ...prev,
//       quizScores: [...prev.quizScores, score],
//       expressionTally: { ...prev.expressionTally, quiz: expressionTally }
//     }));
//     setGameStage('animalGame');
//   };

//   const handleAnimalGameEnd = (score, expressionTally) => {
//     setCurrentSessionData(prev => ({
//       ...prev,
//       animalGameScore: score,
//       expressionTally: { ...prev.expressionTally, animalGame: expressionTally }
//     }));
//     setGameStage('memoryGame');
//   };

//   const handleMemoryGameEnd = (score, expressionTally) => {
//     const completedSessionData = {
//       ...currentSessionData,
//       sessionId,
//       childName,
//       memoryGameScore: score,
//       expressionTally: { ...currentSessionData.expressionTally, memoryGame: expressionTally }
//     };

//     setAllSessions(prev => [...prev, completedSessionData]);
//     setGameStage('start');
//     setChildName('');
//     setSessionId('');
//   };

//   const handleViewSessionReport = (session) => {
//     setSelectedSession(session);
//   };

//   const handleBackToStart = () => {
//     setGameStage('start');
//     setSelectedSession(null);
//     setIsAdmin(false);
//   };

//   return (
//     <div className="app">
//       {isAdmin ? (
//         <Report
//           allSessions={allSessions}
//           selectedSession={selectedSession}
//           onViewSessionReport={handleViewSessionReport}
//           onBackToHome={handleBackToStart}
//         />
//       ) : (
//         <>
//           {gameStage === 'start' && (
//             <StartScreen onStartQuiz={handleStartQuiz} onAdminLogin={handleAdminLogin} />
//           )}
//           {gameStage === 'quiz' && (
//             <Quiz onQuizEnd={handleQuizEnd} childName={childName} sessionId={sessionId} />
//           )}
//           {gameStage === 'animalGame' && (
//             <AnimalGame onFinish={handleAnimalGameEnd} childName={childName} sessionId={sessionId} />
//           )}
//           {gameStage === 'memoryGame' && (
//             <MemoryGame onFinish={handleMemoryGameEnd} childName={childName} sessionId={sessionId} />
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StartScreen from './StartScreen';
import Quiz from './Quiz';
import AnimalGame from './AnimalGame';
import MemoryGame from './MemoryGame';
import Report from './Report';
import '../styles/App.css';

function App() {
  const [gameStage, setGameStage] = useState('start');
  const [isAdmin, setIsAdmin] = useState(false);
  const [childName, setChildName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [allSessions, setAllSessions] = useState([]);

  const handleAdminLogin = () => {
    setIsAdmin(true);  // Update state to reflect admin login
  };

  const handleStartQuiz = (name, sid) => {
    setChildName(name);
    setSessionId(sid);
    setGameStage('quiz');
  };

  const handleAddSession = (sessionData) => {
    setAllSessions((prev) => [...prev, sessionData]);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Route for the home/start page */}
          <Route
            path="/"
            element={
              isAdmin ? (
                <Report allSessions={allSessions} />
              ) : (
                <StartScreen
                  onStartQuiz={(name, sid) => {
                    setChildName(name);
                    setSessionId(sid);
                    setGameStage('quiz');
                  }}
                  onAdminLogin={handleAdminLogin}  // Handle admin login
                />
              )
            }
          />
          
          {/* Route for the quiz game */}
          <Route
            path="/quiz"
            element={
              <Quiz
                onQuizEnd={(score, expressionTally) => {
                  const sessionData = {
                    childName,
                    sessionId,
                    quizScore: score,
                    expressionTally,
                  };
                  handleAddSession(sessionData);
                  setGameStage('animalGame');
                }}
                childName={childName}
                sessionId={sessionId}
              />
            }
          />
          
          {/* Route for the animal game */}
          <Route
            path="/animal-game"
            element={
              <AnimalGame
                onFinish={(score) => {
                  setAllSessions((prev) =>
                    prev.map((session) =>
                      session.sessionId === sessionId
                        ? { ...session, animalGameScore: score }
                        : session
                    )
                  );
                  setGameStage('memoryGame');
                }}
                childName={childName}
                sessionId={sessionId}
              />
            }
          />

          {/* Route for the memory game */}
          <Route
            path="/memory-game"
            element={
              <MemoryGame
                onFinish={(score) => {
                  setAllSessions((prev) =>
                    prev.map((session) =>
                      session.sessionId === sessionId
                        ? { ...session, memoryGameScore: score }
                        : session
                    )
                  );
                  setGameStage('start');
                }}
                childName={childName}
                sessionId={sessionId}
              />
            }
          />
          
          {/* Route for the admin report page */}
          <Route path="/report" element={<Report allSessions={allSessions} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

