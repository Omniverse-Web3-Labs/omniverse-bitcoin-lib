import { spawn, execSync } from 'child_process';

export function launchNode() {
    execSync('rm -rf ~/.bitcoin/regtest');
    spawn('bitcoind', ['-regtest', '-txindex', '-rpcuser=a', '-rpcpassword=b']);
}

export function faucet(address: string) {
    spawn('bitcoin-cli', ['-regtest', '-rpcuser=a', '-rpcpassword=b', 'generatetoaddress', '101', address]);
}

export async function mine(count: number = 1) {
    spawn('bitcoin-cli', ['-regtest', '-rpcuser=a', '-rpcpassword=b', 'generatetoaddress', count.toString(), 'mmasUnUYRcDDEFum76aQHCqP4gzGqSQnZD']);
    await sleep(2);
}

export async function sleep(seconds: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
}