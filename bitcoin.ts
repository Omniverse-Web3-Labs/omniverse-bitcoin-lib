export interface SubscribeParams {
    from: number,
    interval?: number
}

let URL = 'https://btc.getblock.io/14716393-e3ef-4b56-8cd9-9f17fd193684/testnet/';
let user = 'a';
let password = 'b';

async function request(method: String, params: Array<any>) {
    let body = {
        jsonrpc: "1.0",
        method,
        params
    }
    
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + Buffer.from(user + ":" + password).toString('base64'));
    headers.set('Content-Type', 'text/plain');

    let data = {
        method: 'POST',
        body: JSON.stringify(body),
        headers
    };

    const response = await fetch(URL, data);
    if (response.status == 200) {
        const res = await response.json();
    
        if (res) {
            return res.result;
        }
    }
    else {
        console.log('Bitcoin request error', method, response.status, response.statusText);
    }
    
    return null;
}

/**
 * Subscribe block updating
 */
export function subscribe(p: SubscribeParams, cb: (block: any) => Promise<void>) {
    let height = p.from;
    let working = false;
    return setInterval(async () => {
        if (working) {
            return;
        }

        try {
            working = true;
            let curHeight = await getBlockCount();
            while (curHeight >= height) {
                console.log('block height', height);
                let blockHash = await getBlockHash(height);
                let info = await getBlock(blockHash, 2);
                await cb(info);
                height++;
            }
            working = false;
        }
        catch (err) {
            console.log('subscribe error', err);
            working = false;
        }
    },
    p.interval? p.interval: 10000);
}

export async function getBlockHash(height: number): Promise<string> {
    return await request('getblockhash', [height]);
}

export async function getBlockCount(): Promise<number> {
    return await request('getblockcount', []);
}

export async function getBlock(blockhash: string, verbosity: number = 0) {
    return await request('getblock', [blockhash, verbosity]);
}

export async function getRawTransaction(txId: string, blockHash: string) {
    return await request('getrawtransaction', [txId, true, blockHash]);
}

export async function sendrawtransaction(signed: string) {
    console.log('sendrawtransaction', signed);
    return await request('sendrawtransaction', [signed]);
}

export async function estimateGas(blockNumber: number = 10) {
    let feeRate = await request('estimatesmartfee', [blockNumber]);
    if (feeRate.errors) {
        feeRate = 10;
    }
    return feeRate;
}

export function setUser(_user: string) {
    user = _user;
}

export function setPassword(_password: string) {
    password = _password;
}

export function setProvider(url: string) {
    URL = url;
}

export function getProvicer() {
    return URL;
}