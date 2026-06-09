import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import MaterialsPage from './pages/MaterialsPage';
import CalculatorPage from './pages/CalculatorPage';
import ListenerPage from './pages/ListenerPage';
import ArchivePage from './pages/ArchivePage';
import StatisticsPage from './pages/StatisticsPage';
import CostStatisticsPage from './pages/CostStatisticsPage';
import WorkOrderKanbanPage from './pages/WorkOrderKanbanPage';
import WorkOrderDetailPage from './pages/WorkOrderDetailPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/listener" element={<ListenerPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/work-orders" element={<WorkOrderKanbanPage />} />
            <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/cost-statistics" element={<CostStatisticsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
