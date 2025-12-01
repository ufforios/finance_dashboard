'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Account, FinancialSummary } from './types';
import { dataService } from './dataService';

interface FinanceContextType {
    transactions: Transaction[];
    accounts: Account[];
    summary: FinancialSummary | null;
    loading: boolean;
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [txns, accts, summ] = await Promise.all([
                dataService.getTransactions(),
                dataService.getAccounts(),
                dataService.getSummary()
            ]);

            setTransactions(txns);
            setAccounts(accts);
            setSummary(summ);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        await dataService.addTransaction(transaction);
        await refreshData();
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        await dataService.updateTransaction(id, updates);
        await refreshData();
    };

    const deleteTransaction = async (id: string) => {
        await dataService.deleteTransaction(id);
        await refreshData();
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <FinanceContext.Provider
            value={{
                transactions,
                accounts,
                summary,
                loading,
                addTransaction,
                updateTransaction,
                deleteTransaction,
                refreshData
            }}
        >
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}
