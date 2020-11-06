import React from 'react';
import './App.css';
import './css/tab.css';
import './css/datePicker.css';
import "react-datepicker/dist/react-datepicker.css";
import PoEn from './components/poEn';
import Pure from './components/Pure';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PoEn />
        {/* <Pure/> */}
      </header>
    </div>
  );
}

export default App;
