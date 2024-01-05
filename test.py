var Binance = require('binance-api-node').default;


const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA

var bullishengulfingpattern = require('technicalindicators').bullishengulfingpattern;
var bullishharami = require('technicalindicators').bullishharami;
var bullishharamicross = require('technicalindicators').bullishharamicross;

var bullishmarubozu = require('technicalindicators').bullishmarubozu;
var bullishspinningtop = require('technicalindicators').bullishspinningtop;

const bullishhammer = require('technicalindicators').bullishhammer;
var threewhitesoldiers = require('technicalindicators').threewhitesoldiers;
const tweezerbottom = require('technicalindicators').tweezerbottom;

var bb = require('technicalindicators').BollingerBands;

var express = require('express');
var app = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";
const HaID = "197407951"
//const bot = new TelegramBot(token,{polling:true});

const token_warning = "6037137720:AAFBEfCG9xWY4K_3tx7VSZzMXGgmt9-Zdog"
const bot = new TelegramBot(token_warning, { polling: true });


const token_check_log_ = "6166932215:AAEbZ28_7Um4n3K64DOOA1BRisiSTg9siBQ"
const bot_check_log = new TelegramBot(token_check_log_, { polling: true });


const { StochasticRSI, ema } = require('technicalindicators');

//const client = Binance().options({
//
//	apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
//	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
//	useServerTime:true,kdj
//
//});
const client = new Binance({
    apiKey: '6aAHxmZy3L491NNOpOzts4PaQcxtcXliFxXg2ACtRW9cUw5zbBHKAHwt9HJ7DO4c',
    apiSecret: 'lBCPfrYD9D9OeokixySh5yMNSaJgRQoYzM9gkXxMoB7JxUCyMHPkrCCw5RsvXb22',
    useServerTime: true,
    recvWindow: 1000, // Set a higher recvWindow to increase response timeout


});
var log_str = "";

app.get('/', function (request, response) {
    var result = 'App is running \n';
    response.send(result + log_str);

}).listen(app.get('port'), function () {
    console.log('App is running, server is listening on port ', app.get('port'));
});


// VARIABLES - Binance API
let buyOrderInfo = null;
let sellOrderInfo = null;
let INDEX_USDT = 11;
const PRICE_UPDATE_PERIOD = 5000; // Price update times varies a lot
const ORDER_UPDATE_PERIOD = 3000;

let coin_name = 'ETHUSDT';
let INDEX_COINT = 2;

// Pauses execution for a specified amount of time
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Synchronizes with the Binance API server
const sync = async () => {
    console.log('SYNCING ...');
    let serverTime = await client.time();
    console.log('serverTime: ', serverTime);
    let timeDifference = serverTime % 60000;
    console.log('timeDifference: ', timeDifference);
    await wait(timeDifference); // Waits 1s more to make sure the prices were updated
    console.log('SYNCED WITH BINANCE SERVER! \n');
}

let ema10 = 0;
let ema20 = 0;
let ema50 = 0;

let timeRequest = "30m";
let prices;

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

var MACD = require('technicalindicators').MACD;

requestTime = "30m"
var total_coin_phanky = 0
var coinDivergenceList = []
so_nen_check_giao_cat = 20
currentSymbols = []



const getLowe2LeverTimeRequest = (timeRequest) => {
    var higherTimeRequest = timeRequest
    if (timeRequest == "15m") {
        higherTimeRequest = "3m"
    } else if (timeRequest == "30m") {
        higherTimeRequest = "5m"
    } else if (timeRequest == "1h") {
        higherTimeRequest = "15m"
    } else if (timeRequest == "2h") {
        higherTimeRequest = "30m"
    }
    else if (timeRequest == "4h") {
        higherTimeRequest = "1h"
    }
    else if (timeRequest == "6h") {
        higherTimeRequest = "1h"
    }
    else if (timeRequest == "8h") {
        higherTimeRequest = "2h"
    }

    return higherTimeRequest;

}

const getHigherTimeRequest = (timeRequest) => {
    var higherTimeRequest = timeRequest
    if (timeRequest == "15m") {
        higherTimeRequest = "30m"
    } else if (timeRequest == "30m") {
        higherTimeRequest = "1h"
    } else if (timeRequest == "1h") {
        higherTimeRequest = "2h"
    } else if (timeRequest == "2h") {
        higherTimeRequest = "4h"
    }
    else if (timeRequest == "4h") {
        higherTimeRequest = "6h"
    }
    else if (timeRequest == "6h") {
        higherTimeRequest = "8h"
    }
    else if (timeRequest == "8h") {
        higherTimeRequest = "12h"
    }

    return higherTimeRequest;

}




const checkNenRutRauBbDuoi = async (coinName2, timeRequest) => {

    let priceDatas = await client.candles({ symbol: coinName2, limit: 1000, interval: timeRequest })
    var prices = []


    // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

    //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for (var i = 0; i < priceDatas.length; i++) {
        // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }
    var lower2LevelbbInput = {
        period: 20,
        values: prices,
        stdDev: 2
    }

    const bbResult = bb.calculate(lower2LevelbbInput)
    var resultLength2 = lower2LevelBbResult.length
    if (priceDatas[0].lower < lower2LevelBbResult[0].lower && priceDatas[0].close > lower2LevelBbResult[0].lower) {
        console.log(timeRequest + "  buy pass 3 " + coinName2 + "  lowe2LeverTimeRequest  " + lowe2LeverTimeRequest)
        bot.sendMessage(chatId, timeRequest + " BUY pass 3" + coinName2 + "   : ")
    }

}

const checkNenRutRau = async (coinName2, timeRequestNumber, lowerTimeRequestNumber, numLowerCandle) => {
    let priceDatas = await client.candles({ symbol: coinName2, limit: 1000, interval: timeRequestNumber + "m" })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

    // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

    //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for (var i = 0; i < priceDatas.length; i++) {
        // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    for (var i = 0; i < priceDatas.length; i++) {
        // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var min30 = Math.min(...last30Prices)
    var min10 = Math.min(...last10Prices)

    // console.log("min 10 "+ min10 + "  min30  "+ min30)

    var bbInput = {
        period: 20,
        values: prices,
        stdDev: 2
    }
    var ema10 = EMA.calculate({ period: 7, values: prices })
    var ema20 = EMA.calculate({ period: 20, values: prices })
    var ema34 = EMA.calculate({ period: 34, values: prices })
    var ema50 = EMA.calculate({ period: 50, values: prices })
    var ema89 = EMA.calculate({ period: 89, values: prices })
    var ema200 = EMA.calculate({ period: 200, values: prices })
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    var numCandle = numLowerCandle / (timeRequestNumber / lowerTimeRequestNumber);

    if (numCandle > 2) {
        if (ema10[ema10.length - 1] > ema200[ema200.length - 1]) {
            //   console.log(timeRequestNumber+"  higher NUmcandle  " + numCandle)
            for (var i = 0; i < numCandle; i++) {
                var openPrice = priceDatas[priceDatas.length - 1 - i].open;
                var closePrice = priceDatas[priceDatas.length - 1 - i].close;
                var lowPrice = priceDatas[priceDatas.length - 1 - i].low;

                var minPrice = (openPrice > closePrice) ? closePrice : openPrice;
                var delta = Math.abs(openPrice - closePrice)
                if (delta > 0) {
                    var tyle = (minPrice - lowPrice) / (Math.abs(openPrice - closePrice));

                    if (tyle > 2 && (lowPrice < (bbResult[bbResult.length - 1 - i]).lower) && (minPrice > bbResult[bbResult.length - 1 - i].lower)) {
                        if ((priceDatas[priceDatas.length - 1 - (i + 1)].close < priceDatas[priceDatas.length - 1 - (i + 1)].open) &&
                            (priceDatas[priceDatas.length - 1 - (i + 2)].close < priceDatas[priceDatas.length - 1 - (i + 2)].open)) {

                            console.log(coinName2 + " timeRequestNumber  " + timeRequestNumber + "  LowertimeRequestNumber  " + lowerTimeRequestNumber + "m  ỉndex " + i + " tyle " + tyle + "  delta " + delta + " minPrice " + minPrice + " lowPrice " + lowPrice)
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}
class RedRange {
    constructor(start, stop, delta) {
        this.startIndex = start;
        this.stopIndex = stop;
        this.deltaPrice = delta;
    }
}

const findEmaOverForBuy = async (coinName2, timeRequestNumber) => {
    let priceDatas = await client.candles({ symbol: coinName2, limit: 1000, interval: timeRequestNumber + "m" })
    var openPrices = []
    var closePrices = []
    var deltaPriceBuffer = []
    var redRangeBuffer = []
    var last10Prices = []
    var last5Prices = []



    // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

    //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for (var i = 0; i < priceDatas.length; i++) {
        // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        closePrices.push(Number(priceDatas[i].close))
        openPrices.push(Number(priceDatas[i].open))
    }

    var ema10 = EMA.calculate({ period: 10, values: closePrices })
    var ema20 = EMA.calculate({ period: 20, values: closePrices })
    var ema34 = EMA.calculate({ period: 34, values: closePrices })
    var ema50 = EMA.calculate({ period: 50, values: closePrices })
    var ema89 = EMA.calculate({ period: 89, values: closePrices })
    var ema200 = EMA.calculate({ period: 200, values: closePrices })

    try {
        for (var i = 1; i < priceDatas.length - 1; i++) {
            if (ema10[ema10.length - 1 - i] > ema200[ema200.length - 1 - i]) {
                break;
            }
            if (priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open) {
                var startIndex = i;

                //  console.log("i start "+ i + "close " + priceDatas[priceDatas.length-1-i].close + " open " + priceDatas[priceDatas.length-1-i].open)
                // cay nen hien tai la cay nen do, hoac cay nen trc va sau deu la do nhưng cay nen xanh nam bao gon trong cay nen do trc do
                while ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)
                    || (
                        (priceDatas[priceDatas.length - 1 - i].close >= priceDatas[priceDatas.length - 1 - i].open)
                        && ((priceDatas[priceDatas.length - 1 - i].open >= priceDatas[priceDatas.length - 1 - (i + 1)].close) && (priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - (i + 1)].open))
                        && (priceDatas[priceDatas.length - 1 - (i + 1)].close <= priceDatas[priceDatas.length - 1 - (i + 1)].open)
                        && (priceDatas[priceDatas.length - 1 - (i - 1)].close <= priceDatas[priceDatas.length - 1 - (i - 1)].open)
                    )
                ) {

                    i = i + 1;
                }
                var stopIndex = i;
                var deltaIndex = stopIndex - startIndex;
                var deltaPrice = (priceDatas[priceDatas.length - 1 - stopIndex].open - priceDatas[priceDatas.length - 1 - startIndex].close)

                if (deltaIndex >= 3) {
                    if (deltaPrice > 0) {
                        deltaPriceBuffer.push(deltaPrice);
                        console.log(timeRequestNumber + " m ,startIndex " + startIndex + " stopIndex " + stopIndex)
                        redRangeBuffer.push(new RedRange(startIndex, stopIndex, deltaPrice))
                    }

                }
                // if((stopIndex - startIndex) >=3)
                // {
                //     console.log("i delta "+ (stopIndex - startIndex));
                // }
            }
        }

        for (var i = 0; i < redRangeBuffer.length; i++) {
            if ((redRangeBuffer[i].deltaPrice < redRangeBuffer[i + 1].deltaPrice)
                && (redRangeBuffer[i + 1].deltaPrice < redRangeBuffer[i + 2].deltaPrice)
                && (redRangeBuffer[i + 2].deltaPrice < redRangeBuffer[i + 3].deltaPrice)
            ) {
                console.log(coinName2 + " time" + timeRequestNumber + "m  , index0 " + redRangeBuffer[i].startIndex)
            }
            // console.log(coinName2 + " time" +timeRequestNumber +"m  , startIindex "+ redRangeBuffer[i].startIndex + " stopIndex  "+ redRangeBuffer[i].stopIndex)
        }
        // for(var i =0; i < deltaPriceBuffer.length;i++)
        // {
        //    if( (deltaPriceBuffer[i] <  deltaPriceBuffer[i+1]) 
        //    && (deltaPriceBuffer[i+1] <  deltaPriceBuffer[i+2])
        //    && (deltaPriceBuffer[i+2] <  deltaPriceBuffer[i+3])
        //    )
        //    {
        //         console.log(coinName2 + " time" +timeRequestNumber +"m  , index "+ i + "  "+ deltaPriceBuffer[i])
        //    }
        // }


    } catch (err) {
        console.log(timeRequest + "  " + coinName2 + "  " + err + "\n");
        //    continue;

    }


    return false;

}
const findEmaOverForSell = async (coinName2, timeRequest) => {
    let priceDatas = await client.candles({ symbol: coinName2, limit: 1000, interval: timeRequest })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

    // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

    //    console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for (var i = 0; i < priceDatas.length; i++) {
        //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var min30 = Math.min(...last30Prices)
    var min10 = Math.min(...last10Prices)

    // console.log("min 10 "+ min10 + "  min30  "+ min30)

    var bbInput = {
        period: 20,
        values: prices,
        stdDev: 2
    }

    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    var ema10 = EMA.calculate({ period: 10, values: prices })
    var ema20 = EMA.calculate({ period: 20, values: prices })
    var ema34 = EMA.calculate({ period: 34, values: prices })
    var ema50 = EMA.calculate({ period: 50, values: prices })
    var ema89 = EMA.calculate({ period: 89, values: prices })
    var ema200 = EMA.calculate({ period: 200, values: prices })

    var macdInput = {
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    }

    var macdData2 = MACD.calculate(macdInput)
    // console.log("MACD "+ JSON.stringify(macdData2))

    // for(var i =0; i < 2;i++){
    //     console.log(timeRequest+"  i  " +i+" macdData2 "+ macdData2[macdData2.length-1-i].MACD + " signal "+ macdData2[macdData2.length-1-i].signal )
    // }

    var lastMacdUnderSignal = []
    var lastMacdOverSignal = []

    for (var i = 0; i < macdData2.length - 200; i++) {
        if ((macdData2[(macdData2.length - 1) - i].MACD > macdData2[(macdData2.length - 1) - i].signal)
            && (macdData2[(macdData2.length - 1) - (i + 1)].MACD < macdData2[(macdData2.length - 1) - (i + 1)].signal)
        ) {
            lastMacdUnderSignal.push(i)
        }
    }

    for (var i = 0; i < macdData2.length - 200; i++) {
        if ((macdData2[(macdData2.length - 1) - i].MACD < macdData2[(macdData2.length - 1) - i].signal)
            && (macdData2[(macdData2.length - 1) - (i + 1)].MACD > macdData2[(macdData2.length - 1) - (i + 1)].signal)
        ) {
            lastMacdOverSignal.push(i)
        }
    }



    if ((macdData2[(macdData2.length - 1)].MACD < macdData2[(macdData2.length - 1)].signal)
        && (macdData2[(macdData2.length - 2)].MACD > macdData2[(macdData2.length - 2)].signal)
    ) {
        try {
            // console.log(timeRequest+ " pass 0 "+ coinName2)
            var macd_max0 = 0
            var macd_max1 = 0
            var price_max0 = 0
            var price_max1 = 0

            var price_min_1 = 0
            var price_min1_arr = []

            var price_max0_arr = []
            var price_max1_arr = []
            var macd_max0_arr = []
            var macd_max1_arr = []


            for (var i = 0; i < lastMacdUnderSignal[0]; i++) {
                price_max0_arr.push(priceDatas[priceDatas.length - 1 - i].close)
                macd_max0_arr.push(macdData2[(macdData2.length - 1 - i)].MACD)
            }

            for (var i = lastMacdOverSignal[1]; i < lastMacdUnderSignal[1]; i++) {
                price_max1_arr.push(priceDatas[priceDatas.length - 1 - i].close)
                macd_max1_arr.push(macdData2[(macdData2.length - 1 - i)].MACD)
            }

            price_max0 = Math.max(...price_max0_arr)
            price_max1 = Math.max(...price_max1_arr)
            macd_max0 = Math.max(...macd_max0_arr)
            macd_max1 = Math.max(...macd_max1_arr)

            for (var i = 0; i < lastMacdOverSignal[2]; i++) {
                price_min1_arr.push(priceDatas[priceDatas.length - 1 - i].close)
                //  console.log(coinName2+ "   :  price  " + priceDatas[priceDatas.length-1-i].close)
            }

            price_min_1 = Math.min(...price_min1_arr)
            var min1_index = -1;

            for (var i = 0; i < lastMacdOverSignal[2]; i++) {
                if (priceDatas[priceDatas.length - 1 - i].close == price_min_1) {
                    min1_index = i;
                }

            }

            //    var max1_index = price_max1_arr.indexOf(Math.max( ...price_max1_arr))

            var price_min_1_b = 0
            var price_min1_arr_b = []

            for (var i = lastMacdOverSignal[1]; i < lastMacdUnderSignal[1]; i++) {
                price_min1_arr_b.push(priceDatas[priceDatas.length - 1 - i].close)

            }

            price_min_1_b = Math.min(...price_min1_arr_b)

            //  console.log(timeRequest+ "  sell pass 0 "+ coinName2+ "  price_max_1 "+ price_min_1 + "   :  max1_index  " + min1_index)

        } catch (err) {
            console.log(timeRequest + "  " + coinName2 + "  " + err + "\n");
            //    continue;

        }
        if ((ema10[ema10.length - 1 - min1_index] < ema20[ema20.length - 1 - min1_index])
            && (ema20[ema20.length - 1 - min1_index] < ema34[ema34.length - 1 - min1_index])
            && (ema34[ema34.length - 1 - min1_index] < ema50[ema50.length - 1 - min1_index])
            && (ema50[ema50.length - 1 - min1_index] < ema89[ema89.length - 1 - min1_index])
            //  &&(price_max_1 == price_max_1_b)
        ) {

            if ((macd_max0 < macd_max1)
                && (price_max0 > price_max1)
                && ((macdData2[(macdData2.length - 1 - lastMacdUnderSignal[1])].MACD < 0) && (macdData2[(macdData2.length - 1 - lastMacdOverSignal[1])].MACD > 0))
            ) {
                try {
                    if (pt > 0.55) {
                        var pt = ((priceDatas[priceDatas.length - 1].close / ema89[ema89.length - 1]) - 1) * 100

                        console.log(timeRequest + " Sell  " + coinName2
                            + " PT " + ema89[ema89.length - 1] + "  %Pt " + pt)

                        bot.sendMessage(chatId, timeRequest + " Sell  " + coinName2 +
                            " PT " + ema89[ema89.length - 1] + "  %Pt " + pt)
                    }
                } catch (err) {
                    console.log(" err 2" + err)
                }
            }
        }

    }


}
const updatePrice = async (timeRequest) => {

    try {

        let accountInfo = await client.accountInfo();

        currentSymbols = await client.futuresOpenOrders()

        //	prices = await client.prices();
        prices = await client.futuresPrices();
        let pricesArr = Object.keys(prices);
        total_coin_phanky = 0
        coinDivergenceList = []


        //	currentSymbols = await client.futuresOpenOrders()
        //  currentSymbols = []
        //  currentSymbols = await client.futuresOpenOrders()
        // console.log(currentSymbols);

        //   var test15m =  await  updatePriceForBuy(coinName2, "15m")
        //          var test30m =  await  checkBUSDUSDTForBuy("BUSDUSDT", "30m")
        //          await wait(100);
        //       var test1h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "1h")
        //       await wait(100);
        //       var test2h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "2h")
        //       await wait(100);
        //       var test4h =  await  checkBUSDUSDTForBuy("BUSDUSDT", "4h")
        //       await wait(100);

        //       var test30m =  await  checkBUSDUSDTForBuy("USDCUSDT", "30m")
        //       await wait(100);
        //    var test1h =  await  checkBUSDUSDTForBuy("USDCUSDT", "1h")
        //    await wait(100);
        //    var test2h =  await  checkBUSDUSDTForBuy("USDCUSDT", "2h")
        //    await wait(100);
        //    var test4h =  await  checkBUSDUSDTForBuy("USDCUSDT", "4h")
        //    await wait(100);

        //    //       var test30m =  await  updatePriceForBuy(coinName2, "15m")
        //    var test30m =  await  findEmaOverForUSDTBuy("USDCUSDT", "30m")
        //    await wait(100);
        // var test1h =  await  findEmaOverForUSDTBuy("USDCUSDT", "1h")
        // await wait(100);
        // var test2h =  await  findEmaOverForUSDTBuy("USDCUSDT", "2h")
        // await wait(100);
        // var test4h =  await  findEmaOverForUSDTBuy("USDCUSDT", "4h")
        // await wait(100);


        // // //       var test30m =  await  updatePriceForBuy(coinName2, "15m")
        // var test30m =  await  findEmaOverForUSDTBuy("BUSDUSDT", "30m")
        // await wait(100);
        // var test1h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "1h")
        // await wait(100);
        // var test2h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "2h")
        // await wait(100);
        // var test4h =  await  findEmaOverForUSDTBuy("BUSDUSDT", "4h")
        // await wait(100);


        for (var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
        // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
        {
            var coinName2 = pricesArr[coinIndex].toString();
            // var coinName2 = top20[coinIndex].symbol ;
            //   console.log("coinName  " + coinName2)
            var coinName2 = "HIFIUSDT"
            if (coinName2.includes("USDT") && (coinName2 != "COCOSUSDT")) {
                try {
                    var timeRequestNumber = 5;

                    //  var test5m = await  findEmaOverForBuy(coinName2, 5)
                    var test15m = await findEmaOverForBuy(coinName2, 15)


                } catch (err) {
                    //        console.log(coinName2+"  "+ err + "\n");
                    continue;

                }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

            }
            await wait(400);
            break;
        }


    } catch (err) {
        //	 log_str += err + "  " + coinName + "\n";
        console.log(err + "\n");
    }
}

(async function main() {

    let buySuccess = null;

    //	await updateEMA();
    //bot.sendMessage(chatId," =============Start 1 vong requets ======" );
    while (true) {
        log_str = "";
        //	bot.sendMessage(chatId," =============Start 1 vong requets ======" );
        try {

            //	await sell();

        } catch (e) {
            console.log("Error for sell", e);
            process.exit(-1);
        }

        try {

            await updatePrice("4h");
            //			     await updateEMA("15m");
            //				await updateEMA("30m");
            //				await updateEMA("1h");
            await sync();
        } catch (e) {
            console.log('Erorr Update ema', e);
            process.exit(-1);
        }

        // console.log("ema10 " + ema10 + "ema20 " + ema20 + "ema50 " + ema50);
        // // console.log("ema20 " + ema20);
        // // console.log("ema50 " + ema50);

        // //buySuccess = await buy();
        // if(ema10 > ema20 && ema10 > ema50
        // 	&& ema20 > ema50)
        // {
        // 	try{

        // 	//	buySuccess = await buy();
        // 	} catch (e) {
        // 		console.log('ERROR IN buy(): ', e);
        // 		console.log('RESUMING OPERATIONS\n');
        // 		continue;
        // 	}
        // 	// buy
        // }else{
        // 	console.log("Doi mua");
        // }
        // if(buySuccess === 'failure') continue; 
        //	bot.sendMessage(chatId," =============Ket thuc 1 vong requets ======" );
        await wait(10000);
    }

})();




































