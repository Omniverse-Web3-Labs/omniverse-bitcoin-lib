import { spawn, execSync } from 'child_process';

export function launchNode() {
    execSync('rm -rf ~/.bitcoin/regtest');
    let bitcoind = spawn('bitcoind', ['-regtest', '-txindex', '-rpcuser=a', '-rpcpassword=b']);

    bitcoind.stdout.on('data', (data) => {
      // console.log(`stdout: ${data}`);
    });
    
    bitcoind.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    bitcoind.on('close', (code) => {
      // console.log(`Process exited with code: ${code}`);
    });

    return bitcoind;
}

export function faucet(address: string) {
    spawn('bitcoin-cli', ['-regtest', '-rpcuser=a', '-rpcpassword=b', 'generatetoaddress', '101', address]);
}

export async function mine(count: number = 1) {
    spawn('bitcoin-cli', ['-regtest', '-rpcuser=a', '-rpcpassword=b', 'generatetoaddress', count.toString(), 'mmasUnUYRcDDEFum76aQHCqP4gzGqSQnZD']);
    await sleep(1);
}

export async function sleep(seconds: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
}