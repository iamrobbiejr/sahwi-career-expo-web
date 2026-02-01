import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => set({
                user,
                token,
                isAuthenticated: true
            }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),

            updateUser: (userData) => set((state) => ({
                user: {...state.user, ...userData}
            })),

            hasRole: (role) => {
                const user = useAuthStore.getState().user;
                if (!user) return false;
                return user.role === role || (Array.isArray(user.roles) && user.roles.includes(role));
            },

            hasPermission: (permission) => {
                const user = useAuthStore.getState().user;
                if (!user || !user.roles || !user.roles[0]) return false;

                return user.roles[0].permissions.some(p => p.name === permission);
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

const useUIStore = create((set) => ({
    sidebarOpen: true,
    notificationsPanelOpen: false,
    mobileMenuOpen: false,

    toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
    })),

    toggleNotifications: () => set((state) => ({
        notificationsPanelOpen: !state.notificationsPanelOpen
    })),

    toggleMobileMenu: () => set((state) => ({
        mobileMenuOpen: !state.mobileMenuOpen
    })),

    closeMobileMenu: () => set({mobileMenuOpen: false}),
}));

export {useAuthStore, useUIStore};
