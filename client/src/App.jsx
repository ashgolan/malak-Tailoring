import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import BouncedChecksPage from "./pages/BouncedChecksPage";
import WorkersExpensesPage from "./pages/WorkersExpensesPage";
import WaybillsPage from "./pages/WaybillsPage";
import PartialPaymentPage from "./pages/PartialPaymentPage";
import InstitutionTaxPage from "./pages/InstitutionTaxPage";
import SalesToCompaniesPage from "./pages/SalesToCompaniesPage";
import ExpensesPage from "./pages/ExpensesPage";
import SleevesBidsPage from "./pages/SleevesBidsPage";
import BidsPage from "./pages/BidsPage";
import CompaniesPage from "./pages/CompaniesPage";
import InventoriesPage from "./pages/InventoriesPage";
import ProvidersPage from "./pages/ProvidersPage";
import ContactsPage from "./pages/ContactsPage";
import EventsPage from "./pages/EventsPage";
import SettingsPage from "./pages/SettingsPage";
import ChartsPage from "./pages/ChartsPage";

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="bounced-checks" element={<BouncedChecksPage />} />
        <Route path="workers-expenses" element={<WorkersExpensesPage />} />
        <Route path="waybills" element={<WaybillsPage />} />
        <Route path="partial-payment" element={<PartialPaymentPage />} />
        <Route path="institution-tax" element={<InstitutionTaxPage />} />
        <Route path="sales-to-companies" element={<SalesToCompaniesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="sleeves-bids" element={<SleevesBidsPage />} />
        <Route path="bids" element={<BidsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="inventories" element={<InventoriesPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="charts" element={<ChartsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
