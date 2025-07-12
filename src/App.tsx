
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ApplyTrainer from "./pages/ApplyTrainer";
import UserDashboard from "./pages/UserDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrainerProfile from "./pages/TrainerProfile";
import SearchResults from "./pages/SearchResults";
import TrainerSearch from "./pages/TrainerSearch";
import TrainingMarketplace from "./pages/TrainingMarketplace";
import TechnologyPage from "./pages/TechnologyPage";
import Services from "./pages/Services";
import BookService from "./pages/BookService";
import FeedbackForm from "./pages/FeedbackForm";
import FeedbackSuccess from "./pages/FeedbackSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import TrainerResources from "./pages/TrainerResources";
import CommunityStandards from "./pages/CommunityStandards";
import TrainerProtection from "./pages/TrainerProtection";
import SuccessStories from "./pages/SuccessStories";
import CategoryPage from "./pages/CategoryPage";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import TrainerOnboardingStatus from "./components/trainer/TrainerOnboardingStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/trainer-resources" element={<TrainerResources />} />
                  <Route path="/community-standards" element={<CommunityStandards />} />
                  <Route path="/trainer-protection" element={<TrainerProtection />} />
                  <Route path="/success-stories" element={<SuccessStories />} />
                  <Route path="/apply-trainer" element={<ApplyTrainer />} />
                  <Route path="/trainer-status" element={<TrainerOnboardingStatus />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/trainers" element={<TrainerSearch />} />
                  <Route path="/training-marketplace" element={<TrainingMarketplace />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:categorySlug" element={<Services />} />
                  <Route path="/book/:categorySlug" element={<BookService />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/technology/:slug" element={<TechnologyPage />} />
                  <Route path="/trainer/:id" element={<TrainerProfile />} />
                  <Route path="/checkout" element={<Checkout />} />
                  {/* Updated feedback route to properly handle base64 encoded tokens */}
                  <Route path="/feedback/:token" element={<FeedbackForm />} />
                  <Route path="/feedback-success" element={<FeedbackSuccess />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute requiredRole="user">
                        <UserDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/user-dashboard" 
                    element={
                      <ProtectedRoute requiredRole="user">
                        <UserDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/trainer-dashboard" 
                    element={
                      <ProtectedRoute requiredRole="trainer">
                        <TrainerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
