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

export interface BRC6358TransactionData {
    p: string,
    op: string,
    tick: string,
    amt: string,
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
    let payload = JSON.parse(omniverseTransaction.payload);
    let op = '';
    if (payload.op == 0) {
        op = 'transfer';
    }
    else if (payload.op == 1) {
        op = 'mint';
    }
    else if (payload.op == 2) {
        op = 'burn';
    }
    let data: BRC6358TransactionData = {
        p: 'brc-20',
        op: op,
        tick: 'SKYW',
        amt: payload.amount,
        nonce: omniverseTransaction.nonce,
        chainId: omniverseTransaction.chainId,
        initiateSC: omniverseTransaction.initiateSC,
        from: omniverseTransaction.from,
        payload: omniverseTransaction.payload,
        signature: omniverseTransaction.signature,
    };

    inscription.inscribe(encode6358Transaction(data));
}

/**
 * Decode 6358 transaction from an inscription data
 */
export function decode6358Transaction(data: string) : undefined | ERC6358TransactionData {
    let ret = JSON.parse(data);
    if (ret.nonce && ret.chainId && ret.initiateSC && ret.from && ret.payload && ret.signature) {
        return ret;
    }

    return undefined;
}

/**
 * Encode 6358 transaction to an inscription data
 */
export function encode6358Transaction(omniverseTransaction: BRC6358TransactionData) {
    return JSON.stringify(omniverseTransaction);
}

/**
 * Subscribe 6358 transactions
 */
 export function subscribe(p: ODLTSubscribeParams, cb: (omniverseTransaction: ODLTTransaction) => void) {
    return inscription.subscribe(p, (data: string, blockHash: string, txIndex: number) => {
        try {
            let originData = Buffer.from(data, 'hex').toString();
            let tx = decode6358Transaction(originData);
            if (!tx) {
                return;
            }
            let ret: ODLTTransaction = {
                tx,
                blockHash,
                txIndex
            };
            console.debug('ODLTTransaction', ret);
            cb(ret);
        }
        catch (e) {
            return;
        }
    });
}