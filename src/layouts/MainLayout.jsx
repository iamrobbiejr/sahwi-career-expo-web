import React from 'react';
import {Outlet} from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import {useAuthStore, useUIStore} from '../store';

const MainLayout = () => {
    const {user} = useAuthStore();
    const {mobileMenuOpen, closeMobileMenu} = useUIStore();

    return (
        <div className="min-h-screen relative" style={{backgroundColor: 'var(--color-bg)'}}>
            <Header/>

            {/* Mobile Sidebar Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            <div className="flex">
                <Sidebar/>
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet/>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
