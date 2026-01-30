import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import {useAuthStore} from './store';

// Pages
import HomePage from './pages/HomePage';
import CommunityPage from './pages/CommunityPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LearnPage from './pages/LearnPage';
import ConnectPage from './pages/ConnectPage';
import ForumsPage from './pages/ForumsPage';
import ForumDetailPage from './pages/ForumDetailPage';
import ForumPostDetailPage from './pages/ForumPostDetailPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import MessagesPage from './pages/MessagesPage';
import DonationsPage from './pages/DonationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import InitiatePaymentPage from './pages/InitiatePaymentPage';
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminEventList from './pages/admin/events/AdminEventList';
import AdminEventCreate from './pages/admin/events/AdminEventCreate';
import AdminEventEdit from './pages/admin/events/AdminEventEdit';
import AdminEventDetail from './pages/admin/events/AdminEventDetail';
import AdminMeetingList from './pages/admin/meetings/AdminMeetingList';
import AdminBroadcastList from './pages/admin/broadcasts/AdminBroadcastList';
import AdminBroadcastCreate from './pages/admin/broadcasts/AdminBroadcastCreate';
import AdminBroadcastEdit from './pages/admin/broadcasts/AdminBroadcastEdit';
import AdminBroadcastDetail from './pages/admin/broadcasts/AdminBroadcastDetail';
import AdminPaymentGatewayList from './pages/admin/payments/AdminPaymentGatewayList';
import AdminPaymentGatewayCreate from './pages/admin/payments/AdminPaymentGatewayCreate';
import AdminPaymentGatewayEdit from './pages/admin/payments/AdminPaymentGatewayEdit';
import AdminUserList from './pages/admin/users/AdminUserList';
import AdminUserDetail from './pages/admin/users/AdminUserDetail';
import AdminPendingVerifications from './pages/admin/users/AdminPendingVerifications';
import AdminArticleList from './pages/admin/articles/AdminArticleList';
import AdminArticleCreate from './pages/admin/articles/AdminArticleCreate';
import AdminArticleEdit from './pages/admin/articles/AdminArticleEdit';
import AdminFinancialReport from './pages/admin/reports/AdminFinancialReport';
import AdminPaymentsSummaryReport from './pages/admin/reports/AdminPaymentsSummaryReport';
import AdminPendingCancelledReport from './pages/admin/reports/AdminPendingCancelledReport';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Protected Route Component
const ProtectedRoute = ({children, requiredRole, requiredPermission}) => {
    const {isAuthenticated, hasRole, hasPermission} = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/" replace/>;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/" replace/>;
    }

    return children;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Toaster position="top-right"/>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                    <Route path="/reset-password" element={<ResetPasswordPage/>}/>

                    {/* Root layout for both public and private routes */}
                    <Route path="/" element={<MainLayout/>}>
                        <Route index element={<HomePage/>}/>

                        {/* Protected Routes inside MainLayout */}
                        <Route
                            path="community"
                            element={
                                <ProtectedRoute>
                                    <CommunityPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="events" element={<EventsPage/>}/>
                        <Route path="events/:id" element={<EventDetailPage/>}/>
                        <Route
                            path="learn"
                            element={
                                <ProtectedRoute>
                                    <LearnPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="connect"
                            element={
                                <ProtectedRoute>
                                    <ConnectPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="forums"
                            element={
                                <ProtectedRoute>
                                    <ForumsPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="forums/:id"
                            element={
                                <ProtectedRoute>
                                    <ForumDetailPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="forums/:id/posts/:postId"
                            element={
                                <ProtectedRoute>
                                    <ForumPostDetailPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="articles"
                            element={
                                <ProtectedRoute>
                                    <ArticlesPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="articles/:id"
                            element={
                                <ProtectedRoute>
                                    <ArticleDetailPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="messages"
                            element={
                                <ProtectedRoute>
                                    <MessagesPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="donations"
                            element={
                                <ProtectedRoute>
                                    <DonationsPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="settings"
                            element={
                                <ProtectedRoute>
                                    <SettingsPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="my-registrations"
                            element={
                                <ProtectedRoute>
                                    <MyRegistrationsPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="payments/initiate"
                            element={
                                <ProtectedRoute>
                                    <InitiatePaymentPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="payments/:id"
                            element={
                                <ProtectedRoute>
                                    <PaymentDetailsPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="payments/verify"
                            element={
                                <ProtectedRoute>
                                    <PaymentVerifyPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="tickets/:id"
                            element={
                                <ProtectedRoute>
                                    <TicketDetailsPage/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="admin/events"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminEventList/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/events/create"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminEventCreate/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/events/:id"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminEventDetail/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/events/:id/edit"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminEventEdit/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/meetings"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminMeetingList/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/broadcasts"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminBroadcastList/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/broadcasts/create"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminBroadcastCreate/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/broadcasts/:id"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminBroadcastDetail/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/broadcasts/:id/edit"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminBroadcastEdit/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/payments/gateways"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPaymentGatewayList/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/payments/gateways/create"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPaymentGatewayCreate/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/payments/gateways/:id/edit"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPaymentGatewayEdit/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/users"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminUserList/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/users/pending-verifications"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPendingVerifications/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/users/:id"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminUserDetail/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/articles"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminArticleList/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/articles/create"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminArticleCreate/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/articles/:id/edit"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminArticleEdit/>
                                </ProtectedRoute>
                            }
                        />

                        {/* Report Routes */}
                        <Route
                            path="admin/reports/financial"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminFinancialReport/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/reports/payments-summary"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPaymentsSummaryReport/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="admin/reports/pending-cancelled"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <AdminPendingCancelledReport/>
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
