import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './pages/Menu';
import Graph from './pages/Graph';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Menu />} />
        <Route path='/graph/:graphType' element={<Graph />} />
      </Routes>
    </Router>
  );
}

export default App;