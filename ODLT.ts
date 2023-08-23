import * as inscription from './inscription';

declare global {
    interface BigInt {
        toJSON(this: BigInt, length : number) : string;
    }
}

BigInt.prototype.toJSON = function() { return this.toString() }

export interface ODLTSubscribeParams extends inscription.InscriptionSubscribeParams {
    
}

export interface ERC6358TransactionData {
    nonce: bigint,
    chainId: number,
    initiateSC: string,
    from: string,
    payload: string,
    signature: string,
}

export interface ODLTTransaction {
    tx: ERC6358TransactionData,
    blockHash: string,
    txIndex: number
}

export function sendOmniverseTransaction(omniverseTransaction: ERC6358TransactionData) {
    inscription.inscribe(encode6358Transaction(omniverseTransaction));
}

/**
 * Decode 6358 transaction from an inscription data
 */
export function decode6358Transaction(data: string) {
    return JSON.parse(data);
}

/**
 * Encode 6358 transaction to an inscription data
 */
export function encode6358Transaction(omniverseTransaction: ERC6358TransactionData) {
    return JSON.stringify(omniverseTransaction);
}

/**
 * Subscribe 6358 transactions
 */
 export function subscribe(p: ODLTSubscribeParams, cb: (omniverseTransaction: ODLTTransaction) => void) {
    return inscription.subscribe(p, (data: string, blockHash: string, txIndex: number) => {
        try {
            let originData = Buffer.from(data, 'hex').toString();
            let tx: ERC6358TransactionData = decode6358Transaction(originData);
            let ret: ODLTTransaction = {
                tx,
                blockHash,
                txIndex
            };
            cb(ret);
        }
        catch (e) {
            return;
        }
    });
}