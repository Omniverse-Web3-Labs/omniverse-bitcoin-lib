import {bitcoin, inscription, ODLT} from "../index";
import * as utils from "./utils";
import * as tinysecp from 'tiny-secp256k1';
import {ECPairFactory} from 'ecpair';
import {execSync} from "child_process";
import {Psbt, networks, payments} from 'bitcoinjs-lib';
import assert from 'assert';
const ECPair = ECPairFactory(tinysecp);

describe('omniverse', () => {
    let keypair = ECPair.fromPrivateKey(Buffer.from('3f40571e24e19674b80479f74a0256272a13dbcbc8df8da3ba59ea3dfe3abfdf', 'hex'));
    const pubkey = keypair.publicKey;
    const prikey = keypair.privateKey;
    const p2pkh = payments.p2pkh({pubkey, network: networks.regtest});
    console.log('keypair', p2pkh.address);

    let insTx: string;
    let insHeight: number;

    beforeAll(async () => {
        bitcoin.setProvider('http://127.0.0.1:18443')
        // utils.launchNode();
        // await utils.sleep(3);
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

    test('encode 6358 transaction', async () => {
        ODLT.encode6358Transaction({
            nonce: BigInt(0),
            chainId: 0,
            initiateSC: 'contract',
            from: 'from',
            payload: 'payload',
            signature: 'signature',
        });
    });

    test('decode 6356 transaction', async () => {
        let data = ODLT.encode6358Transaction({
            nonce: BigInt(0),
            chainId: 0,
            initiateSC: 'contract',
            from: 'from',
            payload: 'payload',
            signature: 'signature',
        });

        let tx = ODLT.decode6358Transaction(data);
        assert(tx.nonce == BigInt(0));
        assert(tx.chainId == 0);
        assert(tx.initiateSC == 'contract');
        assert(tx.from == 'from');
        assert(tx.payload == 'payload');
        assert(tx.signature == 'signature');
    }, 10000);

    test('send 6358 transaction', async () => {
        ODLT.sendOmniverseTransaction({
            nonce: BigInt(0),
            chainId: 0,
            initiateSC: 'contract',
            from: 'from',
            payload: 'payload',
            signature: 'signature',
        });
        await utils.mine();
    }, 10000);

    test('subscribe', async () => {
        let omniverseTx: ODLT.ERC6358TransactionData | undefined;
        let interval = ODLT.subscribe({from: 0}, (tx: ODLT.ODLTTransaction) => {
            omniverseTx = tx.tx;
        });
        await utils.sleep(10);
        clearInterval(interval);
        console.log('omniverseTx', omniverseTx);
        assert(omniverseTx != undefined, 'omniverse transaction error');
    }, 20000);
})