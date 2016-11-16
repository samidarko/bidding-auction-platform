/**
 * Bidding platform for auctions
 * @Author Sami Darko <samidarko@gmail.com> (https://github.com/samidarko)
 * @Date 16 Nov. 2016
 */
const fs = require('fs');
const events = require('events');
const redis = require("redis"),
    client = redis.createClient();

/**
 * Events names
 * @type {string}
 */
const bidEvent = 'bidEventName', auctionEndEvent = 'auctionEndEvent';

client.on("error", function (err) {
    console.log("Error connecting Redis" + err);
});

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
    }, 1000 * interval);
    ee.on(auctionEndEvent, () => clearInterval(i));
}

/**
 * A class to manage the application state
 * @param ee
 * @param startTime
 * @param auctionTime
 * @param increaseTime
 * @param rc
 * @constructor
 */
function Auction(ee, startTime, auctionTime, increaseTime, rc) {
    this._ee = ee;
    this._startTime = startTime;
    this._auctionTime = auctionTime;
    this._increaseTime = increaseTime;
    this._maxBidKey = 'maxBid';
    this._lastBidderKey = 'lastBidder';
    this._interval = undefined;
    this._rc = rc;

    this.setLastBidder = (name) => {
        this._rc.set(this._lastBidderKey, name);
        this._rc.get(this._maxBidKey, (err, value) => {
            if (err) {
                console.log('error in setLastBidder', err)
            }
            this._rc.set(this._maxBidKey, parseFloat(value) + 0.1);
            console.log(name, parseFloat(value) + 0.1);
            clearTimeout(this._interval);
            const spentTime = (new Date().getTime() - this._startTime);
            this._auctionTime += this._increaseTime;
            this._interval = setTimeout(this._callBack, this._auctionTime - spentTime);
        });
    };

    this.start = () => {
        this._rc.set(this._maxBidKey, 0);
        this._rc.set(this._lastBidderKey, '');
        this._interval = setTimeout(this._callBack, this._auctionTime);
    };

    this._callBack = () => {
        // on auction end event we stop
        this._rc.get(this._maxBidKey, (err, total) => {
            if (err) {
                console.log('error in _callBack getting', this._maxBidKey, err)
            }
            this._rc.get(this._lastBidderKey, (err, lastBidder) => {
                if (err) {
                    console.log('error in _callBack getting', this._lastBidderKey, err)
                }
                this._ee.emit(auctionEndEvent);
                this._rc.end(true);
                console.log('Final Price', total);
                console.log('Winner', lastBidder);
                console.log('total time', (new Date().getTime() - this._startTime) / 1000, 'in seconds')
            });
        });
    }

}

fs.readFile('input.txt', 'utf8', (err, data) => {

    if (err) {
        console.log('error reading input.txt', err);
        return;
    }

    const eventEmitter = new events.EventEmitter();
    const auction = new Auction(eventEmitter, new Date().getTime(), 60000, 5000, client);

    eventEmitter.on(bidEvent, (name) => {
        auction.setLastBidder(name);
    });

    data.split('\n').forEach(line => {
        const arr = line.split(',');
        setBidder(arr[0], parseFloat(arr[2]), eventEmitter);
    });

    auction.start();

});
