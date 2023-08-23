import {bitcoin, ordinals} from "../index";
import * as utils from "./utils";
import * as tinysecp from 'tiny-secp256k1';
import {ECPairFactory} from 'ecpair';
import {Psbt, networks, payments} from 'bitcoinjs-lib';
import assert from 'assert';
const ECPair = ECPairFactory(tinysecp);

describe('ordinals', () => {
    let keypair = ECPair.makeRandom({ network: networks.regtest });
    const pubkey = keypair.publicKey;
    const prikey = keypair.privateKey;
    const p2pkh = payments.p2pkh({pubkey, network: networks.regtest});
    console.log('p2pkh', p2pkh.address);

    beforeAll(async () => {
        utils.launchNode();
        await utils.sleep(3);
        bitcoin.setProvider('http://127.0.0.1:18443')
    },
    10000);
    
    test('subscribe', async () => {
        let blockHeight;
        let interval = ordinals.subscribe({from: 0}, (block) => {
            for (let i in block.tx) {
                blockHeight = block.height;
            }
        });
        await utils.mine();
        let count = await bitcoin.getBlockCount();
        clearInterval(interval);
        console.log('count', count, blockHeight);
        assert(count == blockHeight, 'the latest block not subscribed');
    });
})