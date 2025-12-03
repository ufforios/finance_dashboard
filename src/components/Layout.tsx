'use client';

import { useState, ReactNode } from 'react';
import Dashboard from './Dashboard';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import Charts from './Charts';
import AIAnalysis from './AIAnalysis';
import GeminiChat from './GeminiChat';
import Settings from './Settings';
import styles from './Layout.module.css';

interface LayoutProps {
    children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'add', label: 'Agregar', icon: '➕' },
        { id: 'transactions', label: 'Transacciones', icon: '💰' },
        { id: 'reports', label: 'Informes', icon: '📈' },
        { id: 'chat', label: 'Chat IA', icon: '🤖' },
        { id: 'settings', label: 'Configuración', icon: '⚙️' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'add':
                return (
                    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                        <TransactionForm onClose={() => setActiveTab('transactions')} />
                    </div>
                );
            case 'transactions':
                return <TransactionList />;
            case 'reports':
                return <Charts />;
            case 'chat':
                return <GeminiChat />;
            case 'ai':
                return <AIAnalysis />;
            case 'settings':
                return <Settings />;
            default:
                return children || <Dashboard />;
        }
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>₡</div>
                    <div className={styles.logoText}>Finance</div>
                </div>

                <nav className={styles.nav}>
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {renderContent()}
            </main>

            {/* Mobile Navigation */}
            <nav className={styles.mobileNav}>
                {navItems.map(item => (
                    <div
                        key={item.id}
                        className={`${styles.mobileNavItem} ${activeTab === item.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className={styles.mobileNavIcon}>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
}
