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


function Auction(ee, startTime, auctionTime) {
    this._ee = ee;
    this._startTime = startTime;
    this._auctionTime = auctionTime;
    this._maxBid = 0;
    this._lastBidder = '';
    this._interval = undefined;

    this.setLastBidder = (name) => {
        this._lastBidder = name;
        this._maxBid += 0.1;
        console.log(this._lastBidder, this._maxBid);
        clearTimeout(this._interval);
        this._interval = setTimeout(this._callBack, this._auctionTime - (new Date().getTime() - this._startTime + increaseTime));
    };

    this.start = () => {
        this._interval = setTimeout(this._callBack, this._auctionTime);
    };

    this._callBack = () => {
        // on auction end event we stop
        this._ee.emit(auctionEndEvent);
        console.log('Final Price', this._maxBid);
        console.log('Winner', this._lastBidder);
    }

}

fs.readFile('input.txt', 'utf8', (err, data) => {

    if (err) {
        console.log('error reading input.txt', err);
        return;
    }

    const eventEmitter = new events.EventEmitter();
    const auction = new Auction(eventEmitter, new Date().getTime(), auctionTime);

    eventEmitter.on(bidEvent, (name) => {
        auction.setLastBidder(name);
    });

    data.split('\n').forEach(line => {
        const arr = line.split(',');
        setBidder(arr[0], parseFloat(arr[2]), eventEmitter);
    });

    auction.start();

});
