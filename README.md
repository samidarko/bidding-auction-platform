# Biding Auction Platform

This project shows how to use the node event loop with functions like setTimeout, setInterval and and EventEmitter

## Description

Let’s consider a bidding platform for auctions. Auction starts with 1 min and price of 0$  and the timer counts down to zero.  Every time a user bids the timer increases by 5 seconds and price increases by 0.10$. If the timer goes to zero the last person to place a bid wins.

## Install dependencies

```bash
npm i
```

## How to use

Clone the repository

```bash
node index.js
```

or 

```bash
npm run start
```

## How to test

```bash
npm run test
```
