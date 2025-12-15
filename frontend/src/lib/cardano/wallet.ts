import type { BrowserWallet } from '@meshsdk/core';

export const connectWallet = async (walletName: string = 'eternl') => {
    try {
        // Check if wallet is available
        if (typeof window === 'undefined' || !window.cardano || !window.cardano[walletName]) {
            throw new Error(`${walletName} wallet not found. Please install the ${walletName} browser extension.`);
        }

        const { BrowserWallet } = await import('@meshsdk/core');
        const wallet = await BrowserWallet.enable(walletName);
        return wallet;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Failed to connect ${walletName} wallet`;
        console.error('Error connecting wallet:', errorMessage);
        throw new Error(errorMessage);
    }
};

export const getConnectedWallet = async () => {
    // This is a simplified check. In a real app, you'd manage state better.
    // MeshProvider handles a lot of this automatically.
    return null;
};

export const getWalletBalance = async (wallet: BrowserWallet) => {
    try {
        const utxos = await wallet.getUtxos();
        const address = await wallet.getChangeAddress();
        const networkId = await wallet.getNetworkId();

        console.log('=== Wallet Balance Debug ===');
        console.log('Address:', address);
        console.log('Network ID:', networkId);
        console.log('UTxOs count:', utxos?.length || 0);
        console.log('Full UTxOs:', utxos);

        // Calculate ADA balance
        let adaBalance = 0;
        if (utxos && utxos.length > 0) {
            utxos.forEach(utxo => {
                if (utxo.output.amount) {
                    utxo.output.amount.forEach(token => {
                        if (token.unit === 'lovelace') {
                            adaBalance += parseInt(token.quantity);
                        }
                    });
                }
            });
        }

        const result = {
            address,
            networkId,
            adaLovelace: adaBalance,
            adaAmount: (adaBalance / 1000000).toFixed(2),
            utxoCount: utxos?.length || 0,
            utxos
        };

        console.log('Balance result:', result);
        return result;
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        throw error;
    }
};

export const debugWallet = async () => {
    try {
        console.log('=== Starting Wallet Debug ===');

        if (typeof window === 'undefined' || !window.cardano) {
            console.error('No cardano object found in window');
            return;
        }

        console.log('Window.cardano:', window.cardano);

        if (!window.cardano.eternl) {
            console.error('Eternl wallet not found. Available wallets:', Object.keys(window.cardano));
            return;
        }

        const { BrowserWallet } = await import('@meshsdk/core');
        const wallet = await BrowserWallet.enable('eternl');
        const balance = await getWalletBalance(wallet);

        console.log('Final balance:', balance);
        return balance;
    } catch (error) {
        console.error('Debug error:', error);
        throw error;
    }
};
