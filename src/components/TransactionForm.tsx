'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useFinance } from '@/lib/FinanceContext';
import { ACCOUNTS, Transaction } from '@/lib/types';
import { dataService } from '@/lib/dataService';
import styles from './TransactionForm.module.css';

interface TransactionFormProps {
    onClose?: () => void;
    initialData?: Transaction | null;
}

export default function TransactionForm({ onClose, initialData }: TransactionFormProps) {
    const { addTransaction, updateTransaction } = useFinance();
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('income');
    const [category, setCategory] = useState('');
    const [account, setAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [detail, setDetail] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const accountList = Object.entries(ACCOUNTS);

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setCategory(initialData.category);
            setAccount(initialData.account);
            setToAccount(initialData.toAccount || '');
            setAmount(initialData.amount.toString());
            setDetail(initialData.detail || '');
            setDate(initialData.date);
        }
    }, [initialData]);

    useEffect(() => {
        loadCategories();
    }, [type]);

    const loadCategories = async () => {
        if (type !== 'transfer') {
            const cats = await dataService.getCategories(type);
            setCategories(cats);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!account || !amount || (type !== 'transfer' && !category)) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        if (type === 'transfer' && !toAccount) {
            alert('Por favor selecciona la cuenta de destino');
            return;
        }

        setIsSubmitting(true);
        try {
            // Obtener el nombre real de la cuenta en lugar de la key
            // @ts-ignore
            const accountName = ACCOUNTS[account]?.name || account;
            // @ts-ignore
            const toAccountName = type === 'transfer' ? (ACCOUNTS[toAccount]?.name || toAccount) : undefined;

            const transactionData = {
                type,
                category: type === 'transfer' ? 'Transferencia' : category,
                account: accountName,
                toAccount: toAccountName,
                amount: parseFloat(amount),
                detail,
                date
            };

            if (initialData) {
                await updateTransaction(initialData.id, transactionData);
            } else {
                await addTransaction(transactionData);
            }

            // Reset form
            if (!initialData) {
                setCategory('');
                setAmount('');
                setDetail('');
                setToAccount('');
            }

            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error al guardar la transacción');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h2>{initialData ? 'Editar Transacción' : 'Nueva Transacción'}</h2>

            <div className={styles.formGroup}>
                <label className={styles.label}>Tipo</label>
                <select
                    className={styles.select}
                    value={type}
                    onChange={(e) => {
                        setType(e.target.value as any);
                        setCategory('');
                    }}
                    disabled={!!initialData} // No permitir cambiar tipo al editar para simplificar lógica
                >
                    <option value="income">Ingreso</option>
                    <option value="expense">Egreso</option>
                    <option value="transfer">Transferencia</option>
                </select>
            </div>

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Fecha</label>
                    <input
                        type="date"
                        className={styles.input}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Monto</label>
                    <input
                        type="number"
                        className={styles.input}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                </div>
            </div>

            {type !== 'transfer' && (
                <div className={styles.formGroup}>
                    <label className={styles.label}>Categoría</label>
                    <select
                        className={styles.select}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>
                    {type === 'transfer' ? 'Cuenta Origen' : 'Cuenta'}
                </label>
                <select
                    className={styles.select}
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required
                >
                    <option value="">Seleccionar...</option>
                    {accountList.map(([id, { name }]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </div>

            {type === 'transfer' && (
                <div className={styles.formGroup}>
                    <label className={styles.label}>Cuenta Destino</label>
                    <select
                        className={styles.select}
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar...</option>
                        {accountList
                            .filter(([id]) => id !== account)
                            .map(([id, { name }]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                    </select>
                </div>
            )}

            <div className={styles.formGroup}>
                <label className={styles.label}>Detalle (opcional)</label>
                <textarea
                    className={styles.textarea}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="Agregar detalles..."
                />
            </div>

            <div className={styles.buttonGroup}>
                {onClose && (
                    <button
                        type="button"
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
                </button>
            </div>
        </form>
    );
}
