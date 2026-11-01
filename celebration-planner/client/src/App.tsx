import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventWizardPage } from './pages/EventWizardPage';
import { EventOverviewPage } from './pages/EventOverviewPage';
import { BudgetPage } from './pages/BudgetPage';
import { TasksPage } from './pages/TasksPage';
import { VendorsPage } from './pages/VendorsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Landing Page with prominent headline and event imagery */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Main Dashboard with metrics and upcoming events */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 3. Event Creation Wizard */}
        <Route path="/events/new" element={<EventWizardPage />} />

        {/* 4. Event Overview / Details */}
        <Route path="/events/:id" element={<EventOverviewPage />} />

        {/* 5. Budget Management */}
        <Route path="/events/:id/budget" element={<BudgetPage />} />

        {/* 6. Timeline and Tasks */}
        <Route path="/events/:id/tasks" element={<TasksPage />} />

        {/* 7. Vendors and Quotation Comparison */}
        <Route path="/events/:id/vendors" element={<VendorsPage />} />

        {/* 8. AI Planning Assistant */}
        <Route path="/events/:id/assistant" element={<AiAssistantPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
