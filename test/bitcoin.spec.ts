import {bitcoin} from "../index";
import * as utils from "./utils";
import * as tinysecp from 'tiny-secp256k1';
import {ECPairFactory} from 'ecpair';
import {execSync} from "child_process";
import {Psbt, networks, payments} from 'bitcoinjs-lib';
import assert from 'assert';
const ECPair = ECPairFactory(tinysecp);

describe('bitcoin', () => {
    let keypair = ECPair.makeRandom({ network: networks.regtest });
    const pubkey = keypair.publicKey;
    const prikey = keypair.privateKey;
    const p2pkh = payments.p2pkh({pubkey, network: networks.regtest});
    console.log('p2pkh', p2pkh.address);

    let height: number;
    let topHash: string;
    let blockHash: string;
    let txid: string;

    beforeAll(async () => {
        utils.launchNode();
        await utils.sleep(3);
        bitcoin.setProvider('http://127.0.0.1:18443')
    },
    10000);

    test('faucet', async () => {
        utils.faucet(p2pkh.address!);
        await utils.sleep(3);
    });

    test('get block count', async () => {
        let count = await bitcoin.getBlockCount();
        height = count;
        assert(count > 0);
    });

    describe('get block hash', () => {
        test('block not exist', async () => {
            let hash = await bitcoin.getBlockHash(1100000);
            assert(hash == null);
        });

        test('block exists', async () => {
            let hash = await bitcoin.getBlockHash(height);
            topHash = hash;
            assert(hash != '');
        });
    });

    describe('get block data', () => {
        test('block not exits', async () => {
            let block = await bitcoin.getBlock('', 2);
            assert(block == null);
        });
        
        test('block exits', async () => {
            let block = await bitcoin.getBlock(topHash, 2);
            assert(block.tx.length > 0);
            txid = block.tx[0].txid;
            blockHash = topHash;
        });
    });

    describe('get raw transaction', () => {
        test('not exists', async () => {
            let tx = await bitcoin.getRawTransaction('', '');
            assert(tx == null);
        });

        test('exists', async () => {
            let tx = await bitcoin.getRawTransaction(txid, blockHash);
            assert(tx != null);
        });
    });

    test('send raw transaction', async () => {
        let hash = await bitcoin.getBlockHash(height - 100);
        let block = await bitcoin.getBlock(hash, 2);
        let tx = block.tx[0];
        const psbt = new Psbt({ network: networks.regtest });
        psbt.addInput({
            hash: tx.txid,
            index: 0,
            nonWitnessUtxo: Buffer.from(tx.hex, 'hex')
        });

        psbt.addOutput({
            address: p2pkh.address!,
            value: tx.vout[0].value * (10 ** 8) - 1000
        });

        psbt.signInput(0, keypair);
        let rawTransaction = psbt.finalizeAllInputs().extractTransaction().toHex();
        let ret = await bitcoin.sendrawtransaction(rawTransaction);
        
        assert(ret != null);
    });

    test('subscribe', async () => {
        let blockHeight;
        bitcoin.subscribe({from: 0, interval: 1}, async (block) => {
            for (let i in block.tx) {
                blockHeight = block.height;
            }
        });
        await utils.mine();
        let count = await bitcoin.getBlockCount();
        console.log('count', count, blockHeight);
        assert(count == blockHeight, 'the latest block not subscribed');
    });
})