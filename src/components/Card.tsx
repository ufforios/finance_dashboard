'use client';

import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`${styles.card} ${className}`}>
            {children}
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: string;
    change?: number;
    className?: string;
}

export function StatCard({ label, value, icon, change, className = '' }: StatCardProps) {
    return (
        <div className={`${styles.statCard} ${className}`}>
            {icon && <div className={styles.statIcon}>{icon}</div>}
            <div className={styles.statLabel}>{label}</div>
            <div className={styles.statValue}>{value}</div>
            {change !== undefined && (
                <div className={`${styles.statChange} ${change >= 0 ? styles.positive : styles.negative}`}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                </div>
            )}
        </div>
    );
}
