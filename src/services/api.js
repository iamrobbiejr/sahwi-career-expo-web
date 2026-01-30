import axios from 'axios';
import {useAuthStore} from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();

            // Don't redirect if we're already on an authentication page or if the request was a login/register attempt
            // This prevents a full page reload that would clear error messages
            const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(
                path => window.location.pathname.includes(path)
            );
            const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/register');

            if (!isAuthPage && !isAuthRequest) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// API service methods
export const authService = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => {
        if (userData instanceof FormData) {
            return apiClient.post('/auth/register', userData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
        }
        return apiClient.post('/auth/register', userData);
    },
    logout: () => apiClient.post('/auth/logout'),
    me: () => apiClient.get('/auth/me'),
};

export const statsService = {
    getMe: () => apiClient.get('/me/stats'),
};

export const eventsService = {
    getAll: (params) => apiClient.get('/events', {params}),
    getUpcoming: () => apiClient.get('/events/upcoming'),
    getById: (id) => apiClient.get(`/events/${id}`),
    register: (eventId, data) => apiClient.post(`/events/${eventId}/register`, data),
    getUserEvents: () => apiClient.get('/events/my-events'),

    // Admin endpoints
    adminGetAll: (params) => apiClient.get('/admin/events', {params}),
    adminCreate: (data) => apiClient.post('/events', data),
    adminUpdate: (id, data) => apiClient.put(`/events/${id}`, data),
    adminDelete: (id) => apiClient.delete(`/events/${id}`),
    adminGetById: (id) => apiClient.get(`/events/${id}`),
    bulkStore: (data) => apiClient.post('/events/bulk', data),
};

export const eventPanelsService = {
    getAllByEvent: (eventId) => apiClient.get(`/events/${eventId}/panels`),
    create: (data) => apiClient.post('/event-panels', data),
    getById: (id) => apiClient.get(`/event-panels/${id}`),
    update: (id, data) => apiClient.put(`/event-panels/${id}`, data),
    delete: (id) => apiClient.delete(`/event-panels/${id}`),
};

export const eventActivitiesService = {
    getAllByEvent: (eventId) => apiClient.get(`/events/${eventId}/activities`),
    create: (data) => apiClient.post('/event-activities', data),
    getById: (id) => apiClient.get(`/event-activities/${id}`),
    update: (id, data) => apiClient.put(`/event-activities/${id}`, data),
    delete: (id) => apiClient.delete(`/event-activities/${id}`),
};

export const conferenceCallsService = {
    getAll: (params) => apiClient.get('/conference-calls', {params}),
    getUpcoming: () => apiClient.get('/conference-calls/upcoming'),
    getById: (id) => apiClient.get(`/conference-calls/${id}`),
    create: (data) => apiClient.post('/conference-calls', data),
    update: (id, data) => apiClient.put(`/conference-calls/${id}`, data),
    delete: (id) => apiClient.delete(`/conference-calls/${id}`),
    start: (id) => apiClient.post(`/conference-calls/${id}/start`),
    end: (id) => apiClient.post(`/conference-calls/${id}/end`),
    cancel: (id, data) => apiClient.post(`/conference-calls/${id}/cancel`, data),
    getCredentials: (id) => apiClient.get(`/conference-calls/${id}/credentials`),
};

export const forumsService = {
    getAll: (params) => apiClient.get('/forums', {params}),
    getById: (id) => apiClient.get(`/forums/${id}`),
    create: (data) => apiClient.post('/forums', data),
    update: (id, data) => apiClient.put(`/forums/${id}`, data),
    delete: (id) => apiClient.delete(`/forums/${id}`),
    join: (id) => apiClient.post(`/forums/${id}/join`),
    leave: (id) => apiClient.post(`/forums/${id}/leave`),
    getMembers: (id) => apiClient.get(`/forums/${id}/members`),
};

export const forumPostsService = {
    getAll: (forumId, params) => apiClient.get(`/forums/${forumId}/posts`, {params}),
    getById: (forumId, postId) => apiClient.get(`/forums/${forumId}/posts/${postId}`),
    create: (forumId, data) => {
        if (data instanceof FormData) {
            return apiClient.post(`/forums/${forumId}/posts`, data, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
        }
        return apiClient.post(`/forums/${forumId}/posts`, data);
    },
    update: (forumId, postId, data) => apiClient.put(`/forums/${forumId}/posts/${postId}`, data),
    delete: (forumId, postId) => apiClient.delete(`/forums/${forumId}/posts/${postId}`),
    togglePin: (forumId, postId) => apiClient.post(`/forums/${forumId}/posts/${postId}/pin`),
    toggleLock: (forumId, postId) => apiClient.post(`/forums/${forumId}/posts/${postId}/lock`),
    approve: (forumId, postId) => apiClient.post(`/forums/${forumId}/posts/${postId}/approve`),
    reject: (forumId, postId, data) => apiClient.post(`/forums/${forumId}/posts/${postId}/reject`, data),
};

export const forumCommentsService = {
    getAll: (forumId, postId, params) => apiClient.get(`/forums/${forumId}/posts/${postId}/comments`, {params}),
    getById: (forumId, postId, commentId) => apiClient.get(`/forums/${forumId}/posts/${postId}/comments/${commentId}`),
    create: (forumId, postId, data) => {
        if (data instanceof FormData) {
            return apiClient.post(`/forums/${forumId}/posts/${postId}/comments`, data, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
        }
        return apiClient.post(`/forums/${forumId}/posts/${postId}/comments`, data);
    },
    update: (forumId, postId, commentId, data) => apiClient.put(`/forums/${forumId}/posts/${postId}/comments/${commentId}`, data),
    delete: (forumId, postId, commentId) => apiClient.delete(`/forums/${forumId}/posts/${postId}/comments/${commentId}`),
    toggleLike: (forumId, postId, commentId) => apiClient.post(`/forums/${forumId}/posts/${postId}/comments/${commentId}/like`),
    approve: (forumId, postId, commentId) => apiClient.post(`/forums/${forumId}/posts/${postId}/comments/${commentId}/approve`),
    reject: (forumId, postId, commentId, data) => apiClient.post(`/forums/${forumId}/posts/${postId}/comments/${commentId}/reject`, data),
    getReplies: (forumId, postId, commentId) => apiClient.get(`/forums/${forumId}/posts/${postId}/comments/${commentId}/replies`),
};

export const articlesService = {
    getAll: (params) => apiClient.get('/articles', {params}),
    getTrending: (params) => apiClient.get('/articles/trending', {params}),
    getTrendingTopics: (params) => apiClient.get('/articles/trending-topics', {params}),
    getById: (id) => apiClient.get(`/articles/${id}`),
    share: (id, data) => apiClient.post(`/articles/${id}/share`, data),
    create: (data) => apiClient.post('/articles', data),
    update: (id, data) => apiClient.put(`/articles/${id}`, data),
    delete: (id) => apiClient.delete(`/articles/${id}`),
    togglePublish: (id) => apiClient.patch(`/articles/${id}/toggle-publish`),
    toggleBookmark: (id, data) => apiClient.post(`/articles/${id}/bookmark`, data),
    toggleLike: (id) => apiClient.post(`/articles/${id}/like`),

    // Comments
    getComments: (articleId, params) => apiClient.get(`/articles/${articleId}/comments`, {params}),
    getComment: (articleId, commentId) => apiClient.get(`/articles/${articleId}/comments/${commentId}`),
    getCommentReplies: (articleId, commentId, params) => apiClient.get(`/articles/${articleId}/comments/${commentId}/replies`, {params}),
    createComment: (articleId, data) => apiClient.post(`/articles/${articleId}/comments`, data),
    updateComment: (articleId, commentId, data) => apiClient.put(`/articles/${articleId}/comments/${commentId}`, data),
    deleteComment: (articleId, commentId) => apiClient.delete(`/articles/${articleId}/comments/${commentId}`),
    updateCommentStatus: (articleId, commentId, data) => apiClient.patch(`/articles/${articleId}/comments/${commentId}/status`, data),
};

export const threadsService = {
    getAll: (params) => apiClient.get('/threads', {params}),
    create: (data) => apiClient.post('/threads', data),
    getById: (id) => apiClient.get(`/threads/${id}`),
    update: (id, data) => apiClient.put(`/threads/${id}`, data),
    delete: (id) => apiClient.delete(`/threads/${id}`),
    addMember: (id, data) => apiClient.post(`/threads/${id}/members`, data),
    removeMember: (id, data) => apiClient.delete(`/threads/${id}/members`, {data}),
    leave: (id) => apiClient.post(`/threads/${id}/leave`),
    toggleMute: (id) => apiClient.post(`/threads/${id}/mute`),
};

export const messagesService = {
    getAll: (threadId, params) => apiClient.get(`/threads/${threadId}/messages`, {params}),
    send: (threadId, data) => {
        if (data instanceof FormData) {
            return apiClient.post(`/threads/${threadId}/messages`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        return apiClient.post(`/threads/${threadId}/messages`, data);
    },
    getById: (threadId, messageId) => apiClient.get(`/threads/${threadId}/messages/${messageId}`),
    update: (threadId, messageId, data) => apiClient.put(`/threads/${threadId}/messages/${messageId}`, data),
    destroy: (threadId, messageId) => apiClient.delete(`/threads/${threadId}/messages/${messageId}`),
    addReaction: (threadId, messageId, data) => apiClient.post(`/threads/${threadId}/messages/${messageId}/reactions`, data),
    removeReaction: (threadId, messageId, data) => apiClient.delete(`/threads/${threadId}/messages/${messageId}/reactions`, {data}),
    search: (threadId, params) => apiClient.get(`/threads/${threadId}/messages/search`, {params}),
    downloadAttachment: (messageId, index) => apiClient.get(`/message-attachments/${messageId}/${index}`, {responseType: 'blob'}),
};

export const donationsService = {
    getCampaigns: () => apiClient.get('/donations/campaigns'),
    donate: (campaignId, data) => apiClient.post(`/donations/campaigns/${campaignId}/donate`, data),
};

export const universitiesService = {
    getAll: () => apiClient.get('/universities'),
};

export const organizationsService = {
    search: (query) => apiClient.get(`/organizations/search?q=${query}`),
};

export const usersService = {
    getAll: (params) => apiClient.get('/users', {params}),
    getById: (id) => apiClient.get(`/users/${id}`),
    searchUser: (query) => apiClient.get(`/threads/search/user?q=${query}`),
};

export const fileService = {
    uploadVerificationDocs: (files) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });
        return apiClient.post('/files/upload/verification-docs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadEventBanner: (file) => {
        const formData = new FormData();
        formData.append('banner', file);
        return apiClient.post('/files/events/upload-banner', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    download: (url) => apiClient.get(url, {responseType: 'blob'}),
};

export const paymentGatewaysService = {
    getAll: () => apiClient.get('/payment-gateways'),
    adminGetById: (id) => apiClient.get(`/payment-gateways/${id}`),
    adminCreate: (data) => apiClient.post('/payment-gateways', data),
    adminUpdate: (id, data) => apiClient.put(`/payment-gateways/${id}`, data),
    adminDelete: (id) => apiClient.delete(`/payment-gateways/${id}`),
};

export const registrationsService = {
    getEventRegistrations: (eventId, params) => apiClient.get(`/events/${eventId}/registrations`, {params}),
    getEventAnalytics: (eventId) => apiClient.get(`/events/${eventId}/analytics`),
    registerIndividual: (eventId, data) => apiClient.post(`/events/${eventId}/register`, data),
    registerGroup: (eventId, data) => apiClient.post(`/events/${eventId}/register-group`, data),
    checkStatus: (eventId) => apiClient.get(`/events/${eventId}/registration-status`),
    getMyRegistrations: (params) => apiClient.get('/my-registrations', {params}),
    getById: (id) => apiClient.get(`/registrations/${id}`),
    cancel: (id, data) => apiClient.post(`/registrations/${id}/cancel`, data),
};

export const paymentsService = {
    initiate: (data) => apiClient.post('/payments/initiate', data),
    getById: (id) => apiClient.get(`/payments/${id}`),
    getStatus: (id) => apiClient.get(`/payments/${id}/status`),
    verify: (id) => apiClient.post(`/payments/${id}/verify`),
    getMyPayments: (params) => apiClient.get('/my-payments', {params}),
    refund: (id, data) => apiClient.post(`/payments/${id}/refund`, data),
    getRefunds: (params) => apiClient.get('/refunds', {params}),
};

export const ticketsService = {
    getById: (id) => apiClient.get(`/tickets/${id}`),
    download: (id) => apiClient.get(`/tickets/${id}/download`, {responseType: 'blob'}),
    resend: (id) => apiClient.post(`/tickets/${id}/resend`),
    getMyTickets: () => apiClient.get('/my-tickets'),
};

export const broadcastsService = {
    getAll: (params) => apiClient.get('/broadcasts', {params}),
    getById: (id) => apiClient.get(`/broadcasts/${id}`),
    create: (data) => apiClient.post('/broadcasts', data),
    update: (id, data) => apiClient.put(`/broadcasts/${id}`, data),
    delete: (id) => apiClient.delete(`/broadcasts/${id}`),
    send: (id) => apiClient.post(`/broadcasts/${id}/send`),
    cancel: (id) => apiClient.post(`/broadcasts/${id}/cancel`),
    getStatistics: (id) => apiClient.get(`/broadcasts/${id}/statistics`),
    previewRecipients: (data) => apiClient.post('/broadcasts/preview-recipients', data),
};

export const adminUserService = {
    getPendingVerifications: (params) => apiClient.get('/admin/pending-verifications', {params}),
    approveUser: (userId) => apiClient.post(`/admin/verify-user/${userId}`),
    rejectUser: (userId, data) => apiClient.post(`/admin/reject-user/${userId}`, data),
    getUsers: (params) => apiClient.get('/admin/users', {params}),
    getUserById: (userId) => apiClient.get(`/admin/users/${userId}`),
    updateUserRole: (userId, data) => apiClient.put(`/admin/users/${userId}/role`, data),
    toggleUserSuspension: (userId) => apiClient.patch(`/admin/users/${userId}/suspend`),
    deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
};
