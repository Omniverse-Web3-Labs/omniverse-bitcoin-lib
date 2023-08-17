export interface SubscribeParams {
    from: number,
    interval?: number
}

const URL = 'https://btc.getblock.io/14716393-e3ef-4b56-8cd9-9f17fd193684/testnet/';

async function request(method: String, params: Array<any>) {
    let body = {
        jsonrpc: "1.0",
        method,
        params
    }

    let data = {
        method: 'POST',
        body: JSON.stringify(body)
    }
    
    const response = await fetch(URL, data);
    
    const res = await response.json();

    console.log(method, res);

    if (res) {
        return res.result;
    }
}

/**
 * Subscribe block updating
 */
export function subscribe(p: SubscribeParams, cb: (txs: Array<Object>) => void) {
    let height = p.from;
    setInterval(async () => {
        let curHeight = await getBlockCount();
        if (curHeight >= height) {
            let blockHash = await getBlockHash(height);
            let info = await getBlock(blockHash, 2);
            cb(info.tx);
            height++;
        }
    },
    p.interval);
}

export async function getBlockHash(height: number) {
    return await request('getblockhash', [height]);
}

export async function getBlockCount() {
    return await request('getblockcount', []);
}

export async function getBlock(blockhash: string, verbosity: number = 0) {
    return await request('getblock', [blockhash, verbosity]);
}

export async function getRawTransaction(txId: string) {
    return await request('getrawtransaction', [txId, true]);
}

export async function sendrawtransaction(signed: string) {
    return await request('sendrawtransaction', [signed]);
}