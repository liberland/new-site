var request = require("request");

var prices = {};
function updatePrice(name) {
    request("https://bittrex.com/api/v1.1/public/getticker?market=" + name, (err, res, ticker) => {
        try {
           prices[name.substr(4).toLowerCase()] = JSON.parse(ticker).result.Last;
        }catch(e){}
    });
}

function getCoinsToUpdate() {
   request("https://bittrex.com/api/v1.1/public/getmarketsummaries", (err, res, data) => {
        try {
            data = JSON.parse(data);
            for (var i in data.result) {
                if (data.result[i].MarketName.substr(0, 3) === "BTC") {
                    updatePrice(data.result[i].MarketName);
                }
                if (data.result[i].MarketName === "USDT-BTC") {
                    request("https://bittrex.com/api/v1.1/public/getticker?market=" + data.result[i].MarketName, (err, res, ticker) => {
                        prices.usd = JSON.parse(ticker).result.Last;
                    });
                }
            }
        }catch(e){}
    });
}
setInterval(getCoinsToUpdate, 10000);
getCoinsToUpdate();

async function handleMsg(msg, chatInterface) {
    msg = msg.filteredMsg;
    if (msg[0] === "bittrex") {
        try {
            if (!(msg[1])) {
                msg[1] = "iop";
            }
            var token = msg[1];
            if (token === "btc") {
                return "The price of a BTC is: " + (Math.round(prices.usd * 100) / 100) + " USD.";
            }
            if ((token === "usd") || (token === "usdt")) {
                return "The price of a USD is: " + (Math.round(Math.pow(10, 8) * (1 / prices.usd)) / Math.pow(10, 8)) + " BTC."
            }

            if (prices[token]) {
                return "The price of " + token.toUpperCase() + " is: " + prices[token] + " BTC, AKA " + (Math.round(((prices[token.toLowerCase()] / 1) * prices.usd) * 100) / 100) + " USD."
            }
            return "That token isn't recognized.";
        }catch(e){}
    }
}

module.exports = {
    handleMsg: handleMsg
};
