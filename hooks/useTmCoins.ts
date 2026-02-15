import { useState, useEffect, useCallback } from 'react';
import { authService, Contribuicao, Pagamento, SaldoResponse, AuthError } from '../services/authService';

// Constantes de referência
export const TM_COINS = {
    POR_PARAGEM: 25,
    POR_LINHA: 100,
    POR_KZ: 10, // 10 coins = 1 Kz
};

export const VALORES_OPERADORA: Record<string, number[]> = {
    africell: [200, 500, 1000],
    unitel: [300, 400, 500, 800, 1000],
    express: [1000, 2000, 5000],
};

// Calcular coins necessários para um valor em Kz
export const coinsNecessarios = (valorKz: number) => valorKz * TM_COINS.POR_KZ;

// Calcular valor em Kz a partir de coins
export const valorEmKz = (coins: number) => Math.floor(coins / TM_COINS.POR_KZ);

export function useTmCoins() {
    const [saldo, setSaldo] = useState(0);
    const [valorKz, setValorKz] = useState(0);
    const [totalContribuicoes, setTotalContribuicoes] = useState(0);
    const [contribuicoes, setContribuicoes] = useState<Contribuicao[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSaldo = useCallback(async () => {
        const saldoData = await authService.getMeuSaldo();
        if (saldoData) {
            setSaldo(saldoData.tmCoins);
            setValorKz(saldoData.valorKz);
            setTotalContribuicoes(saldoData.totalContribuicoes);
        }
    }, []);

    const fetchContribuicoes = useCallback(async (pagina = 1, porPagina = 5) => {
        const result = await authService.getMinhasContribuicoes(pagina, porPagina);
        if (result) {
            setContribuicoes(result.dados);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([fetchSaldo(), fetchContribuicoes()]);
        } finally {
            setLoading(false);
        }
    }, [fetchSaldo, fetchContribuicoes]);

    const solicitarPagamento = useCallback(async (metodo: string, valorKz: number, telefone: string) => {
        const result = await authService.solicitarPagamento(metodo, valorKz, telefone);
        // Refresh saldo após pagamento
        await fetchSaldo();
        return result;
    }, [fetchSaldo]);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            fetchAll();
        } else {
            setLoading(false);
        }
    }, [fetchAll]);

    return {
        saldo,
        valorKz,
        totalContribuicoes,
        contribuicoes,
        loading,
        solicitarPagamento,
        refresh: fetchAll,
        refreshSaldo: fetchSaldo,
    };
}
