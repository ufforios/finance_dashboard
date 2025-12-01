'use client';

import { useState, useEffect, FormEvent } from 'react';
import { dataService } from '@/lib/dataService';
import { Account, ACCOUNT_TYPES } from '@/lib/types';
import styles from './Settings.module.css';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'account' | 'category'>('account');
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form states
    const [accountName, setAccountName] = useState('');
    const [accountType, setAccountType] = useState(ACCOUNT_TYPES.BANK);
    const [initialBalance, setInitialBalance] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState<'income' | 'expense'>('income');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [accts, incomeCats, expenseCats] = await Promise.all([
            dataService.getAccounts(),
            dataService.getCategories('income'),
            dataService.getCategories('expense')
        ]);
        setAccounts(accts);
        setIncomeCategories(incomeCats);
        setExpenseCategories(expenseCats);
    };

    const handleAddAccount = () => {
        setModalType('account');
        setEditingItem(null);
        setAccountName('');
        setAccountType(ACCOUNT_TYPES.BANK);
        setInitialBalance('0');
        setShowModal(true);
    };

    const handleEditAccount = (account: Account) => {
        setModalType('account');
        setEditingItem(account);
        setAccountName(account.name);
        setAccountType(account.type);
        setInitialBalance(account.initialBalance?.toString() || '0');
        setShowModal(true);
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;

        try {
            await dataService.deleteAccount(id);
            await loadData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleAddCategory = (type: 'income' | 'expense') => {
        setModalType('category');
        setEditingItem(null);
        setCategoryName('');
        setCategoryType(type);
        setShowModal(true);
    };

    const handleEditCategory = (name: string, type: 'income' | 'expense') => {
        setModalType('category');
        setEditingItem({ name, type });
        setCategoryName(name);
        setCategoryType(type);
        setShowModal(true);
    };

    const handleDeleteCategory = async (name: string, type: 'income' | 'expense') => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            await dataService.deleteCategory(type, name);
            await loadData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            if (modalType === 'account') {
                if (editingItem) {
                    await dataService.updateAccount(editingItem.id, {
                        name: accountName,
                        type: accountType
                    });
                } else {
                    await dataService.addAccount({
                        name: accountName,
                        type: accountType,
                        initialBalance: parseFloat(initialBalance) || 0
                    });
                }
            } else {
                if (editingItem) {
                    await dataService.updateCategory(categoryType, editingItem.name, categoryName);
                } else {
                    await dataService.addCategory(categoryType, categoryName);
                }
            }

            setShowModal(false);
            await loadData();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className={styles.settings}>
            <header className={styles.header}>
                <h1>Configuración</h1>
                <p className={styles.subtitle}>Administra tus cuentas y categorías</p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'accounts' ? styles.active : ''}`}
                    onClick={() => setActiveTab('accounts')}
                >
                    Cuentas
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Categorías
                </button>
            </div>

            {activeTab === 'accounts' && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Cuentas</h2>
                        <button className={styles.addButton} onClick={handleAddAccount}>
                            <span>+</span>
                            <span>Nueva Cuenta</span>
                        </button>
                    </div>

                    {accounts.length === 0 ? (
                        <div className={styles.empty}>No hay cuentas registradas</div>
                    ) : (
                        <div className={styles.list}>
                            {accounts.map(account => (
                                <div key={account.id} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>{account.name}</div>
                                        <div className={styles.itemDetails}>
                                            {account.type} • Balance: ${account.balance.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleEditAccount(account)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${styles.delete}`}
                                            onClick={() => handleDeleteAccount(account.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'categories' && (
                <>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Categorías de Ingresos</h2>
                            <button
                                className={styles.addButton}
                                onClick={() => handleAddCategory('income')}
                            >
                                <span>+</span>
                                <span>Nueva</span>
                            </button>
                        </div>

                        {incomeCategories.length === 0 ? (
                            <div className={styles.empty}>No hay categorías de ingresos</div>
                        ) : (
                            <div className={styles.list}>
                                {incomeCategories.map(category => (
                                    <div key={category} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemName}>{category}</div>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleEditCategory(category, 'income')}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.delete}`}
                                                onClick={() => handleDeleteCategory(category, 'income')}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Categorías de Egresos</h2>
                            <button
                                className={styles.addButton}
                                onClick={() => handleAddCategory('expense')}
                            >
                                <span>+</span>
                                <span>Nueva</span>
                            </button>
                        </div>

                        {expenseCategories.length === 0 ? (
                            <div className={styles.empty}>No hay categorías de egresos</div>
                        ) : (
                            <div className={styles.list}>
                                {expenseCategories.map(category => (
                                    <div key={category} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemName}>{category}</div>
                                        </div>
                                        <div className={styles.itemActions}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleEditCategory(category, 'expense')}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.delete}`}
                                                onClick={() => handleDeleteCategory(category, 'expense')}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {showModal && (
                <div className={styles.modal} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {editingItem ? 'Editar' : 'Nueva'}{' '}
                            {modalType === 'account' ? 'Cuenta' : 'Categoría'}
                        </h3>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            {modalType === 'account' ? (
                                <>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Nombre</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Tipo</label>
                                        <select
                                            className={styles.select}
                                            value={accountType}
                                            onChange={(e) => setAccountType(e.target.value)}
                                            required
                                        >
                                            <option value={ACCOUNT_TYPES.CASH}>{ACCOUNT_TYPES.CASH}</option>
                                            <option value={ACCOUNT_TYPES.BANK}>{ACCOUNT_TYPES.BANK}</option>
                                            <option value={ACCOUNT_TYPES.CREDIT_CARD}>{ACCOUNT_TYPES.CREDIT_CARD}</option>
                                        </select>
                                    </div>
                                    {!editingItem && (
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Balance Inicial</label>
                                            <input
                                                type="number"
                                                className={styles.input}
                                                value={initialBalance}
                                                onChange={(e) => setInitialBalance(e.target.value)}
                                                step="0.01"
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Nombre</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className={styles.buttonGroup}>
                                <button
                                    type="button"
                                    className={`${styles.button} ${styles.buttonSecondary}`}
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={`${styles.button} ${styles.buttonPrimary}`}
                                >
                                    {editingItem ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
