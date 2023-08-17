import * as ordinals from './ordinals';
import fs from 'fs';
import { execSync } from 'child_process';

export interface InscriptionSubscribeParams extends ordinals.OrdsSubscribeParams {
    
}

/**
 * Inscribe data on a sat
 */
export function inscribe(data: string) {
    fs.writeFileSync('./.inscription', data);
    // Handle the return value here, confirm that it is executed correctly
    let ret = execSync('ord wallet inscribe --fee-rate 2 .inscription');
    console.debug('inscribe', ret);
}

/**
 * Subscribe inscription transactions
 */
 export function subscribe(p: InscriptionSubscribeParams, cb: (txs: Array<Object>) => void) {
    ordinals.subscribe(p, cb);
}