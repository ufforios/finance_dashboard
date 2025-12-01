'use client';

import { useFinance } from '@/lib/FinanceContext';
import { StatCard } from './Card';
import TransactionList from './TransactionList';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { summary, loading } = useFinance();

    if (loading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (!summary) {
        return <div className={styles.error}>Error al cargar datos</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalAvailable = summary.cashBalance + summary.bankBalance - summary.creditCardDebt;

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>Dashboard Financiero</h1>
                <p className={styles.subtitle}>Resumen de tu situación financiera</p>
            </header>

            <div className={styles.statsGrid}>
                <StatCard
                    label="Disponibilidad Total"
                    value={formatCurrency(totalAvailable)}
                    icon="💵"
                />
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

            <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                    <h3>💵 Efectivo</h3>
                    <p className={styles.amount}>{formatCurrency(summary.cashBalance)}</p>
                </div>
                <div className={styles.detailCard}>
                    <h3>🏦 Cajas de Ahorro</h3>
                    <p className={styles.amount}>{formatCurrency(summary.bankBalance)}</p>
                </div>
                <div className={styles.detailCard}>
                    <h3>💳 Deuda TC</h3>
                    <p className={`${styles.amount} ${styles.debt}`}>
                        {formatCurrency(summary.creditCardDebt)}
                    </p>
                </div>
            </div>

            <div className={styles.transactionsSection}>
                <TransactionList />
            </div>
        </div>
    );
}
