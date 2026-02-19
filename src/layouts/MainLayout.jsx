import React from 'react';
import {Outlet} from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import {useAuthStore} from '../store';

const MainLayout = () => {
    const {user} = useAuthStore();

    return (
        <div className="min-h-screen" style={{backgroundColor: 'var(--color-bg)'}}>
            <Header/>
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
