'use client';

import { useFinance } from '@/lib/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { dataService } from '@/lib/dataService';
import { useEffect, useState } from 'react';
import { format, parseISO, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './Charts.module.css';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#10b981', '#34d399', '#6ee7b7'];

export default function Charts() {
    const { transactions } = useFinance();
    const [expenseData, setExpenseData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);

    useEffect(() => {
        loadChartData();
    }, [transactions]);

    const loadChartData = async () => {
        // Cargar desglose de gastos por categoría
        const expenseBreakdown = await dataService.getCategoryBreakdown('expense');

        // Convertir a array y ordenar de mayor a menor
        const expenseArray = Object.entries(expenseBreakdown)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        setExpenseData(expenseArray);

        // Calcular datos mensuales
        const monthlyMap = new Map<string, { ingresos: number; egresos: number }>();

        transactions.forEach(t => {
            try {
                const date = parseISO(t.date);
                const monthKey = format(startOfMonth(date), 'yyyy-MM');
                const monthLabel = format(date, 'MMM yyyy', { locale: es });

                if (!monthlyMap.has(monthKey)) {
                    monthlyMap.set(monthKey, { ingresos: 0, egresos: 0 });
                }

                const monthData = monthlyMap.get(monthKey)!;

                if (t.type === 'income') {
                    monthData.ingresos += t.amount;
                } else if (t.type === 'expense') {
                    monthData.egresos += t.amount;
                }
            } catch (error) {
                console.error('Error parsing date:', t.date, error);
            }
        });

        // Convertir a array y ordenar por fecha
        const monthlyArray = Array.from(monthlyMap.entries())
            .map(([key, data]) => {
                const date = parseISO(key + '-01');
                return {
                    mes: format(date, 'MMM yyyy', { locale: es }),
                    ingresos: data.ingresos,
                    egresos: data.egresos,
                    sortKey: key
                };
            })
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .slice(-6); // Últimos 6 meses

        setMonthlyData(monthlyArray);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className={styles.charts}>
            <header className={styles.header}>
                <h1>Informes y Gráficos</h1>
                <p className={styles.subtitle}>Análisis visual de tus finanzas</p>
            </header>

            <div className={styles.chartsGrid}>
                {/* Gasto Total por Categoría */}
                {expenseData.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>📊 Gastos por Categoría</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expenseData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#1e2749',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Ingresos vs Egresos Mensual */}
                {monthlyData.length > 0 && (
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>📈 Ingresos vs Egresos Mensual</h3>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="mes"
                                        stroke="#94a3b8"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{
                                            background: '#1e2749',
                                            border: '1px solid #333',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="ingresos"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        name="Ingresos"
                                        dot={{ fill: '#10b981', r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="egresos"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        name="Egresos"
                                        dot={{ fill: '#ef4444', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
