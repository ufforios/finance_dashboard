'use client';

import { useFinance } from '@/lib/FinanceContext';
import { StatCard } from './Card';
import TransactionList from './TransactionList';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ACCOUNT_TYPES } from '@/lib/types';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { summary, accounts, loading } = useFinance();

    if (loading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (!summary) {
        return <div className={styles.error}>Error al cargar datos</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Preparar datos para chart de disponibilidad (Efectivo + Cajas de Ahorro)
    const availabilityAccounts = accounts
        .filter(a => a.type === ACCOUNT_TYPES.CASH || a.type === ACCOUNT_TYPES.BANK)
        .map(a => ({
            name: a.name,
            balance: a.balance,
            type: a.type
        }));

    // Preparar datos para chart de Tarjetas de Crédito
    const creditCardAccounts = accounts
        .filter(a => a.type === ACCOUNT_TYPES.CREDIT_CARD)
        .map(a => ({
            name: a.name,
            limite: a.creditLimit || 0,
            usado: a.creditLimit ? (a.creditLimit - a.balance) : Math.abs(Math.min(0, a.balance)),
            disponible: a.balance
        }));

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>Dashboard Financiero</h1>
                <p className={styles.subtitle}>Resumen de tu situación financiera</p>
            </header>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
                {/* Disponibilidad por Cuenta */}
                {availabilityAccounts.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>💵 Disponibilidad por Cuenta</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={availabilityAccounts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#1e2749',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="balance" fill="#10b981">
                                        {availabilityAccounts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === ACCOUNT_TYPES.CASH ? '#6366f1' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Tarjetas de Crédito */}
                {creditCardAccounts.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>💳 Tarjetas de Crédito</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={creditCardAccounts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#1e2749',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="usado" stackId="a" fill="#ef4444" name="Usado" />
                                    <Bar dataKey="disponible" stackId="a" fill="#10b981" name="Disponible" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.creditCardLegend}>
                            <span><span style={{ color: '#ef4444' }}>●</span> Usado</span>
                            <span><span style={{ color: '#10b981' }}>●</span> Disponible</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Metrics Cards */}
            <div className={styles.statsGrid}>
                <StatCard
                    label="Ingresos Totales"
                    value={formatCurrency(summary.totalIncome)}
                    icon="📈"
                />
                <StatCard
                    label="Gastos Totales"
                    value={formatCurrency(summary.totalExpenses)}
                    icon="📉"
                />
                <StatCard
                    label="Balance Neto"
                    value={formatCurrency(summary.netBalance)}
                    icon="💰"
                />
            </div>

            <div className={styles.transactionsSection}>
                <TransactionList />
            </div>
        </div>
    );
}
