import * as inscription from './inscription';

export interface ODLTSubscribeParams extends inscription.InscriptionSubscribeParams {
    
}

export interface ERC6358TransactionData {
    nonce: bigint,
    chainId: number,
    initiateSC: string,
    from: string,
    payload: Buffer,
    signature: Buffer,
}

export interface ODLTTransaction {
    tx: ERC6358TransactionData,
    blockHash: string,
    txIndex: number
}

/**
 * Decode 6358 transaction from an inscription data
 */
export function decode6358Transaction() {

}

/**
 * Encode 6358 transaction to an inscription data
 */
export function encode6358Transaction() {

}

/**
 * Subscribe 6358 transactions
 */
 export function subscribe(p: ODLTSubscribeParams, cb: (txs: Array<ODLTTransaction>) => void) {
    inscription.subscribe(p, (txs: Array<Object>) => {
        for (let i in txs) {
            let transaction = txs[i];
            // ...
            cb([]);
        }
    });
}