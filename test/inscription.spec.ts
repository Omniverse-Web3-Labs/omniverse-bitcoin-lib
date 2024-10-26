import {bitcoin, inscription} from "../index";
import * as utils from "./utils";
import * as tinysecp from 'tiny-secp256k1';
import {ECPairFactory} from 'ecpair';
import {execSync} from "child_process";
import {Psbt, networks, payments} from 'bitcoinjs-lib';
import assert from 'assert';
const ECPair = ECPairFactory(tinysecp);

describe('inscription', () => {
    let keypair = ECPair.fromPrivateKey(Buffer.from('3f40571e24e19674b80479f74a0256272a13dbcbc8df8da3ba59ea3dfe3abfdf', 'hex'));
    const pubkey = keypair.publicKey;
    const prikey = keypair.privateKey;
    const p2pkh = payments.p2pkh({pubkey, network: networks.regtest});
    console.log('keypair', p2pkh.address);

    let insTx: string;
    let insHeight: number;

    beforeAll(async () => {
        bitcoin.setProvider('http://127.0.0.1:18443')
        utils.launchNode();
        await utils.sleep(3);
        inscription.setNetwork(inscription.Network.Regtest);
        // clear data
        execSync('rm -rf ~/.local/share/ord/regtest');
        // create an account for creating inscriptions
        execSync('ord -r --bitcoin-rpc-pass=b --bitcoin-rpc-user=a wallet create');
        let accountStr = execSync('ord -r --bitcoin-rpc-pass=b --bitcoin-rpc-user=a wallet receive');
        let account = JSON.parse(accountStr.toString()).address;
        console.log('account', account);
        // get some BTC for gas fee
        utils.faucet(account);
        await utils.sleep(4);
    },
    100000);

    test('inscribe', async () => {
        let height = await bitcoin.getBlockCount();
        let data = JSON.stringify({
            text: 'This is an inscription'
        });
        let ret = inscription.inscribe(data);
        console.debug('inscription result', ret.toString());
        insTx = JSON.parse(ret.toString()).reveal;
        await utils.mine();
        let newHeight = await bitcoin.getBlockCount();
        insHeight = newHeight;
        console.log('block height', height, newHeight);
        assert(newHeight == height + 1);
    }, 10000);

    test('get inscribed data', async () => {
        let hash = await bitcoin.getBlockHash(insHeight);
        let tx = await bitcoin.getRawTransaction(insTx, hash);
        console.debug('ins tx', tx, tx.vin);
    }, 10000);

    test('subscribe', async () => {
        let insc: string = '';
        inscription.subscribe({from: 0, interval: 1}, async (data, blockHash, blockHeight) => {
            insc = data[0].data;
        });
        await utils.sleep(10);
        console.log('insc', Buffer.from(insc, 'hex').toString());
        assert(Buffer.from(insc, 'hex').toString() == '{"text":"This is an inscription"}', 'inscription error');
    }, 20000);
})