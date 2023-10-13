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

    let data = {
        method: 'POST',
        body: JSON.stringify(body),
        headers
    };

    const response = await fetch(URL, data);
    
    const res = await response.json();

    // console.log(method, res);

    if (res) {
        return res.result;
    }
}

/**
 * Subscribe block updating
 */
export function subscribe(p: SubscribeParams, cb: (block: any) => void) {
    let height = p.from;
    return setInterval(async () => {
        let curHeight = await getBlockCount();
        while (curHeight >= height) {
            let blockHash = await getBlockHash(height);
            let info = await getBlock(blockHash, 2);
            cb(info);
            height++;
        }
    },
    p.interval? p.interval: 1000);
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
    return await request('sendrawtransaction', [signed]);
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