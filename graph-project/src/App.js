import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './pages/Menu';
import Graph from './pages/Graph';
import Generate from './pages/Generate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Menu />} />
        <Route path='/graph/:graphType' element={<Graph />} />
        <Route path='/generate/:graphType/:weight' element={<Generate />} />
      </Routes>
    </Router>
  );
}

export default App;