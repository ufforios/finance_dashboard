'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import TransactionForm from './TransactionForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transaction } from '@/lib/types';
import styles from './TransactionList.module.css';

export default function TransactionList() {
    const { transactions, deleteTransaction } = useFinance();
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        // Crear fecha localmente para evitar problemas de zona horaria (UTC vs Local)
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return format(date, 'dd MMM yyyy', { locale: es });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return '📈';
            case 'expense': return '📉';
            case 'transfer': return '🔄';
            default: return '💰';
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta transacción?')) {
            await deleteTransaction(id);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
    };

    return (
        <>
            <div className={styles.transactionList}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Transacciones Recientes</h2>
                    <button
                        className={styles.addButton}
                        onClick={() => {
                            setEditingTransaction(null);
                            setShowModal(true);
                        }}
                    >
                        <span>+</span>
                        <span>Nueva</span>
                    </button>
                </div>

                {transactions.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No hay transacciones registradas</p>
                        <p>Haz clic en "Nueva" para agregar una</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {transactions.map(transaction => (
                            <div key={transaction.id} className={styles.transaction}>
                                <div className={styles.transactionLeft}>
                                    <div className={`${styles.icon} ${styles[transaction.type]}`}>
                                        {getIcon(transaction.type)}
                                    </div>
                                    <div className={styles.info}>
                                        <div className={styles.category}>{transaction.category}</div>
                                        <div className={styles.details}>
                                            <span>{formatDate(transaction.date)}</span>
                                            <span>•</span>
                                            <span>{transaction.account}</span>
                                            {transaction.detail && (
                                                <>
                                                    <span>•</span>
                                                    <span>{transaction.detail}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`${styles.amount} ${styles[transaction.type]}`}>
                                    {transaction.type === 'income' && '+'}
                                    {transaction.type === 'expense' && '-'}
                                    {formatCurrency(transaction.amount)}
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={`${styles.actionButton} ${styles.edit}`}
                                        onClick={() => handleEdit(transaction)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.delete}`}
                                        onClick={() => handleDelete(transaction.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <TransactionForm
                            onClose={handleCloseModal}
                            initialData={editingTransaction}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
