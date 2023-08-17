import { spawn } from 'child_process';

export function launchNode() {
    spawn('bitcoind', ['-regtest', 'regtest']);
}

export function faucet(address: string) {
    spawn('bitcoin-cli', ['-regtest', 'generatetoaddress', '101', address]);
}