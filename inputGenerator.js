const fs = require('fs');
const readline = require('readline');
const uuid = require('node-uuid');
const _ = require('lodash');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const isNumber = (value) => /^\d+\.?\d?$/.test(value);

const config = {};

console.log('This script will output an input.txt ;) ');

function makeLine(name, bid, freq) {
    return name + ',' + bid + ',' + freq + '\n';
}

function output(config) {
    console.log(config);

    fs.open(config.fileName, 'w+', (err, fd) => {
        if (err) {
            console.log('error opening file', config.fileName, 'with error', err);
            rl.close();
            process.exit();
        } else {

            function loop(iter) {
                if (iter === 0) {
                    rl.close();
                    process.exit();

                } else fs.write(fd,
                    makeLine(uuid.v4(), _.random(config.minBids, config.maxBids), _.random(config.minFreq, config.maxFreq)),
                    null, null, () => loop(iter-1))
            }

            loop(config.nbLines)
        }
    });

}

function selectNumberOfLines(answer) {
    config.nbLines = isNumber(answer) && parseInt(answer) > 0 ? parseInt(answer) : 10;
    rl.question('How many minimum bids (default: 10)', selectMinBid);
}

function selectMinBid(answer) {
    config.minBids = isNumber(answer) && parseInt(answer) > 0 ? parseInt(answer) : 10;
    rl.question('How many maximum bids (default: 200)', selectMaxBid);
}

function selectMaxBid(answer) {
    config.maxBids = isNumber(answer) && parseInt(answer) > 2 ? parseInt(answer) : 200;
    rl.question('What is min frequency bid (default: 0.05)', selectMinFreq);
}

function selectMinFreq(answer) {
    config.minFreq = isNumber(answer) && parseFloat(answer) <= 0 ? parseFloat(answer) : 0.05;
    rl.question('What is max frequency bid (default: 0.20)', selectMaxFreq);
}

function selectMaxFreq(answer) {
    config.maxFreq = isNumber(answer) && parseFloat(answer) <= 0.05 ? parseFloat(answer) : 0.2;
    rl.question('Choose the file name (default: input.txt)', selectFile);
}

function selectFile(answer) {
    config.fileName = answer ? answer : 'input.txt';
    output(config)
}

rl.question('How many lines (default: 10)', selectNumberOfLines);

