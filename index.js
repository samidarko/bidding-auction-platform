/**
 * Bidding platform for auctions
 * @Author Sami Darko <samidarko@gmail.com> (https://github.com/samidarko)
 * @Date 16 Nov. 2016
 */
const fs = require('fs');
const events = require('events');
const redis = require("redis"),
    client = redis.createClient();
const setBidder = require('./lib').setBidder;
const bidEvent = require('./lib').bidEvent;
const Auction = require('./lib').Auction;


client.on("error", function (err) {
    console.log("Error connecting Redis" + err);
});


fs.readFile('input.txt', 'utf8', (err, data) => {

    if (err) {
        console.log('error reading input.txt', err);
        return;
    }

    const eventEmitter = new events.EventEmitter(), auctionTime = 60000, increaseTime = 5000;

    eventEmitter.on(bidEvent, (name) => {
        auction.setLastBidder(name);
    });

    // connect the bidders and extract how many they are
    const nbBidders = data.split('\n').reduce((acc, line) => {
        const arr = line.split(',');
        setBidder(arr[0], parseInt(arr[1]), parseFloat(arr[2]), eventEmitter);
        return acc+1;
    }, 0);

    const auction = new Auction(eventEmitter, new Date().getTime(), auctionTime, increaseTime, client, nbBidders);

    auction.start();

});

