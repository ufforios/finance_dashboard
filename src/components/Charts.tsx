'use client';

import { useFinance } from '@/lib/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dataService } from '@/lib/dataService';
import { useEffect, useState } from 'react';
import styles from './Charts.module.css';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#10b981', '#34d399', '#6ee7b7'];

export default function Charts() {
    const { summary } = useFinance();
    const [incomeData, setIncomeData] = useState<any[]>([]);
    const [expenseData, setExpenseData] = useState<any[]>([]);

    useEffect(() => {
        loadChartData();
    }, []);

    const loadChartData = async () => {
        const incomeBreakdown = await dataService.getCategoryBreakdown('income');
        const expenseBreakdown = await dataService.getCategoryBreakdown('expense');

        setIncomeData(
            Object.entries(incomeBreakdown).map(([name, value]) => ({ name, value }))
        );
        setExpenseData(
            Object.entries(expenseBreakdown).map(([name, value]) => ({ name, value }))
        );
    };

    const accountData = summary ? [
        { name: 'Efectivo', value: summary.cashBalance },
        { name: 'Bancos', value: summary.bankBalance },
        { name: 'Deuda TC', value: summary.creditCardDebt }
    ].filter(item => item.value > 0) : [];

    return (
        <div className={styles.charts}>
            <header className={styles.header}>
                <h1>Informes y Gráficos</h1>
                <p className={styles.subtitle}>Análisis visual de tus finanzas</p>
            </header>

            <div className={styles.chartsGrid}>
                {/* Income Breakdown */}
                {incomeData.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Ingresos por Categoría</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={incomeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {incomeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Expense Breakdown */}
                {expenseData.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Gastos por Categoría</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Account Distribution */}
                {accountData.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>Distribución de Cuentas</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={accountData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1e2749',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
