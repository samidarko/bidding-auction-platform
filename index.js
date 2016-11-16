const fs = require('fs');
const events = require('events');

const bidEvent = 'bidEventName', auctionEndEvent = 'auctionEndEvent', auctionTime = 60000, increaseTime = 5000;

function setBidder(name, interval, ee) {
    console.log('create bidder', name, interval);
    const i = setInterval(() => {
        ee.emit(bidEvent, name)
    }, 1000*interval);
    ee.on(auctionEndEvent, () => clearInterval(i));
}

fs.readFile('input.txt', 'utf8', (err, data) => {

    if (err) {
        console.log('error reading input.txt', err);
        return;
    }

    // TODO fix auction time as 60000
    const eventEmitter = new events.EventEmitter();

    // TODO replace by Redis

    var maxBid = 0;
    var lastBidder = '';


    eventEmitter.on(bidEvent, (name) => {
        maxBid += 0.1;
        lastBidder = name;
        console.log(name, maxBid);

    });

    data.split('\n').forEach(line => {
        const arr = line.split(',');
        setBidder(arr[0], parseFloat(arr[2]), eventEmitter);
    });

    function startAuction(ee, startTime) {
        const t = setTimeout(() => {

            // on auction end event we stop
            ee.emit(auctionEndEvent);
            console.log('Final Price', maxBid);
            console.log('Winner', lastBidder);

        }, auctionTime);

        // on bid event we increase the auction time
        ee.on(bidEvent, () => {
            clearTimeout(t);
            startAuction(ee, new Date().getTime() - startTime + increaseTime)
        });
    }

    startAuction(eventEmitter, new Date().getTime());

});
