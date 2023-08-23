import * as bitcoin from './bitcoin';

export interface OrdsSubscribeParams extends bitcoin.SubscribeParams {
    
}

export function subscribe(p: OrdsSubscribeParams, cb: (block: any) => void) {
    return bitcoin.subscribe(p, cb);
}