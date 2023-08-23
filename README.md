# omniverse library for Bitcoin

## Prerequisites

- npm
- node >= v18
- bitcoind
- ord

## Installation

### Bitcoind

Refer to [https://developer.bitcoin.org/examples/testing.html](https://developer.bitcoin.org/examples/testing.html)

### Ord

Refer to [https://github.com/ordinals/ord](https://github.com/ordinals/ord)

### Dependencies of this project

```
npm install
```

## Testing

### Bitcoin

```
npx jest ./test/bitcoin.spec.ts
```

### Ordinals

```
npx jest ./test/ordinals.spec.ts
```

### Inscriptions

Before testing, shutdown running `bitcoind`

```
rm -rf ~/.bitcoin/regtest/
bitcoind -regtest -txindex -rpcuser=a -rpcpassword=b

npx jest ./test/inscription.spec.ts
```

### ODLT

Before testing, shutdown running `bitcoind`

```
rm -rf ~/.bitcoin/regtest/
bitcoind -regtest -txindex -rpcuser=a -rpcpassword=b

npx jest ./test/ODLT.spec.ts
```

## How to use

Refer to [test](./test), especially [ODLT.test.ts](./test/ODLT.spec.ts)