const Web3 = require('web3');
const fs = require('fs');

const url = 'https://apis-sj.ankr.com/a6a75f49914943b1b69bc7419157d57a/bf9c1140c61657a3580dbaaca47cb036/eth/fast/main'  // url string

const web3 = new Web3(new Web3.providers.HttpProvider(url));

async function fetchLatestBlockData() {
    results = {}
    try {
        const blockNumber = await web3.eth.getBlockNumber()
        // const blockNumber = 13144141
        if (!blockNumber) {
            console.log("Couldn't fetch block number");
        }
        console.log(blockNumber);
        results.latestBlock = blockNumber
        // await getBlocks(results, blockNumber)
        const blocks = await getBlocks(blockNumber)
        results.blocks = blocks
        writeToFile(results)
    } catch (err) {
        console.log(err);
    }
}

async function getBlocks(blockNumber) {
    var blocks = {}
    for (let i = blockNumber; i > blockNumber - 20; i--) {
        sleep(1000) // avoid rate limit
        console.log(`fetching block ${blockNumber}`);
        try {
            const block = await web3.eth.getBlock(blockNumber)

            // couldn't get batch transactions working
            // blocks.blockNumber = []
            // var batch = new web3.BatchRequest()
            // block.transactions.forEach(txHash => {
            //     batch.add(web3.eth.getTransactionReceipt.request(txHash, (err, receipt) => {
            //         if (!err) {
            //             blocks.blockNumber.push(receipt)
            //         } else {
            //             console.log(`Error on ${txHash}.`, err);
            //         }
            //     }))
            // });
            // batch.execute()

            var j = 0
            const transactionReceipts = await Promise.allSettled(block.transactions.map(txHash => {
                sleep(60) // avoid rate limit
                j += 1
                if (j % 100 == 0) {
                    sleep(3000)
                }
                console.log(j, txHash);

                return web3.eth.getTransactionReceipt(txHash)
                    .then(res => res)
                    .catch(err => ({ txHash: txHash, error: err}))
            }))
            .then(results => {
                return results.map(res => {
                    console.log(res);
                    if (res.status == "rejected") {
                        return { txHash: res.value.txHash, error: 'rate limit exceeded' }
                    } else {
                        return res.value
                    }
                })
            })
            .catch(error => {
                console.log(error);
            })
            blocks[blockNumber] = transactionReceipts
        } catch (err) {
            console.log(err);
        }
    }
    return blocks
}

function sleep(ms) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > ms){
      break;
    }
  }
}

function writeToFile(obj) {
    const json = JSON.stringify(obj);
    fs.writeFile('transaction_data.json', json, 'utf8', err => {
        if (err) {
            console.log("Error writing to file");
        } else {
            console.log("Success!")
        }
    });
}

fetchLatestBlockData()