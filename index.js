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
const bidEvent = 'bidEvent', bidderStopEvent = 'bidderStopEvent';

client.on("error", function (err) {
    console.log("Error connecting Redis" + err);
});

/**
 * Set a bidder and emit an event for a give interval
 * @param name
 * @type {string}
 * @param totalBids
 * @type {int}
 * @param interval
 * @type {float}
 * @param ee
 * @type {EventEmitter}
 */
function setBidder(name, totalBids, interval, ee) {

    console.log('create bidder', name, interval);

    function bid(tb) {
        if (tb >= 0) {
            setTimeout(() => {
                ee.emit(bidEvent, name);
                bid(tb-1);
            }, interval);
        } else {
            ee.emit(bidderStopEvent, name);
            console.log(name, 'finished bidding');
        }
    }

    bid(totalBids);

}

/**
 * A class to manage the application state
 * @param ee
 * @type {EventEmitter}
 * @param startTime
 * @type {int}
 * @param auctionTime
 * @type {int}
 * @param increaseTime
 * @type {int}
 * @param rc
 * @type {RedisClient}
 * @param nbBidders
 * @type {int}
 * @constructor
 */
function Auction(ee, startTime, auctionTime, increaseTime, rc, nbBidders) {
    this._ee = ee;
    this._startTime = startTime;
    this._auctionTime = auctionTime;
    this._increaseTime = increaseTime;
    this._maxBidKey = 'maxBid';
    this._lastBidderKey = 'lastBidder';
    this._interval = undefined;
    this._rc = rc;
    this._nbBidders = nbBidders;

    this._ee.on(bidderStopEvent, () => {
        this._nbBidders -= 1;
        console.log('received event no more bidders');
        if (this._nbBidders === 0) {
            console.log('no more bidders');
            clearTimeout(this._interval);
            this._auctionTime = 0;
        }
    });

    this.setLastBidder = (name) => {
        this._rc.set(this._lastBidderKey, name);
        this._rc.get(this._maxBidKey, (err, value) => {
            if (err) {
                console.log('error in setLastBidder', err)
            }
            this._rc.set(this._maxBidKey, parseFloat(value) + 0.1);
            console.log(name, parseFloat(value) + 0.1);
            clearTimeout(this._interval);
            const spentTime = new Date().getTime() - this._startTime;
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
