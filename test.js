var Binance = require('binance-api-node').default;
// const Binance2 = require('node-binance-api');
//const ema = require('trading-indicator').ema;

const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA

var bullishengulfingpattern = require('technicalindicators').bullishengulfingpattern;
var morningstar = require('technicalindicators').morningstar;
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

const { StochasticRSI, ema, macd, fibonacciretracement } = require('technicalindicators');

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
// const client2 = new Binance2().options({
//     apiKey: '6aAHxmZy3L491NNOpOzts4PaQcxtcXliFxXg2ACtRW9cUw5zbBHKAHwt9HJ7DO4c',
//     apiSecret: 'lBCPfrYD9D9OeokixySh5yMNSaJgRQoYzM9gkXxMoB7JxUCyMHPkrCCw5RsvXb22',
//     useServerTime: true,
//     recvWindow: 1000, // Set a higher recvWindow to increase response timeout
// });

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

var curentSymbolOrder = ""
var curentTimeOfSymbolOrder = ""
var curentCommandTypeOfSymbolOrder = ""

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    console.log(" receive new message " + msg.text)
    const myArray = msg.text.split("_");
    if (myArray.length > 0) {
        curentSymbolOrder = myArray[0]
        curentTimeOfSymbolOrder = myArray[1]
        curentCommandTypeOfSymbolOrder = myArray[2]
    }
    else {
        curentSymbolOrder = ""
        curentTimeOfSymbolOrder = ""
        curentCommandTypeOfSymbolOrder = ""
    }
    // for(var i = 0; i < myArray.length; i++)
    // {
    //     console.log("  i " + myArray[i])
    // }
    bot.sendMessage(chatId, " receive new message " + msg.text)
})

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

function fibonacciForClosingPrice(previousClose = 0.0, currentClose = 0.0) {

    const ratio = 0.618; // Tỷ lệ Fibonacci
    var fibonacciValue = 0.0;
    fibonacciValue = Number(currentClose) - (ratio * (Number(currentClose) - Number(previousClose)));
    //  console.log("xxx "+previousClose + "  "+ currentClose  + " fb "+ fibonacciValue)
    return Number(fibonacciValue);
}

function calculateFibonacciExtension(low, high, pullback) {
    // Calculate the Fibonacci extension using the pullback
    return Number(high) + 1.618 * (Number(pullback) - Number(low));
}

function isBullishPinbar(candle) {
    // Kiểm tra xem cây nến có phải là pinbar tăng không
    const bodyLength = Math.abs(candle.open - candle.close);
    const upperShadowLength = candle.high - Math.max(candle.open, candle.close);
    const lowerShadowLength = Math.min(candle.open, candle.close) - candle.low;

    const isBullish = candle.close > candle.open;
    const hasLongUpperShadow = lowerShadowLength >= bodyLength * 2;

    return isBullish && hasLongUpperShadow;
}

const find3TimeRedFutureForBuy = async (coinName2, timeRequest) => {

    try {
        var priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: timeRequest })
        var openPrices = []
        var closePrices = []

        var last10Prices = []
        var last5Prices = []

        //   console.log(" priceDatas[priceDatas.length-1].closeTime   "+ typeof( priceDatas[priceDatas.length-1].close));

        // console.log(coinName2+ " priceDatas " +  "  timeRequest "+ timeRequest)
        for (var i = 0; i < priceDatas.length; i++) {
            //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            closePrices.push(Number(priceDatas[i].close))
            openPrices.push(Number(priceDatas[i].open))
        }

        var ema10 = EMA.calculate({ period: 10, values: closePrices })
        var ema20 = EMA.calculate({ period: 20, values: closePrices })
        var ema34 = EMA.calculate({ period: 34, values: closePrices })
        var ema50 = EMA.calculate({ period: 50, values: closePrices })
        var ema89 = EMA.calculate({ period: 89, values: closePrices })
        var ema200 = EMA.calculate({ period: 200, values: closePrices })

        var bbInput = {
            period: 20,
            values: closePrices,
            stdDev: 2
        }
        const bbResult = bb.calculate(bbInput)
        var lastestEma10UnderEma89 = -1;


        for(var i = 0; i < ema10.length-1;i++)
        {
            if((ema10[ema10.length-1-i] > ema89[ema89.length-1-i]) &&(ema10[ema10.length-1-i-1] < ema89[ema89.length-1-i-1]))
            {
                lastestEma10UnderEma89 = i;
         //       console.log("pass 0    "+ lastestEma10UnderEma89)
                break;
            }
        }

        // for (var idx = 0; idx < priceDatas.length; idx++) {
        // check nhung thoi diem ma ema10 lon hon ema89
        var idx = 0;
        if (ema10[ema10.length - 1 - idx] > ema89[ema89.length - 1 - idx]) {
            for (var i = idx; i < ema10.length; i++) {
                if ((ema10[ema10.length - 1 - (i + 1)] < ema89[ema89.length - 1 - (i + 1)])
                    && (ema10[ema10.length - 1 - (i)] > ema89[ema89.length - 1 - (i)])
                ) {

                    lastestEma10UnderEma89 = i;
                    //    subData.push(priceDatas[priceDatas.length-1-i].close)
                    break;
                }
            }
        }

        for (var idx = 0; idx < lastestEma10UnderEma89; idx++) {
            if (ema10[ema10.length - 1 - idx] > ema89[ema89.length - 1 - idx])
             {
                // tim diem gan nhat ema10 cat ema89
                var subData = []
                for (var i = idx; i < lastestEma10UnderEma89; i++) {
                    subData.push(priceDatas[priceDatas.length - 1 - i].close);
                }


                var maxPrice = Math.max(...subData)
                var maxPriceFromEma10OverEma89Index = -1
                // tim diem co gia tri cao nhat tu khi ema10 > ema89
                for (var i = idx; i < lastestEma10UnderEma89; i++) {
                    //  console.log(" priceDatas[priceDatas.length-1-i].close " + priceDatas[priceDatas.length-1-i].close + "  maxPrice  "+ maxPrice + " lastestEma10UnderEma89 "+ lastestEma10UnderEma89)
                    if (priceDatas[priceDatas.length - 1 - i].close == maxPrice) {
                        //   console.log("==================================")
                        maxPriceFromEma10OverEma89Index = i;
                    }
                }

                //  console.log(" maxPriceFromEma10OverEma89Index " + maxPriceFromEma10OverEma89Index + "  maxPrice  "+ maxPrice)

                // check xem tu cay nen hien tai den cay nen cao nhat xem co  3 lan co 3 cay nen do lien tiep ko
                var totalTimeHas3ContinousRedCandle = 0;
                var beginIndexArr = []

                for (var i = idx; i < maxPriceFromEma10OverEma89Index; i++) {
                    try {
                        var hasCanleBlue = false;
                        // tim cac lan co 3 cay nen do lien tiep
                        // nen gap cay nen xanh thi bo qua

                        if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)) {
                            var begin_index = i;
                            var hasCandleBlue = false;

                            while (hasCandleBlue == false) {
                                if ((priceDatas[priceDatas.length - 1 - i].close < priceDatas[priceDatas.length - 1 - i].open)) {
                                    i = i + 1;
                                } else {
                                    hasCandleBlue = true;
                                    break;
                                }
                            }

                            var end_index = i;
                            hasCanleBlue = false;

                            // neu so cay nen do lien tiep > 2 thi add vao mang 
                            // them 1 dieu kien nua la cay nen ket thuc cua 3 cay nen do la cay nen xanh co gia dong cua > ema10
                            if ((end_index - begin_index >= 3)
                                && (priceDatas[priceDatas.length - 1 - end_index].close > ema10[ema10.length - 1 - end_index])
                            ) {
                                totalTimeHas3ContinousRedCandle += 1
                                beginIndexArr.push(begin_index)
                                //     console.log(" i " + i + " begin " + begin_index + " end " + end_index)
                            }
                        }





                    } catch (error) {
                        console.log("error 3" + error)
                    }
                }

                // so lan co 3 cay nen do lien tiep it nhat la 3
                if (totalTimeHas3ContinousRedCandle >= 3) {

                    var oldestEma10UnderEma20 = -1;
                    /// tim cay nen cu nhat ma em10 cat ema89 tu duoi len
                    // phuc vu cho check viec vungd au tien khi ema10 cat len
                    for (var i = idx; i < lastestEma10UnderEma89; i++) {
                        if ((ema10[ema10.length - 1 - i] > ema20[ema20.length - 1 - i])
                            && (ema10[ema10.length - 1 - (i + 1)] < ema20[ema20.length - 1 - (i + 1)])
                        ) {
                            oldestEma10UnderEma20 = i;
                           // break;
                           
                        }
                    }


                    var oldestEma10CutEma20AboveToUnder = -1;
                    /// tim cay nen gan nhat ma em10 cat ema20 tu duoi len
                    for (var i = idx; i < lastestEma10UnderEma89; i++) {
                        if ((ema10[ema10.length - 1 - i] < ema20[ema20.length - 1 - i])
                            && (ema10[ema10.length - 1 - (i + 1)] > ema20[ema20.length - 1 - (i + 1)])
                        ) {
                            oldestEma10CutEma20AboveToUnder = i;
                            break;
                        }
                    }

                    var findMinPriceArr =[]
                    var hasPriceUnderEma89 = false;
                    // find min 
                    for(var i = idx; i <  oldestEma10CutEma20AboveToUnder; i++ )
                    {
                        if(priceDatas[priceDatas.length-1-i].low <= ema89[ema89.length-1-i])
                        {
                            hasPriceUnderEma89 = true;
                           // console.log(" i "+ i + " oldestEma10CutEma20AboveToUnder   "+ oldestEma10CutEma20AboveToUnder + " oldestEma10UnderEma20 "+ oldestEma10UnderEma20)
                            break;
                        }
                    }



                    // neu ema10 cat ema20 thi vao lenh cung dc, sl duoi chan cay nen xanh hien tai
                    if ((ema10[ema10.length - 1 - idx] > ema20[ema20.length - 1 - idx])
                        && (ema10[ema10.length - 1 - (idx + 1)] < ema20[ema20.length - 1 - (idx + 1)])
                    ) {
                        //  if (oldestEma10UnderEma20 == idx)
                        // diem ma ema10 cat ema20 nam giua idx hien tai vs lan thu 3 trc do co 3 nen do
                        if (((oldestEma10UnderEma20 < beginIndexArr[2]) && (idx < oldestEma10UnderEma20))
                        && ( hasPriceUnderEma89 == true)
                        ) 
                        {

                            var lowestPriceFromIdx = 0
                            priceLowArr = []
                            priceMaxArr = []

                            for (var m = 0; m < idx; m++) {
                                priceLowArr.push(priceDatas[priceDatas.length - 1 - m].low)
                                priceMaxArr.push(priceDatas[priceDatas.length - 1 - m].high)
                            }

                            var lowsestPrice = Math.min(...priceLowArr);
                            var highsetPrice = Math.max(...priceMaxArr)
                            var slPercenCheck = 100 * (1 - lowsestPrice / priceDatas[priceDatas.length - 1 - idx].close);
                            var tpPercenCheck = 100 * ((highsetPrice / priceDatas[priceDatas.length - 1 - idx].close) - 1);

                            var slPercen = 5;
                            if (timeRequest == "5m") {
                                slPercen = 1;
                            } else if (timeRequest == "15m") {
                                slPercen = 2;
                            } else if (timeRequest == "30m") {
                                slPercen = 5;
                            }
                            var slPrice = priceDatas[priceDatas.length - 1 - idx].close * (100 - slPercen) / 100.0;

                            var tp_1_Percen = 1.5;
                            if (timeRequest == "5m") {
                                tp_1_Percen = 1.5;
                            } else if (timeRequest == "15m") {
                                tp_1_Percen = 4.9;
                            } else if (timeRequest == "30m") {
                                tp_1_Percen = 9.9;
                            }
                            var tp1Price = priceDatas[priceDatas.length - 1 - idx].close * (100 - tp_1_Percen) / 100.0;


                            var logData = coinName2 + " buy  == cat==  " + timeRequest
                                // + " total3ContinousRedCandle " + totalTimeHas3ContinousRedCandle
                                + " idx " + idx
                                + " sl " + slPrice
                                + " tp1Price " + tp1Price
                                + "  lowsest %  " + slPercenCheck
                                + " tp % " + tpPercenCheck
                            // + " begin_index " + beginIndexArr[0]
                            // + " begin_index1 " + beginIndexArr[1]
                            // + " begin_index2 " + beginIndexArr[2]
                            //    + " maxPriceFromEma10OverEma89Index " + maxPriceFromEma10OverEma89Index
                            //  + " price " + priceDatas[priceDatas.length - 1 - idx].close
                            //   + " oldestEma10UnderEma20 " + oldestEma10UnderEma20;

                            console.log(logData)

                            if (idx < 5) {
                                bot.sendMessage(chatId, coinName2 + "  " + timeRequest
                                    + " buy "
                                    + " idx " + idx
                                    + " sl " + slPrice
                                )
                                bot.sendMessage(chatId, coinName2 + "_" + timeRequest + "_" + "buy")
                            }
                        }
                    }

                    // tim
                    // nen 0 xanh
                    // nen (idx + 1) do
                    // 3 nen 3 4 5 xanh
                    // them 1 dieu kien nua la tu idx den cat ema10 ema89 la lan dau tien co ema10 cat ema20 tu duoi len 
                    if ((priceDatas[priceDatas.length - 1 - idx].close > priceDatas[priceDatas.length - 1 - idx].open)
                        && (priceDatas[priceDatas.length - 1 - idx].close > priceDatas[priceDatas.length - 1 - (idx + 1)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 1)].close < priceDatas[priceDatas.length - 1 - (idx + 1)].open)

                        && (priceDatas[priceDatas.length - 1 - (idx + 2)].close > priceDatas[priceDatas.length - 1 - (idx + 2)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 3)].close > priceDatas[priceDatas.length - 1 - (idx + 3)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 4)].close > priceDatas[priceDatas.length - 1 - (idx + 4)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 1)].close >= (priceDatas[priceDatas.length - 1 - (idx + 2)].open))
                        // cay nen tang gia, cho cay nen 2 than nen lon hon hoac bangc ay nen 3
                        // cay nen do co gia dong cua lon hon 1/2 cay nen xanh trc do
                        //   && (priceDatas[priceDatas.length - 1 - (idx + 1)].close >= 0.5*( priceDatas[priceDatas.length - 1 - (idx + 2)].open+ priceDatas[priceDatas.length - 1 - (idx + 2)].close))
                    ) {
                        if (((oldestEma10UnderEma20 < beginIndexArr[2]) && (idx < oldestEma10UnderEma20))) {


                            priceLowArr = []
                            priceMaxArr = []
                            for (var m = 0; m < idx; m++) {
                                priceLowArr.push(priceDatas[priceDatas.length - 1 - m].low)
                                priceMaxArr.push(priceDatas[priceDatas.length - 1 - m].high)
                            }

                            var lowsestPrice = Math.min(...priceLowArr);
                            var highsetPrice = Math.max(...priceMaxArr)
                            var slPercenCheck = 100 * (1 - lowsestPrice / priceDatas[priceDatas.length - 1 - idx].close);
                            var tpPercenCheck = 100 * ((highsetPrice / priceDatas[priceDatas.length - 1 - idx].close) - 1);


                            var slPercen = 5;
                            if (timeRequest == "5m") {
                                slPercen = 1;
                            } else if (timeRequest == "15m") {
                                slPercen = 2;
                            } else if (timeRequest == "30m") {
                                slPercen = 5;
                            }
                            var slPrice = priceDatas[priceDatas.length - 1 - idx].close * (100 - slPercen) / 100.0;

                            var tp_1_Percen = 1.5;
                            if (timeRequest == "5m") {
                                tp_1_Percen = 1.5;
                            } else if (timeRequest == "15m") {
                                tp_1_Percen = 4.9;
                            } else if (timeRequest == "30m") {
                                tp_1_Percen = 9.9;
                            }
                            var tp1Price = priceDatas[priceDatas.length - 1 - idx].close * (100 - tp_1_Percen) / 100.0;


                            var logData = coinName2 + " buy == retest == " + timeRequest
                                //+ " total3ContinousRedCandle " + totalTimeHas3ContinousRedCandle
                                + " idx " + idx
                                + "  sl " + slPrice
                                + " tp1Price " + tp1Price
                                + "  lowsest %  " + slPercenCheck
                                + " tp % " + tpPercenCheck
                            // + " begin_index " + beginIndexArr[0]
                            // + " begin_index1 " + beginIndexArr[1]
                            // + " begin_index2 " + beginIndexArr[2]

                            console.log(logData)

                            if (idx < 5) {
                                bot.sendMessage(chatId, coinName2 + "  " + timeRequest
                                    + " ema10 cut ema20 "
                                    + " idx " + idx
                                    + "  sl " + slPrice
                                    + " tp1Price " + tp1Price
                                )
                                bot.sendMessage(chatId, coinName2 + "_" + timeRequest + "_" + "buy")
                            }
                        }
                    }
                }

            }
        }
    } catch (e) {
        console.log("error 2 " + e + " " + coinName2)
    }

}

const find3TimeRedFutureForSell = async (coinName2, timeRequest) => {

    try {
        var priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: timeRequest })
        var openPrices = []
        var closePrices = []

        var last10Prices = []
        var last5Prices = []

        //   console.log(" priceDatas[priceDatas.length-1].closeTime   "+ typeof( priceDatas[priceDatas.length-1].close));

        //  console.log(coinName2+ " priceDatas " +  "  timeRequest "+ timeRequest)
        for (var i = 0; i < priceDatas.length; i++) {
            //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            closePrices.push(Number(priceDatas[i].close))
            openPrices.push(Number(priceDatas[i].open))
        }

        var ema10 = EMA.calculate({ period: 10, values: closePrices })
        var ema20 = EMA.calculate({ period: 20, values: closePrices })
        var ema34 = EMA.calculate({ period: 34, values: closePrices })
        var ema50 = EMA.calculate({ period: 50, values: closePrices })
        var ema89 = EMA.calculate({ period: 89, values: closePrices })
        var ema200 = EMA.calculate({ period: 200, values: closePrices })

        var bbInput = {
            period: 20,
            values: closePrices,
            stdDev: 2
        }
        const bbResult = bb.calculate(bbInput)
        var lastestEma10OverEma89 = -1;


        // for (var idx = 0; idx < priceDatas.length; idx++) {
        // check nhung thoi diem ma ema10 lon hon ema89
        var idx = 0;
        if (ema10[ema10.length - 1 - idx] < ema89[ema89.length - 1 - idx]) {
            for (var i = idx; i < ema10.length; i++) {
                if ((ema10[ema10.length - 1 - (i + 1)] > ema89[ema89.length - 1 - (i + 1)])
                    && (ema10[ema10.length - 1 - (i)] < ema89[ema89.length - 1 - (i)])
                ) {

                    lastestEma10OverEma89 = i;
                    //    subData.push(priceDatas[priceDatas.length-1-i].close)
                    break;
                }
            }
        }

        for (var idx = 0; idx < lastestEma10OverEma89; idx++) {
            if (ema10[ema10.length - 1 - idx] < ema89[ema89.length - 1 - idx]) {
                // tim diem gan nhat ema10 cat ema89
                var subData = []
                for (var i = idx; i < lastestEma10OverEma89; i++) {
                    subData.push(priceDatas[priceDatas.length - 1 - i].close);
                }

                var minPrice = Math.min(...subData)
                var minPriceFromEma10UnderEma89Index = -1
                // tim diem co gia tri cao nhat tu khi ema10 > ema89
                for (var i = idx; i < lastestEma10OverEma89; i++) {
                    //  console.log(" priceDatas[priceDatas.length-1-i].close " + priceDatas[priceDatas.length-1-i].close + "  maxPrice  "+ maxPrice + " lastestEma10UnderEma89 "+ lastestEma10UnderEma89)
                    if (priceDatas[priceDatas.length - 1 - i].close == minPrice) {
                        //   console.log("==================================")
                        minPriceFromEma10UnderEma89Index = i;
                    }
                }

                //  console.log(" maxPriceFromEma10OverEma89Index " + maxPriceFromEma10OverEma89Index + "  maxPrice  "+ maxPrice)

                // check xem tu cay nen hien tai den cay nen cao nhat xem co  3 lan co 3 cay nen do lien tiep ko
                var totalTimeHas3ContinousBlueCandle = 0;
                var beginIndexArr = []

                for (var i = idx; i < minPriceFromEma10UnderEma89Index; i++) {
                    try {
                        var hasCanleRed = false;
                        // tim cac lan co 3 cay nen do lien tiep
                        // nen gap cay nen xanh thi bo qua

                        if ((priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - i].open)) {
                            var begin_index = i;
                            var hasCandleRed = false;

                            while (hasCandleRed == false) {
                                if ((priceDatas[priceDatas.length - 1 - i].close > priceDatas[priceDatas.length - 1 - i].open)) {
                                    i = i + 1;
                                } else {
                                    hasCandleRed = true;
                                    break;
                                }
                            }

                            var end_index = i;
                            hasCandleRed = false;

                            // neu so cay nen do lien tiep > 2 thi add vao mang 
                            // them 1 dieu kien nua la cay nen ket thuc cua 3 cay nen do la cay nen xanh co gia dong cua > ema10
                            if ((end_index - begin_index >= 3)
                                && (priceDatas[priceDatas.length - 1 - end_index].close < ema10[ema10.length - 1 - end_index])
                            ) {
                                totalTimeHas3ContinousBlueCandle += 1
                                beginIndexArr.push(begin_index)
                                //     console.log(" i " + i + " begin " + begin_index + " end " + end_index)
                            }
                        }





                    } catch (error) {
                        console.log("error 3" + error)
                    }
                }

                if (totalTimeHas3ContinousBlueCandle >= 3) {

                    var oldestEma10OverEma20 = -1;

                    for (var i = idx; i < lastestEma10OverEma89; i++) {
                        if ((ema10[ema10.length - 1 - i] < ema20[ema20.length - 1 - i])
                            && (ema10[ema10.length - 1 - (i + 1)] > ema20[ema20.length - 1 - (i + 1)])
                        ) {
                            oldestEma10OverEma20 = i;
                        }
                    }


                    var oldestEma10CutEma20UnderToUnder = -1;
                    /// tim cay nen gan nhat ma em10 cat ema20 tu duoi len
                    for (var i = idx; i < lastestEma10UnderEma89; i++) {
                        if ((ema10[ema10.length - 1 - i] > ema20[ema20.length - 1 - i])
                            && (ema10[ema10.length - 1 - (i + 1)] < ema20[ema20.length - 1 - (i + 1)])
                        ) {
                            oldestEma10CutEma20UnderToUnder = i;
                            break;
                        }
                    }

                   
                    var hasPriceOverEma89 = false;
                    // find min 
                    for(var i = idx; i <  oldestEma10CutEma20UnderToUnder; i++ )
                    {
                        if(priceDatas[priceDatas.length-1-i].high >= ema89[ema89.length-1-i])
                        {
                            hasPriceOverEma89 = true;
                           // console.log(" i "+ i + " oldestEma10CutEma20AboveToUnder   "+ oldestEma10CutEma20AboveToUnder + " oldestEma10UnderEma20 "+ oldestEma10UnderEma20)
                            break;
                        }
                    }

                    // console.log("oldestEma10OverEma20  "+ oldestEma10OverEma20)

                    // neu ema10 cat ema20 thi vao lenh cung dc, sl duoi chan cay nen xanh hien tai
                    if ((ema10[ema10.length - 1 - idx] < ema20[ema20.length - 1 - idx])
                        && (ema10[ema10.length - 1 - (idx + 1)] > ema20[ema20.length - 1 - (idx + 1)])
                    ) {
                        // console.log("oldestEma10OverEma20  "+ oldestEma10OverEma20+ " idx "+ idx)
                        // if (oldestEma10OverEma20 == idx) 
                        if (((oldestEma10OverEma20 < beginIndexArr[2]) && (idx < oldestEma10OverEma20))
                        && (hasPriceOverEma89 == true)
                        ) {


                            var slPercen = 5;
                            if (timeRequest == "5m") {
                                slPercen = 1;
                            } else if (timeRequest == "15m") {
                                slPercen = 2;
                            } else if (timeRequest == "30m") {
                                slPercen = 5;
                            }
                            var slPrice = priceDatas[priceDatas.length - 1 - idx].close * (1 + (slPercen / 100.0));

                            var tp_1_Percen = 1.5;
                            if (timeRequest == "5m") {
                                tp_1_Percen = 1.5;
                            } else if (timeRequest == "15m") {
                                tp_1_Percen = 4.9;
                            } else if (timeRequest == "30m") {
                                tp_1_Percen = 9.9;
                            }
                            var tp1Price = priceDatas[priceDatas.length - 1 - idx].close * (1 + (tp_1_Percen / 100.0));

                            priceLowArr = []
                            priceMaxArr = []
                            for (var m = 0; m < idx; m++) {
                                priceLowArr.push(priceDatas[priceDatas.length - 1 - m].low)
                                priceMaxArr.push(priceDatas[priceDatas.length - 1 - m].high)
                            }

                            var lowsestPrice = Math.min(...priceLowArr);
                            var highsetPrice = Math.max(...priceMaxArr);

                            var tpPercenCheck = 100 * (1 - lowsestPrice / priceDatas[priceDatas.length - 1 - idx].close);
                            var slPercenCheck = 100 * ((highsetPrice / priceDatas[priceDatas.length - 1 - idx].close) - 1);



                            var logData = coinName2 + " sell future ema ==cat== " + timeRequest + " total3ContinousRedCandle " + totalTimeHas3ContinousBlueCandle
                                + " idx " + idx
                                + " begin_index " + beginIndexArr[0]
                                + " begin_index1 " + beginIndexArr[1]
                                + " begin_index2 " + beginIndexArr[2]
                                // + " maxPriceFromEma10OverEma89Index " + minPriceFromEma10UnderEma89Index
                                + " price " + priceDatas[priceDatas.length - 1 - idx].close
                                + "  hightest %  " + slPercenCheck
                                + " lowest % " + tpPercenCheck
                            //   + " oldestEma10UnderEma20 " + oldestEma10UnderEma20;

                            console.log(logData)

                            if (idx < 5) {
                                bot.sendMessage(chatId, coinName2 + "  " + timeRequest
                                    + " sell "
                                    + " idx " + idx
                                    + " sl  " + slPrice
                                    + "  tp1Price " + tp1Price

                                )
                                bot.sendMessage(chatId, coinName2 + "_" + timeRequest + "_" + "sell")
                            }
                        }
                    }
                    // tim
                    // nen 0 xanh
                    // nen (idx + 1) do
                    // 3 nen 3 4 5 xanh
                    // them 1 dieu kien nua la tu idx den cat ema10 ema89 la lan dau tien co ema10 cat ema20 tu duoi len 

                    if ((priceDatas[priceDatas.length - 1 - idx].close < priceDatas[priceDatas.length - 1 - idx].open)
                        && (priceDatas[priceDatas.length - 1 - idx].close > priceDatas[priceDatas.length - 1 - (idx + 1)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 1)].close > priceDatas[priceDatas.length - 1 - (idx + 1)].open)

                        && (priceDatas[priceDatas.length - 1 - (idx + 2)].close < priceDatas[priceDatas.length - 1 - (idx + 2)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 3)].close < priceDatas[priceDatas.length - 1 - (idx + 3)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 4)].close < priceDatas[priceDatas.length - 1 - (idx + 4)].open)
                        && (priceDatas[priceDatas.length - 1 - (idx + 1)].close <= (priceDatas[priceDatas.length - 1 - (idx + 2)].open))
                        // cay nen tang gia, cho cay nen 2 than nen lon hon hoac bangc ay nen 3
                        // cay nen do co gia dong cua lon hon 1/2 cay nen xanh trc do
                        //   && (priceDatas[priceDatas.length - 1 - (idx + 1)].close >= 0.5*( priceDatas[priceDatas.length - 1 - (idx + 2)].open+ priceDatas[priceDatas.length - 1 - (idx + 2)].close))
                    ) {
                        if (((oldestEma10OverEma20 < beginIndexArr[2]) && (idx < oldestEma10OverEma20))) {

                            var slPercen = 5;
                            if (timeRequest == "5m") {
                                slPercen = 1;
                            } else if (timeRequest == "15m") {
                                slPercen = 2;
                            } else if (timeRequest == "30m") {
                                slPercen = 5;
                            }
                            var slPrice = priceDatas[priceDatas.length - 1 - idx].close * (1 + (slPercen / 100.0));

                            var tp_1_Percen = 1.5;
                            if (timeRequest == "5m") {
                                tp_1_Percen = 1.5;
                            } else if (timeRequest == "15m") {
                                tp_1_Percen = 4.9;
                            } else if (timeRequest == "30m") {
                                tp_1_Percen = 9.9;
                            }
                            var tp1Price = priceDatas[priceDatas.length - 1 - idx].close * (1 + (tp_1_Percen / 100.0));

                            priceLowArr = []
                            priceMaxArr = []
                            for (var m = 0; m < idx; m++) {
                                priceLowArr.push(priceDatas[priceDatas.length - 1 - m].low)
                                priceMaxArr.push(priceDatas[priceDatas.length - 1 - m].high)
                            }

                            var lowsestPrice = Math.min(...priceLowArr);
                            var highsetPrice = Math.max(...priceMaxArr);

                            var tpPercenCheck = 100 * (1 - lowsestPrice / priceDatas[priceDatas.length - 1 - idx].close);
                            var slPercenCheck = 100 * ((highsetPrice / priceDatas[priceDatas.length - 1 - idx].close) - 1);

                            var logData = coinName2 + "  sell future ==retest== " + timeRequest + " total3ContinousRedCandle " + totalTimeHas3ContinousBlueCandle
                                + " idx " + idx
                                + " slPrice " + slPrice
                                + " begin_index " + beginIndexArr[0]
                                + " begin_index1 " + beginIndexArr[1]
                                + " begin_index2 " + beginIndexArr[2]
                                //   + " maxPriceFromEma10OverEma89Index " + maxPriceFromEma10OverEma89Index
                                + " price " + priceDatas[priceDatas.length - 1 - idx].close
                                + "  hightest %  " + slPercenCheck
                                + " lowest % " + tpPercenCheck
                            //  + " oldestEma10UnderEma20 " + oldestEma10UnderEma20;

                            console.log(logData)

                            if (idx < 5) {
                                bot.sendMessage(chatId, coinName2 + "  " + timeRequest
                                    + "sell"
                                    + " idx " + idx
                                    + " slPrice " + slPrice
                                    + "  tp1Price " + tp1Price
                                )

                                bot.sendMessage(chatId, coinName2 + "_" + timeRequest + "_" + "sell")
                            }
                        }
                    }
                }

            }
        }
    } catch (e) {
        console.log("error 2 " + e + " " + coinName2)
    }

}


const checkTp = async (coinName2, timeRequest, type = "buy") => {
    try {
        console.log("check tp func " + coinName2 + "  " + timeRequest + "  " + type)
        var priceDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: timeRequest })
        var openPrices = []
        var closePrices = []

        var last10Prices = []
        var last5Prices = []

        //   console.log(" priceDatas[priceDatas.length-1].closeTime   "+ typeof( priceDatas[priceDatas.length-1].close));

        //  console.log(coinName2+ " priceDatas " +  "  timeRequest "+ timeRequest)
        for (var i = 0; i < priceDatas.length; i++) {
            //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            closePrices.push(Number(priceDatas[i].close))
            openPrices.push(Number(priceDatas[i].open))
        }

        var ema10 = EMA.calculate({ period: 10, values: closePrices })
        var ema20 = EMA.calculate({ period: 20, values: closePrices })
        var ema34 = EMA.calculate({ period: 34, values: closePrices })
        var ema50 = EMA.calculate({ period: 50, values: closePrices })
        var ema89 = EMA.calculate({ period: 89, values: closePrices })
        var ema200 = EMA.calculate({ period: 200, values: closePrices })

        if (type == "buy") {
            if ((ema10[ema10.length - 1] < ema20[ema20.length - 1])
                && (ema10[ema10.length - 2] > ema20[ema20.length - 2])
            ) {
                bot.sendMessage(chatId, "close " + type + "  " + coinName2 + "  " + timeRequest)
                bot.sendMessage(chatId, "close " + type + "  " + coinName2 + "  " + timeRequest)
                bot.sendMessage(chatId, "close " + type + "  " + coinName2 + "  " + timeRequest)
            }
        } else if (type == "sell") {
            if ((ema10[ema10.length - 1] > ema20[ema20.length - 1])
                && (ema10[ema10.length - 2] < ema20[ema20.length - 2])
            ) {
                bot.sendMessage(chatId, "close " + type + "  " + coinName2 + "  " + timeRequest)
                bot.sendMessage(chatId, "close " + type + "  " + coinName2 + "  " + timeRequest)
                bot.sendMessage(chatId, "close " + type + "  " + coinName2 + "  " + timeRequest)
            }
        }

    } catch (e) {
        console.log("Error for check tp", e);
        process.exit(-1);
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

        for (var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
        // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
        {
            var coinName2 = pricesArr[coinIndex].toString();
            // var coinName2 = top20[coinIndex].symbol ;
            //   console.log("coinName  " + coinName2)
            // var coinName2 = "XVGUSDT"

            if (coinName2.includes("USDT") && (coinName2 != "COCOSUSDT") && (coinName2 != "BICOUSDT")) {
                try {

                   

                    var price4hDatas = await client.futuresCandles({ symbol: coinName2, limit: 1000, interval: "4h" })

                    var close4hPrices = []


                    for (var i = 0; i < price4hDatas.length; i++) {
                        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
                        close4hPrices.push(Number(price4hDatas[i].close))
                        //  openPrices.push(Number(priceDatas[i].open))
                    }

                    var ema10_4h = EMA.calculate({ period: 10, values: close4hPrices })
                    var ema89_4h = EMA.calculate({ period: 89, values: close4hPrices })

                    

                    if (ema10_4h[ema10_4h.length - 1] > ema89_4h[ema89_4h.length - 1]) 
                    {
                        
                        var test5m = await find3TimeRedFutureForBuy(coinName2, timeRequest)
                    }
                    // await wait(100);
                    // if (ema10_4h[ema10_4h.length - 1] < ema89_4h[ema89_4h.length - 1]) {
                    //     var test5m = await find3TimeRedFutureForSell(coinName2, timeRequest)
                    // }

                    // var test5m = await find3TimeRedForBuy(coinName2, timeRequest)
                } catch (err) {
                    console.log(coinName2 + "  " + err + "\n");
                    continue;
                }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

            }
            await wait(100);
            //   break;
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

        //   await updatePrice("5m");
           await sync();
            await updatePrice("15m");
           await sync();
       //     await updatePrice("30m");

            if (curentSymbolOrder != "") {
                checkTp(curentSymbolOrder, curentTimeOfSymbolOrder, curentCommandTypeOfSymbolOrder);
            }
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
        await sync();
        await wait(10000);
    }

})();































