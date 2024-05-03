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
        p: 'brc-6358',
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
    if (ret.nonce !== undefined && ret.chainId !== undefined && ret.initiateSC !== undefined
        && ret.from !== undefined && ret.payload !== undefined && ret.signature !== undefined) {
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
 export function subscribe(p: ODLTSubscribeParams, cb: (omniverseTransactions: ODLTTransaction[]) => Promise<void>) {
    return inscription.subscribe(p, async (datas: Array<any>, blockHash: string) => {
        try {
            let rets = [];
            for (let i in datas) {
                let data = datas[i];
                let originData = Buffer.from(data, 'hex').toString();
                let tx = decode6358Transaction(originData);
                if (!tx) {
                    return;
                }
                let ret: ODLTTransaction = {
                    tx,
                    blockHash,
                    txIndex: parseInt(i)
                };
                console.debug('ODLTTransaction', ret);
                rets.push(ret);
            }
            // Sort
            rets.sort((o1: ODLTTransaction, o2: ODLTTransaction): number => {
                if (o1.tx.from > o2.tx.from) {
                    return 1;
                }
                else if (o1.tx.from < o2.tx.from) {
                    return -1;
                }
                return 0;
            });
            rets.sort((o1: ODLTTransaction, o2: ODLTTransaction): number => {
                if (o1.tx.from == o2.tx.from) {
                    if (o1.tx.nonce > o2.tx.nonce) {
                        return 1;
                    }
                    else if (o1.tx.nonce < o2.tx.nonce) {
                        return -1;
                    }
                }
                return 0;
            });
            cb(rets);
        }
        catch (e) {
            return;
        }
    });
}