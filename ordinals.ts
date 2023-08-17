import * as bitcoin from './bitcoin';

export interface OrdsSubscribeParams extends bitcoin.SubscribeParams {
    
}

export function subscribe(p: OrdsSubscribeParams, cb: (txs: Array<Object>) => void) {
    bitcoin.subscribe(p, cb);
}