const assert = require('assert');
const setBidder = require('./lib').setBidder;
const bidderStopEvent = require('./lib').bidderStopEvent;
const bidEvent = require('./lib').bidEvent;
const sinon = require('sinon');

var clock;

describe('Auction', function() {
    describe('setBidder', function() {
        before(() => clock = sinon.useFakeTimers());
        it('should behave accordingly', function() {
            const ee = {emit: sinon.spy()};
            const name = 'vincent';

            setBidder(name, 2, 10, ee);
            assert.equal(ee.emit.calledOnce, false);
            clock.tick(10);
            assert.equal(ee.emit.calledOnce, true);
            assert.equal(ee.emit.calledWith(bidEvent), true);
            clock.tick(10);
            assert.equal(ee.emit.callCount, 2);
            assert.equal(ee.emit.calledWith(bidEvent), true);
            clock.tick(10);
            // there is one more call to with bidEvent then move to the 4th call
            assert.equal(ee.emit.callCount, 4);
            assert.equal(ee.emit.calledWith(bidderStopEvent), true);

        });
        after(() => clock.restore());
    });
});

