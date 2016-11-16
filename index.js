/**
 * Bidding platform for auctions
 * @Author Sami Darko <samidarko@gmail.com> (https://github.com/samidarko)
 * @Date 16 Nov. 2016
 */
const fs = require('fs');
const events = require('events');

/**
 * Events names
 * @type {string}
 */
const bidEvent = 'bidEventName', auctionEndEvent = 'auctionEndEvent';


/**
 * Set a bidder and emit an event for a give interval
 * @param name
 * @type {string}
 * @param interval
 * @type {float}
 * @param ee
 * @type {EventEmitter}
 */
function setBidder(name, interval, ee) {
    console.log('create bidder', name, interval);
    const i = setInterval(() => {
        ee.emit(bidEvent, name)
    }, 1000*interval);
    ee.on(auctionEndEvent, () => clearInterval(i));
}

/**
 * A class to manage the application state
 * @param ee
 * @param startTime
 * @param auctionTime
 * @param increaseTime
 * @constructor
 */
function Auction(ee, startTime, auctionTime, increaseTime) {
    this._ee = ee;
    this._startTime = startTime;
    this._auctionTime = auctionTime;
    this._increaseTime = increaseTime;
    this._maxBid = 0;
    this._lastBidder = '';
    this._interval = undefined;

    this.setLastBidder = (name) => {
        this._lastBidder = name;
        this._maxBid += 0.1;
        // TODO set redis
        console.log(this._lastBidder, this._maxBid);
        clearTimeout(this._interval);
        const spentTime = (new Date().getTime() - this._startTime);
        this._auctionTime += this._increaseTime;
        this._interval = setTimeout(this._callBack, this._auctionTime - spentTime);
    };

    this.start = () => {
        this._interval = setTimeout(this._callBack, this._auctionTime);
    };

    this._callBack = () => {
        // on auction end event we stop
        this._ee.emit(auctionEndEvent);
        // TODO get from redis
        console.log('Final Price', this._maxBid);
        console.log('Winner', this._lastBidder);
        console.log('total time', (new Date().getTime() - this._startTime)/1000, 'in seconds')
    }

}

fs.readFile('input.txt', 'utf8', (err, data) => {

    if (err) {
        console.log('error reading input.txt', err);
        return;
    }

    const eventEmitter = new events.EventEmitter();
    const auction = new Auction(eventEmitter, new Date().getTime(), 60000, 5000);

    eventEmitter.on(bidEvent, (name) => {
        auction.setLastBidder(name);
    });

    data.split('\n').forEach(line => {
        const arr = line.split(',');
        setBidder(arr[0], parseFloat(arr[2]), eventEmitter);
    });

    auction.start();

});
