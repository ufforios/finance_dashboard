'use client';

import { useFinance } from '@/lib/FinanceContext';
import styles from './AIAnalysis.module.css';

export default function AIAnalysis() {
    const { summary, transactions } = useFinance();

    if (!summary) {
        return <div>Cargando...</div>;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Simple AI-like analysis based on data
    const savingsRate = summary.totalIncome > 0
        ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
        : 0;

    const hasDebt = summary.creditCardDebt > 0;
    const expenseRatio = summary.totalIncome > 0
        ? (summary.totalExpenses / summary.totalIncome) * 100
        : 0;

    return (
        <div className={styles.aiAnalysis}>
            <header className={styles.header}>
                <h1>Análisis Inteligente</h1>
                <p className={styles.subtitle}>Recomendaciones personalizadas basadas en tus finanzas</p>
            </header>

            {/* Financial Health Overview */}
            <div className={styles.insightCard}>
                <div className={styles.insightHeader}>
                    <span className={styles.icon}>📊</span>
                    <h3 className={styles.insightTitle}>Resumen de Salud Financiera</h3>
                </div>
                <div className={styles.insightContent}>
                    <p>
                        Tu tasa de ahorro actual es del <strong>{savingsRate.toFixed(1)}%</strong>.
                        {savingsRate >= 20 && ' ¡Excelente trabajo! Estás ahorrando una buena parte de tus ingresos.'}
                        {savingsRate >= 10 && savingsRate < 20 && ' Estás en buen camino, pero podrías mejorar.'}
                        {savingsRate < 10 && savingsRate >= 0 && ' Considera aumentar tu tasa de ahorro para mejorar tu situación financiera.'}
                        {savingsRate < 0 && ' ⚠️ Estás gastando más de lo que ganas. Es importante tomar medidas correctivas.'}
                    </p>
                    <p>
                        Tus gastos representan el <strong>{expenseRatio.toFixed(1)}%</strong> de tus ingresos.
                    </p>
                </div>
            </div>

            {/* Debt Analysis */}
            {hasDebt && (
                <div className={styles.insightCard}>
                    <div className={styles.insightHeader}>
                        <span className={styles.icon}>💳</span>
                        <h3 className={styles.insightTitle}>Análisis de Deuda</h3>
                    </div>
                    <div className={styles.insightContent}>
                        <p>
                            Tienes una deuda de tarjeta de crédito de <strong>{formatCurrency(summary.creditCardDebt)}</strong>.
                        </p>
                        <div className={`${styles.recommendation} ${styles.warning}`}>
                            <h4>⚠️ Recomendación Urgente</h4>
                            <ul>
                                <li>Prioriza el pago de tu deuda de tarjeta de crédito</li>
                                <li>Evita acumular más deuda mientras pagas la existente</li>
                                <li>Considera consolidar deudas si tienes múltiples tarjetas</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Savings Recommendations */}
            <div className={styles.insightCard}>
                <div className={styles.insightHeader}>
                    <span className={styles.icon}>💰</span>
                    <h3 className={styles.insightTitle}>Recomendaciones de Ahorro</h3>
                </div>
                <div className={styles.insightContent}>
                    <div className={styles.recommendation}>
                        <h4>💡 Sugerencias Personalizadas</h4>
                        <ul>
                            <li>
                                Establece un fondo de emergencia equivalente a 3-6 meses de gastos
                                (aproximadamente {formatCurrency(summary.totalExpenses * 3)} - {formatCurrency(summary.totalExpenses * 6)})
                            </li>
                            <li>
                                Automatiza tus ahorros: destina al menos el 20% de tus ingresos a ahorro
                            </li>
                            <li>
                                Revisa tus gastos mensuales y identifica áreas donde puedas reducir
                            </li>
                            {summary.cashBalance > summary.bankBalance * 0.3 && (
                                <li>
                                    Tienes una cantidad significativa en efectivo. Considera depositar parte en una cuenta de ahorro
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Budget Recommendations */}
            <div className={styles.insightCard}>
                <div className={styles.insightHeader}>
                    <span className={styles.icon}>📈</span>
                    <h3 className={styles.insightTitle}>Planificación Presupuestaria</h3>
                </div>
                <div className={styles.insightContent}>
                    <p>Basado en la regla 50/30/20, tus ingresos deberían distribuirse así:</p>
                    <ul>
                        <li>50% para necesidades: {formatCurrency(summary.totalIncome * 0.5)}</li>
                        <li>30% para deseos: {formatCurrency(summary.totalIncome * 0.3)}</li>
                        <li>20% para ahorros: {formatCurrency(summary.totalIncome * 0.2)}</li>
                    </ul>
                    <div className={styles.recommendation}>
                        <h4>🎯 Próximos Pasos</h4>
                        <ul>
                            <li>Categoriza tus gastos en necesidades vs deseos</li>
                            <li>Establece límites de gasto para cada categoría</li>
                            <li>Revisa tu presupuesto mensualmente y ajusta según sea necesario</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
