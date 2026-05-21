/**
 * App.jsx — مع ErrorBoundary + Dark Mode
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore }   from "./store/authStore";
import { useDarkMode }    from "./hooks/useDarkMode";
import ErrorBoundary      from "./components/ui/ErrorBoundary";
import Layout             from "./components/layout/Layout";
import LoginPage          from "./pages/LoginPage";
import EmergencyRestorePage from "./pages/EmergencyRestorePage";
import DashboardPage      from "./pages/DashboardPage";
import SalesPage          from "./pages/SalesPage";
import BouncedChecksPage  from "./pages/BouncedChecksPage";
import WorkersExpensesPage from "./pages/WorkersExpensesPage";
import WaybillsPage       from "./pages/WaybillsPage";
import PartialPaymentPage from "./pages/PartialPaymentPage";
import InstitutionTaxPage from "./pages/InstitutionTaxPage";
import SalesToCompaniesPage from "./pages/SalesToCompaniesPage";
import ExpensesPage       from "./pages/ExpensesPage";
import SleevesBidsPage    from "./pages/SleevesBidsPage";
import BidsPage           from "./pages/BidsPage";
import CompaniesPage      from "./pages/CompaniesPage";
import InventoriesPage    from "./pages/InventoriesPage";
import ProvidersPage      from "./pages/ProvidersPage";
import ContactsPage       from "./pages/ContactsPage";
import EventsPage         from "./pages/EventsPage";
import SettingsPage       from "./pages/SettingsPage";
import ChartsPage         from "./pages/ChartsPage";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  // ✅ Apply dark mode on app load
  useDarkMode();

  return (
    // ✅ ErrorBoundary wraps everything — crashes don't kill the whole app
    <ErrorBoundary>
      <Routes>
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/emergency-restore" element={<EmergencyRestorePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* Inner ErrorBoundary for Layout — keeps sidebar alive on page crash */}
              <ErrorBoundary>
                <Layout />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        >
          <Route index                      element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="sales"               element={<ErrorBoundary><SalesPage /></ErrorBoundary>} />
          <Route path="bounced-checks"      element={<ErrorBoundary><BouncedChecksPage /></ErrorBoundary>} />
          <Route path="workers-expenses"    element={<ErrorBoundary><WorkersExpensesPage /></ErrorBoundary>} />
          <Route path="waybills"            element={<ErrorBoundary><WaybillsPage /></ErrorBoundary>} />
          <Route path="partial-payment"     element={<ErrorBoundary><PartialPaymentPage /></ErrorBoundary>} />
          <Route path="institution-tax"     element={<ErrorBoundary><InstitutionTaxPage /></ErrorBoundary>} />
          <Route path="sales-to-companies"  element={<ErrorBoundary><SalesToCompaniesPage /></ErrorBoundary>} />
          <Route path="expenses"            element={<ErrorBoundary><ExpensesPage /></ErrorBoundary>} />
          <Route path="sleeves-bids"        element={<ErrorBoundary><SleevesBidsPage /></ErrorBoundary>} />
          <Route path="bids"               element={<ErrorBoundary><BidsPage /></ErrorBoundary>} />
          <Route path="companies"          element={<ErrorBoundary><CompaniesPage /></ErrorBoundary>} />
          <Route path="inventories"        element={<ErrorBoundary><InventoriesPage /></ErrorBoundary>} />
          <Route path="providers"          element={<ErrorBoundary><ProvidersPage /></ErrorBoundary>} />
          <Route path="contacts"           element={<ErrorBoundary><ContactsPage /></ErrorBoundary>} />
          <Route path="events"             element={<ErrorBoundary><EventsPage /></ErrorBoundary>} />
          <Route path="charts"             element={<ErrorBoundary><ChartsPage /></ErrorBoundary>} />
          <Route path="settings"           element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
