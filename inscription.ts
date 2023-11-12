import * as ordinals from './ordinals';
import * as bitcoin from './bitcoin';
import fs from 'fs';
import { execSync } from 'child_process';

let netType: Network;
let netParam: string = '';

export interface InscriptionSubscribeParams extends ordinals.OrdsSubscribeParams {
    
}

/**
 * Inscribe data on a sat
 */
export function inscribe(data: string) {
    fs.writeFileSync('./.inscription.json', data);
    // Handle the return value here, confirm that it is executed correctly
    let ret;
    switch (netType) {
        case Network.Mainnet: {
            ret = execSync(`ord ${netParam} wallet inscribe --fee-rate 2 .inscription.json`);
            break;
        }
        case Network.Regtest: {
            ret = execSync(`ord ${netParam} --bitcoin-rpc-pass=b --bitcoin-rpc-user=a wallet inscribe --fee-rate 2 .inscription.json`);
            break;
        }
        case Network.Testnet: {
            ret = execSync(`ord ${netParam} --rpc-url ${bitcoin.getProvicer()} --bitcoin-rpc-pass=btc2023 --bitcoin-rpc-user=btc wallet inscribe --fee-rate 2 .inscription.json`);
            break;
        }
    }
    return ret;
}

/**
 * Subscribe inscription transactions
 */
export function subscribe(p: InscriptionSubscribeParams, cb: (data: string[], blockHash: string) => void) {
    return ordinals.subscribe(p, (block) => {
        let rets = [];
        for(let i in block.tx) {
            let tx = block.tx[i];
            let ret = parse(tx);
            if (ret) {
                rets.push(ret);
            }
        }
        cb(rets, block.hash);
    });
}

function getStackData(data: string) {
    let ret = '';
    while (true) {
        if (data.length < 2) {
            return ret;
        }
        let op = parseInt(data.substr(0, 2), 16);
        data = data.substr(2);
        let length = 0;
        if (op >= 1 && op <= 75) {
            length = op;
        }
        else if (op == 76) {
            length = parseInt(data.substr(0, 2), 16);
            data = data.substr(2);
        }
        else if (op == 77) {
            length = parseInt(Buffer.from(data.substr(0, 4), 'hex').reverse().toString('hex'), 16);
            data = data.substr(4);                    
        }
        else if (op == 78) {
            length = parseInt(data.substr(0, 8).split('').reverse().join(''), 16);
            data = data.substr(8);                    
        }
        else {
            return ret;
        }
        ret += data.substr(0, length * 2);
        data = data.substr(length * 2);
    }
}

export function parse(tx: any): string | undefined {
    for (let i in tx.vin) {
        let vin = tx.vin[i];
        if (vin.txinwitness && vin.txinwitness.length == 3) {
            let data = vin.txinwitness[1];
            if (data.substr(0, 2) == '20' &&
            data.substr(66, 54) == 'ac0063036f72640101106170706c69636174696f6e2f6a736f6e00' &&
            data.substr(-2, 2) == '68') {
                let subData = data.substr(120, data.length - 122);
                let inscription = getStackData(subData);
                return inscription;
            }
        }
    }

    return undefined;
}

export function setNetwork(net: Network) {
    netType = net;
    switch (net) {
        case Network.Mainnet: {
            netParam = '';
            break;
        }
        case Network.Regtest: {
            netParam = '-r';
            break;
        }
        case Network.Testnet: {
            netParam = '-t';
            break;
        }
    }
}

export enum Network {
    Regtest = 0,
    Mainnet = 1,
    Testnet = 2
}