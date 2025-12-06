import { BrowserWallet } from '@meshsdk/core';

export const connectWallet = async (walletName: string = 'eternl') => {
    try {
        const wallet = await BrowserWallet.enable(walletName);
        return wallet;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
    }
};

export const getConnectedWallet = async () => {
    // This is a simplified check. In a real app, you'd manage state better.
    // MeshProvider handles a lot of this automatically.
    return null;
};
