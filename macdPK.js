var Binance = require('binance-api-node').default;
//const ema = require('trading-indicator').ema;


const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA

var bullishengulfingpattern =require('technicalindicators').bullishengulfingpattern;
var bullishharami =require('technicalindicators').bullishharami;
var bullishharamicross =require('technicalindicators').bullishharamicross;

var bullishmarubozu =require('technicalindicators').bullishmarubozu;
var bullishspinningtop =require('technicalindicators').bullishspinningtop;

const bullishhammer = require('technicalindicators').bullishhammer;
var threewhitesoldiers =require('technicalindicators').threewhitesoldiers;
const tweezerbottom = require('technicalindicators').tweezerbottom;

var bb = require('technicalindicators').BollingerBands;

var express = require('express');
var app     = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";
const HaID = "197407951"
//const bot = new TelegramBot(token,{polling:true});

const token_warning = "6037137720:AAFBEfCG9xWY4K_3tx7VSZzMXGgmt9-Zdog"
const bot = new TelegramBot(token_warning,{polling:true});


const token_check_log_ = "6166932215:AAEbZ28_7Um4n3K64DOOA1BRisiSTg9siBQ"
const bot_check_log = new TelegramBot(token_check_log_,{polling:true});


const {StochasticRSI, ema} = require('technicalindicators');

//const client = Binance().options({
//
//	apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
//	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
//	useServerTime:true,kdj
//
//});
const client = new Binance({
   apiKey: '6aAHxmZy3L491NNOpOzts4PaQcxtcXliFxXg2ACtRW9cUw5zbBHKAHwt9HJ7DO4c',
	apiSecret:'lBCPfrYD9D9OeokixySh5yMNSaJgRQoYzM9gkXxMoB7JxUCyMHPkrCCw5RsvXb22',
	useServerTime:true,
    recvWindow: 1000, // Set a higher recvWindow to increase response timeout


});
var log_str = "";

app.get('/', function(request, response) {
    var result = 'App is running \n';
    response.send(result + log_str);

}).listen(app.get('port'), function() {
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
	await wait(timeDifference ); // Waits 1s more to make sure the prices were updated
	console.log('SYNCED WITH BINANCE SERVER! \n');
}

let ema10 = 0;
let ema20 = 0;
let ema50 = 0;

let timeRequest = "30m";
let prices ;

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

var MACD = require('technicalindicators').MACD;

requestTime = "30m"
var total_coin_phanky = 0
var coinDivergenceList = []
so_nen_check_giao_cat = 20
currentSymbols = []


const checkBUSDUSDTForBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(1.0/priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length
    // for(var i =0; i < 10; i++){
    //   //  console.log("coinName2  "+ coinName2 + JSON.stringify(result) + "  length  "+ result.length)
    //    console.log("coinName2  "+ coinName2 + "   " + bbResult[resultLength-1 -i].middle + "  "+ bbResult[resultLength-1 -i].upper+ "  "+ bbResult[resultLength -1-i].lower);
        
    // }
    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    console.log("coinName2  "+ coinName2 + "   " + ema10[ema10.length-1] + "  "+ ema89[ema89.length-1]+ "  "+ ema50[ema50.length-1] + "  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].lower);
    if( (ema10[ema10.length-1] > ema89[ema89.length-1])&& (ema50[ema50.length-1] > ema89[ema89.length-1]))
    {
        if( (ema10[ema10.length-1] > ema50[ema50.length-1])  && (ema10[ema10.length-2] < ema50[ema50.length-2]))
        {
            
            if((ema89[ema89.length-1]<bbResult[bbResult.length-1].middle) &&  (ema89[ema89.length-1]>bbResult[bbResult.length-1].lower))
            {
                var profit = priceDatas[priceDatas.length-1].close* 1.02
                var stoplossPersion  = 100*(1- (ema89[ema89.length-1]/priceDatas[priceDatas.length-1].close))
                bot.sendMessage(chatId,timeRequest+"   buy USDT/ couple " + coinName2 +"  profit : "+ profit+ " stoploss "+ ema89[ema89.length-1] + " %stoploss : "+ stoplossPersion);
                bot.sendMessage(chatId,timeRequest+"   buy USDT/ couple " + coinName2 +"  profit : "+ profit+ " stoploss "+ ema89[ema89.length-1] + " %stoploss : "+ stoplossPersion);
            }
        }
    }
}

const findEmaOverForUSDTBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
        //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length
    // for(var i =0; i < 10; i++){
    //   //  console.log("coinName2  "+ coinName2 + JSON.stringify(result) + "  length  "+ result.length)
    //    console.log("coinName2  "+ coinName2 + "   " + bbResult[resultLength-1 -i].middle + "  "+ bbResult[resultLength-1 -i].upper+ "  "+ bbResult[resultLength -1-i].lower);
        
    // }
    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
	
    console.log("coinName2  "+ coinName2 + "   " + ema10[ema10.length-1] + "  "+ ema89[ema89.length-1]+ "  "+ ema50[ema50.length-1] + "  "+ bbResult[bbResult.length-1].middle+ "  "+ bbResult[bbResult.length-1].lower);
    if( (ema10[ema10.length-1] > ema89[ema89.length-1])&& (ema50[ema50.length-1] > ema89[ema89.length-1]))
    {
        if( (ema10[ema10.length-1] > ema50[ema50.length-1])  && (ema10[ema10.length-2] < ema50[ema50.length-2]))
        {
            
            if((ema89[ema89.length-1]<bbResult[bbResult.length-1].middle) &&  (ema89[ema89.length-1]>bbResult[bbResult.length-1].lower))
            {
                var profit = priceDatas[priceDatas.length-1].close* 1.02
                var stoplossPersion  = 100*(1- (ema89[ema89.length-1]/priceDatas[priceDatas.length-1].close))
                bot.sendMessage(chatId,timeRequest+"   buy " + coinName2 +"  profit : "+ profit+ " stoploss "+ ema89[ema89.length-1] + " %stoploss : "+ stoplossPersion);
                bot.sendMessage(HaID,timeRequest+"   buy " + coinName2 +"  profit : "+ profit+ " stoploss "+ ema89[ema89.length-1] + " %stoploss : "+ stoplossPersion);
            }
        }
    }
}

const getBBUper = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    return bbResult[bbResult.length-1].upper
}

const getBBLower = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last50Prices = []
    var last10Prices = []
    var last5Prices = []

    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var bbInput = {
        period: 14,
        values: prices,
        stdDev : 2
    }
    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    return bbResult[bbResult.length-1].lower
}

const getLowe2LeverTimeRequest = (timeRequest)=>{
    var higherTimeRequest = timeRequest
    if(timeRequest == "15m")
    {
        higherTimeRequest = "3m"
    }else if(timeRequest == "30m")
    {
        higherTimeRequest = "5m"
    }else if(timeRequest == "1h")
    {
        higherTimeRequest = "15m"
    }else if(timeRequest == "2h")
    {
        higherTimeRequest = "30m"
    }
    else if(timeRequest == "4h")
    {
        higherTimeRequest = "1h"
    }
    else if(timeRequest == "6h")
    {
        higherTimeRequest = "1h"
    }
    else if(timeRequest == "8h")
    {
        higherTimeRequest = "2h"
    }

    return higherTimeRequest;

}


const getHigherTimeRequest = (timeRequest)=>{
    var higherTimeRequest = timeRequest
    if(timeRequest == "15m")
    {
        higherTimeRequest = "30m"
    }else if(timeRequest == "30m")
    {
        higherTimeRequest = "1h"
    }else if(timeRequest == "1h")
    {
        higherTimeRequest = "2h"
    }else if(timeRequest == "2h")
    {
        higherTimeRequest = "4h"
    }
    else if(timeRequest == "4h")
    {
        higherTimeRequest = "6h"
    }
    else if(timeRequest == "6h")
    {
        higherTimeRequest = "8h"
    }
    else if(timeRequest == "8h")
    {
        higherTimeRequest = "12h"
    }

    return higherTimeRequest;

}

const getEma89= async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    for(var i =0; i < priceDatas.length; i++)
    {
          
        prices.push(Number(priceDatas[i].close))
    }

    // var ema10 = EMA.calculate({period : 10, values : prices})
    // var ema20 = EMA.calculate({period : 20, values : prices})
    // var ema34 = EMA.calculate({period : 34, values : prices})
    // var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})

   // console.log("getEMA89 " +coinName2+ "   " + "    ema89[ema89.length-1] " + ema89[ema89.length-1])
    return ema89[ema89.length-1]
}

const getHigherEma89 = async(coinName2,currentEma89, timeRequest)=>{
    var timeIndex = 0
    let timeArr = ["5m", "15m", "30m", "1h", "2h","4h","6h", "8h", "12h"]

    var higherTimeRequest = timeRequest
    if(timeRequest == "15m")
    {
        timeIndex = 1
    }else if(timeRequest == "30m")
    {
        timeIndex = 2
    }else if(timeRequest == "1h")
    {
        timeIndex = 3
    }else if(timeRequest == "2h")
    {
        timeIndex = 4
    }
    else if(timeRequest == "4h")
    {
        timeIndex = 5
    }
    else if(timeRequest == "6h")
    {
        timeIndex = 6
    }
    else if(timeRequest == "8h")
    {
        timeIndex = 7
    }
    else if(timeRequest == "12h")
    {
        timeIndex = 8
    }

    var minEma89 = 100000.0
    var timeRequestMin = "5m"
    for(var i = timeIndex+1; i <timeArr.length;i++ )
    {
        //console.log(coinName2+ "timeIn" + timeRequest + " timeIndex "+ timeIndex+ "  "+timeArr[i])
        var ema89 = await getEma89(coinName2,timeArr[i])
            if(ema89 > currentEma89){
            //console.log(coinName2+ "timeIn" +"  ema89  "+ema89+"  "+ timeRequest + " timeIndex "+ timeIndex+ "  "+timeArr[i])
            if(minEma89 > ema89){
                minEma89 = ema89
                timeRequestMin = timeArr[i]
            }
        }
        await wait(100)
    }
    console.log(coinName2+ "timeIn" + timeRequest + " timeMin "+ timeRequestMin)
    return timeRequestMin

}
const checkEMa5mOverForBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})

    if((ema10[ema10.length-1]>=ema20[ema20.length-1] )
        && (ema20[ema20.length-1]>=ema50[ema50.length-1] )
       && (ema50[ema50.length-1]>=ema89[ema89.length-1] )
        )
        {
            return true;

        }else
        {
            return false;
        }
}


const checkNenRutRauBbDuoi = async(coinName2, timeRequest)=>{
     
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    

    // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))
    
    //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for(var i =0; i < priceDatas.length; i++)
    {
    // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }
    var lower2LevelbbInput = {
        period: 20,
        values: prices,
        stdDev : 2
    }

    const bbResult = bb.calculate(lower2LevelbbInput)
    var resultLength2= lower2LevelBbResult.length
    if(priceDatas[0].lower < lower2LevelBbResult[0].lower&& priceDatas[0].close > lower2LevelBbResult[0].lower)
    {
        console.log(timeRequest+ "  buy pass 3 "+ coinName2+ "  lowe2LeverTimeRequest  "+ lowe2LeverTimeRequest)
        bot.sendMessage(chatId,timeRequest+ " BUY pass 3"+ coinName2+ "   : " )
    }

}

const checkNenRutRau = async(coinName2, timeRequestNumber, lowerTimeRequestNumber, numLowerCandle)=>
{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequestNumber +"m" })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

   // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

   //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for(var i =0; i < priceDatas.length; i++)
    {
       // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    for(var i =0; i < priceDatas.length; i++)
    {
       // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var min30 = Math.min( ...last30Prices )
    var min10 = Math.min( ...last10Prices )

    var ema10 = EMA.calculate({period : 7, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})

   // console.log("min 10 "+ min10 + "  min30  "+ min30)

    var bbInput = {
        period: 20,
        values: prices,
        stdDev : 2
    }

    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    var numCandle = numLowerCandle/(timeRequestNumber/ lowerTimeRequestNumber);

    if(numCandle > 2 )
        {
 //   console.log(timeRequestNumber+"  higher NUmcandle  " + numCandle)
        for(var i = 0;i < numCandle;i++)
        {
            var openPrice = priceDatas[priceDatas.length-1-i].open;
            var closePrice = priceDatas[priceDatas.length-1-i].close;
            var lowPrice = priceDatas[priceDatas.length-1-i].low;

            var minPrice = (openPrice>closePrice)?closePrice: openPrice;
            var delta = Math.abs(openPrice-closePrice)
            if(delta >0)
            {
                var tyle = (minPrice-lowPrice) /(Math.abs(openPrice-closePrice));
            
                if(tyle >2
                   // && (priceDatas[priceDatas.length-1-i].low < ema89[ema89.length-1-i])
                     && (lowPrice <(bbResult[bbResult.length-1-i]).lower)
                     && (minPrice > bbResult[bbResult.length-1-i].lower))
                {
                    console.log(coinName2+ " time "+timeRequestNumber+"m  "+i +" tyle "+ tyle +"  delta "+ delta + " minPrice "+ minPrice + " lowPrice "+ lowPrice )
                        return true;
                }
            }
        }
    }
    return false;
}
const findEmaOverForBuy = async(coinName2, timeRequestNumber)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequestNumber +"m" })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

   // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

   //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for(var i =0; i < priceDatas.length; i++)
    {
       // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var min30 = Math.min( ...last30Prices )
    var min10 = Math.min( ...last10Prices )

   // console.log("min 10 "+ min10 + "  min30  "+ min30)

    var bbInput = {
        period: 20,
        values: prices,
        stdDev : 2
    }

    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    var ema10 = EMA.calculate({period : 7, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})
    var macdInput = {
        values            : prices,
        fastPeriod        : 12,
        slowPeriod        : 26,
        signalPeriod      : 9 ,
        SimpleMAOscillator: false,
        SimpleMASignal    : false
    }

    var macdData2 = MACD.calculate(macdInput)

    var lastestEma10OverEma89Index= 1000;
    for(var i = 0; i < ema89.length-1; i++)
    {
        if((ema10[ema10.length-1-i] < ema89[ema89.length-1-i])
        &&(ema10[ema10.length-1-i-1] > ema89[ema89.length-1-i-1]))
        {
            lastestEma10OverEma89Index  = i;
            break;
        }
    }
//  
    var macd_minToEma10OverEma89_arr = []
    var minMacdToEma10OverEma89 = -100;
    var priceMinIndex = 1000;
    var priceAtMinIndex = 0;
 //  console.log(coinName2+ "  "+ timeRequest+ " lastestEma10OverEma89Index  "+ lastestEma10OverEma89Index)

    for(var i =0; i < lastestEma10OverEma89Index-1;i++)
    {
     
      //  console.log(coinName2+ "  "+ timeRequest+ " macdData2[(macdData2.length -1-i)].MACD  "+ macdData2[(macdData2.length -1-i)].MACD)
        macd_minToEma10OverEma89_arr.push(macdData2[(macdData2.length -1-i)].MACD )
    }
    minMacdToEma10OverEma89 = Math.min( ...macd_minToEma10OverEma89_arr )
 //   console.log(coinName2+ "  "+ timeRequest+ " minMacdToEma10OverEma89  "+ minMacdToEma10OverEma89)

    for(var i =0; i < lastestEma10OverEma89Index; i++)
    {
        if(macdData2[(macdData2.length -1-i)].MACD  == minMacdToEma10OverEma89)
        {
            priceMinIndex = i;

            priceAtMinIndex = priceDatas[priceDatas.length-1-i].low;
        //    console.log("priceMinIndex  "+ priceMinIndex +  "  priceAtMinIndex  "+ priceAtMinIndex) 
            break;
        }
    }

   // console.log("MACD "+ JSON.stringify(macdData2))

    // for(var i =0; i < 2;i++){
    //     console.log(timeRequest+"  i  " +i+" macdData2 "+ macdData2[macdData2.length-1-i].MACD + " signal "+ macdData2[macdData2.length-1-i].signal )
    // }

    var lastMacdUnderSignal = []
    var lastMacdOverSignal = []

    for(var i = 0;i < macdData2.length-200;i++)
    {
        if( (macdData2[(macdData2.length -1)-i].MACD > macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD < macdData2[(macdData2.length -1)-(i+1)].signal)
		    )
        {
                lastMacdUnderSignal.push(i)
        }
    }

    for(var i = 0;i < macdData2.length-200;i++)
    {
        if( (macdData2[(macdData2.length -1)-i].MACD < macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD > macdData2[(macdData2.length -1)-(i+1)].signal)
		    )
        {
            lastMacdOverSignal.push(i)
        }
    }

  

    if( (macdData2[(macdData2.length -1)].MACD > macdData2[(macdData2.length -1)].signal)
  //  && (macdData2[(macdData2.length -2)].MACD < macdData2[(macdData2.length -2)].signal)
    )
    {
        try{
       // console.log(timeRequest+ " pass 0 "+ coinName2)
        var macd_min0 = 0
        var macd_min1 = 0
        var macd_min2 = 0
        var price_min0 = 0
        var price_min1 = 0

        var price_max_1 = 0
        var price_max1_arr = []

        var price_min0_arr = []
        var price_min1_arr = []
        var macd_min0_arr = []
        var macd_min1_arr = []
        var macd_min2_arr = []


        for(var i =lastMacdUnderSignal[0]; i < lastMacdOverSignal[0]; i++)
        {
            price_min0_arr.push(priceDatas[priceDatas.length-1-i].open)
            macd_min0_arr.push(macdData2[(macdData2.length -1-i)].MACD )
        }

        for(var i =lastMacdUnderSignal[1]; i < lastMacdOverSignal[1]; i++)
        {
            price_min1_arr.push(priceDatas[priceDatas.length-1-i].close)
            macd_min1_arr.push(macdData2[(macdData2.length -1-i)].MACD )
        }

        for(var i =lastMacdUnderSignal[2]; i < lastMacdOverSignal[2]; i++)
        {
          //  price_min1_arr.push(priceDatas[priceDatas.length-1-i].close)
            macd_min2_arr.push(macdData2[(macdData2.length -1-i)].MACD )
        }
        price_min0 = Math.min( ...price_min0_arr )
        price_min1 = Math.min( ...price_min1_arr )
        macd_min0 = Math.min( ...macd_min0_arr )
        macd_min1 = Math.min( ...macd_min1_arr )
        macd_min2 = Math.min( ...macd_min2_arr )

        for(var i =0; i < lastMacdUnderSignal[2]; i++)
        {
            price_max1_arr.push(priceDatas[priceDatas.length-1-i].close)
          //  console.log(coinName2+ "   :  price  " + priceDatas[priceDatas.length-1-i].close)
        }

        price_max_1 = Math.max( ...price_max1_arr)
        var max1_index = -1;
        
        for(var i =0; i < lastMacdUnderSignal[2]; i++)
        {
            if(priceDatas[priceDatas.length-1-i].close == price_max_1)
            {
                max1_index = i;
            }
      
        }

    //    var max1_index = price_max1_arr.indexOf(Math.max( ...price_max1_arr))

        var price_max_1_b = 0
        var price_max1_arr_b = []

        for(var i =lastMacdUnderSignal[1]; i < lastMacdOverSignal[1]; i++)
        {
            price_max1_arr_b.push(priceDatas[priceDatas.length-1-i].close)
            
        }

        price_max_1_b = Math.max( ...price_max1_arr_b)

      
        }catch(err){
            console.log(timeRequest+ "  "+coinName2+"  "+ err + "\n");
        //    continue;
        
        }
      //  console.log(timeRequestNumber+"   NUmcandle  " + lastMacdOverSignal[0])
    
        // if(checkNenRutRau15m == true  || checkNenRutRau30m == true)
        // {
        //  console.log(timeRequest+ "  buy pass 0 "+ coinName2+ " ,lastMacdOverSignal[0]"+ lastMacdOverSignal[0] )
        // }
        if(//(ema10[ema10.length-1 ] < ema20[ema20.length-1])
         //   (lastMacdUnderSignal < 30)
          
             (ema20[ema20.length-1 ] <ema34[ema34.length-1])
            && (ema34[ema34.length-1 ] < ema50[ema50.length-1])
            && (ema50[ema50.length-1 ] < ema89[ema89.length-1])
          //  &&(price_max_1 == price_max_1_b)
        )
        {

            var checkNenRutRau5m = await checkNenRutRau(coinName2, 5, timeRequestNumber,lastMacdOverSignal[0])
            var checkNenRutRau15m = await checkNenRutRau(coinName2, 15, timeRequestNumber,lastMacdOverSignal[0])
            var checkNenRutRau30m = await checkNenRutRau(coinName2, 30, timeRequestNumber,lastMacdOverSignal[0])

            
            var delta = macd_min1 - minMacdToEma10OverEma89;
           // console.log("Pass 0   macd_min0  "+ macd_min0 + " minMacdToEma10OverEma89 "+ minMacdToEma10OverEma89)
          //  console.log("Pass 0   price_min0  "+ price_min0 + " priceAtMinIndex "+ priceAtMinIndex)
            if(
                
                ((checkNenRutRau5m == true) ||(checkNenRutRau15m == true)  || (checkNenRutRau30m == true))
             &&   (macd_min0 > minMacdToEma10OverEma89) 
          //  && (delta >0)
           && (macd_min1 > macd_min2) 
                && (price_min0 < price_min1)
            && (price_min0 < priceAtMinIndex)
          //  && (macd_min0 > macdData2[(macdData2.length -1-lastMacdUnderSignal[1])].MACD )
           // && ( (macdData2[(macdData2.length -1-lastMacdOverSignal[1])].MACD > 0) && (macdData2[(macdData2.length -1-lastMacdUnderSignal[1])].MACD < 0))
            )
            {
              //    console.log(" pass 3 "+ macd_min1+ "  macd min2 "+ macd_min2)
                if((ema10[ema10.length-1 ] > bbResult[bbResult.length-1].middle)
                //  )
                 )
                {
              //      console.log("Pass 2")
                    {
                        var pt = ((bbResult[bbResult.length-1].upper/priceDatas[priceDatas.length-1].close)-1)*100
                     //   if(pt > 0.55)
                        {
                            console.log(timeRequestNumber+ "m BUY "+ coinName2+ "   : "
                            + " PT "+ ema89[ema89.length-1]  + "  %Pt "+ pt  + " price_min0 "+ price_min0 + "  priceAtMinIndex  "+ priceAtMinIndex)

                            bot.sendMessage(chatId,timeRequestNumber+ "m  BUY "+ coinName2+ "   : "
                            + " PT "+ ema89[ema89.length-1]  + "  %Pt "+ pt )
                            return true;
                        }
                    }
                }
            //     //tim cay nen thap hon 2 level dau tien rut rau tu ngoai bb vao
            //     var lowe2LeverTimeRequest = getLowe2LeverTimeRequest(timeRequest)
            //     console.log(timeRequest+ "  buy pass 3 "+ coinName2+ "  lowe2LeverTimeRequest  "+ lowe2LeverTimeRequest)
            //     try{
            //     let priceLower2LevelDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:lowe2LeverTimeRequest })
            //     var lower2LevelPrices = []
              
            
            //     // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))
             
            //     //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
            //      for(var i =0; i < priceLower2LevelDatas.length; i++)
            //      {
            //         // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            //         lower2LevelPrices.push(Number(priceLower2LevelDatas[i].close))
            //      }
            //      var lower2LevelbbInput = {
            //         period: 20,
            //         values: lower2LevelPrices,
            //         stdDev : 2
            //     }
            
            //     const lower2LevelBbResult = bb.calculate(lower2LevelbbInput)
            //     var resultLength2= lower2LevelBbResult.length
            //     if(priceLower2LevelDatas[0].lower < lower2LevelBbResult[0].lower&& priceLower2LevelDatas[0].close > lower2LevelBbResult[0].lower)
            //     {
            //         console.log(timeRequest+ "  buy pass 3 "+ coinName2+ "  lowe2LeverTimeRequest  "+ lowe2LeverTimeRequest)
            //      bot.sendMessage(chatId,timeRequest+ " BUY pass 3"+ coinName2+ "   : " )
            //     }
            // }catch(err)
            // {
            //     console.log(" err 2" + err)
            // }
            //     // console.log(timeRequest+ "  buy pass 3 "+ coinName2+ "  price_max_1 "+ price_max_1 + "   :  max1_index  " + max1_index)

            //   //  bot.sendMessage(chatId,timeRequest+ " BUY pass 3"+ coinName2+ "   : " )
            //     // check candle 1m

            //     let price1mDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:"1m" })
            //     var prices1m = []
              
            
            //    // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))
            
            //    //console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
            //     for(var i =0; i < price1mDatas.length; i++)
            //     {
            //        // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
            //        prices1m.push(Number(price1mDatas[i].close))
            //     }

            //     var macd1mInput = {
            //         values            : prices1m,
            //         fastPeriod        : 12,
            //         slowPeriod        : 26,
            //         signalPeriod      : 9 ,
            //         SimpleMAOscillator: false,
            //         SimpleMASignal    : false
            //     }
            
            //     var macdData1m2 = MACD.calculate(macd1mInput)
                
            //     if( (macdData1m2[(macdData1m2.length -1)].MACD > macdData1m2[(macdData1m2.length -1)].signal)
            //     && (macdData1m2[(macdData1m2.length -2)].MACD < macdData1m2[(macdData1m2.length -2)].signal))
            //     {

                //   if(timeRequest != "1m" && timeRequest != "3m"&& timeRequest != "5m")
           // }
            }
        }
    }

    return false;

}
const findEmaOverForSell = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

   // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

//    console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for(var i =0; i < priceDatas.length; i++)
    {
      //    console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
    }

    var min30 = Math.min( ...last30Prices )
    var min10 = Math.min( ...last10Prices )

   // console.log("min 10 "+ min10 + "  min30  "+ min30)

    var bbInput = {
        period: 20,
        values: prices,
        stdDev : 2
    }

    const bbResult = bb.calculate(bbInput)
    var resultLength = bbResult.length

    var ema10 = EMA.calculate({period : 10, values : prices})
    var ema20 = EMA.calculate({period : 20, values : prices})
    var ema34 = EMA.calculate({period : 34, values : prices})
    var ema50 = EMA.calculate({period : 50, values : prices})
    var ema89 = EMA.calculate({period : 89, values : prices})
    var ema200 = EMA.calculate({period : 200, values : prices})

    var macdInput = {
        values            : prices,
        fastPeriod        : 12,
        slowPeriod        : 26,
        signalPeriod      : 9 ,
        SimpleMAOscillator: false,
        SimpleMASignal    : false
    }

    var macdData2 = MACD.calculate(macdInput)
   // console.log("MACD "+ JSON.stringify(macdData2))

    // for(var i =0; i < 2;i++){
    //     console.log(timeRequest+"  i  " +i+" macdData2 "+ macdData2[macdData2.length-1-i].MACD + " signal "+ macdData2[macdData2.length-1-i].signal )
    // }

    var lastMacdUnderSignal = []
    var lastMacdOverSignal = []

    for(var i = 0;i < macdData2.length-200;i++)
    {
        if( (macdData2[(macdData2.length -1)-i].MACD > macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD < macdData2[(macdData2.length -1)-(i+1)].signal)
		    )
        {
                lastMacdUnderSignal.push(i)
        }
    }

    for(var i = 0;i < macdData2.length-200;i++)
    {
        if( (macdData2[(macdData2.length -1)-i].MACD < macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD > macdData2[(macdData2.length -1)-(i+1)].signal)
		    )
        {
            lastMacdOverSignal.push(i)
        }
    }

  

    if( (macdData2[(macdData2.length -1)].MACD < macdData2[(macdData2.length -1)].signal)
    && (macdData2[(macdData2.length -2)].MACD > macdData2[(macdData2.length -2)].signal)
    )
    {
        try{
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

        
        for(var i =0; i < lastMacdUnderSignal[0]; i++)
        {
            price_max0_arr.push(priceDatas[priceDatas.length-1-i].close)
            macd_max0_arr.push(macdData2[(macdData2.length -1-i)].MACD )
        }

        for(var i =lastMacdOverSignal[1]; i < lastMacdUnderSignal[1]; i++)
        {
            price_max1_arr.push(priceDatas[priceDatas.length-1-i].close)
            macd_max1_arr.push(macdData2[(macdData2.length -1-i)].MACD )
        }

        price_max0 = Math.max( ...price_max0_arr )
        price_max1 = Math.max( ...price_max1_arr )
        macd_max0 = Math.max( ...macd_max0_arr )
        macd_max1 = Math.max( ...macd_max1_arr )

        for(var i =0; i < lastMacdOverSignal[2]; i++)
        {
            price_min1_arr.push(priceDatas[priceDatas.length-1-i].close)
          //  console.log(coinName2+ "   :  price  " + priceDatas[priceDatas.length-1-i].close)
        }

        price_min_1 = Math.min( ...price_min1_arr)
        var min1_index = -1;
        
        for(var i =0; i < lastMacdOverSignal[2]; i++)
        {
            if(priceDatas[priceDatas.length-1-i].close == price_min_1)
            {
                min1_index = i;
            }
      
        }

    //    var max1_index = price_max1_arr.indexOf(Math.max( ...price_max1_arr))

        var price_min_1_b = 0
        var price_min1_arr_b = []

        for(var i =lastMacdOverSignal[1]; i < lastMacdUnderSignal[1]; i++)
        {
            price_min1_arr_b.push(priceDatas[priceDatas.length-1-i].close)
            
        }

        price_min_1_b = Math.min( ...price_min1_arr_b)

      //  console.log(timeRequest+ "  sell pass 0 "+ coinName2+ "  price_max_1 "+ price_min_1 + "   :  max1_index  " + min1_index)

        }catch(err){
            console.log(timeRequest+ "  "+coinName2+"  "+ err + "\n");
        //    continue;
        
        }
        if((ema10[ema10.length-1-min1_index ] < ema20[ema20.length-1-min1_index])
            && (ema20[ema20.length-1-min1_index ] < ema34[ema34.length-1-min1_index])
            && (ema34[ema34.length-1-min1_index ] < ema50[ema50.length-1-min1_index])
            && (ema50[ema50.length-1-min1_index ] < ema89[ema89.length-1-min1_index])
          //  &&(price_max_1 == price_max_1_b)
        )
        {

            if((macd_max0 < macd_max1) 
            && (price_max0 > price_max1)
            && ( (macdData2[(macdData2.length -1-lastMacdUnderSignal[1])].MACD < 0) && (macdData2[(macdData2.length -1-lastMacdOverSignal[1])].MACD > 0))
            )
            {
                try{
                    if(pt > 0.55){
                    var pt = ((priceDatas[priceDatas.length-1].close/ema89[ema89.length-1] )-1)*100

                    console.log(timeRequest+ " Sell  "+ coinName2
                + " PT "+ ema89[ema89.length-1]  + "  %Pt "+ pt )

                    bot.sendMessage(chatId,timeRequest+ " Sell  "+ coinName2+ 
                    " PT "+ ema89[ema89.length-1]  + "  %Pt "+ pt )
                    }
                }catch(err)
                {
                    console.log(" err 2" + err)
                }
            }
        }
        
    }


}
const updatePrice = async(timeRequest )=>{

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


     for(var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
      // for(var coinIndex = 0; coinIndex < top20.length; coinIndex++)
         {
           var coinName2 = pricesArr[coinIndex].toString() ;
              // var coinName2 = top20[coinIndex].symbol ;
          //   console.log("coinName  " + coinName2)
      // 	var coinName2= "HIFIUSDT"
               if(coinName2.includes("USDT") && (coinName2 != "COCOSUSDT"))
                {
                    try{
                        var timeRequestNumber = 5;
                      var test1m = await  findEmaOverForBuy(coinName2, 1)
                        var test3m = await  findEmaOverForBuy(coinName2, 3)
                        var test5m = await  findEmaOverForBuy(coinName2, 5)
                        if(test1m == true|| test3m == true|| test5m == true){
                            console.log("test1m "+ test1m+ "  test3m " + test3m+ "  test5m " + test5m+ "   coinName "+ coinName2)
                       
                        //   var test15m =  await  findEmaOverForBuy(coinName2, "5m")
                        //    await wait(100);
                            var test15m =  await  findEmaOverForBuy(coinName2, "15m")
                            await wait(100);
                                var test30m =  await  findEmaOverForBuy(coinName2, "30m")
                            await wait(100);
                            var test30m =  await  findEmaOverForBuy(coinName2, "1h")
                            await wait(100);
                            var test30m =  await  findEmaOverForBuy(coinName2, "4h")
                            await wait(100);
                //      var test15m =  await  findEmaOverForSell(coinName2, "5m")
                    //    await wait(100);
                    //    var test15m =  await  findEmaOverForSell(coinName2, "15m")
                    //    await wait(100);
                    //     var test30m =  await  findEmaOverForSell(coinName2, "30m")
                    //    await wait(100);
                    //    var test30m =  await  findEmaOverForSell(coinName2, "1h")
                    // //    await wait(100);
                 
                            // var test2h =  await  findEmaOverForBuy(coinName2, "6h")
                            // await wait(100);
                            // var test4h =  await  findEmaOverForBuy(coinName2, "8h")
                            // await wait(100);
                            // var test4h =  await  findEmaOverForBuy(coinName2, "12h")
                            // await wait(100);
                        }else{
                        //    console.log("test1m "+ test1m+ "  test3m " + test3m+ "  test5m " + test5m+ "   coinName "+ coinName2)
                       
                        }

                //    var test4h =  await  findEmaOverForBuy(coinName2, "1D")
                //    await wait(100);
                   
                //       var test15m =  await  findEmaOverForSell(coinName2, "5m")
                //       await wait(100);
                //     var test15m =  await  findEmaOverForSell(coinName2, "15m")
                //     await wait(100);
                //     var test30m =  await  findEmaOverForSell(coinName2, "30m")
                //     await wait(100);
                //  var test1h =  await  findEmaOverForSell(coinName2, "1h")
                //  await wait(100);
                //  var test2h =  await  findEmaOverForSell(coinName2, "2h")
                //  await wait(100);
                //  var test4h =  await  findEmaOverForSell(coinName2, "4h")
                // //  await wait(100);
                //  var test6h =  await  findEmaOverForSell(coinName2, "6h")
                //  await wait(100);
                //  var test8h =  await  findEmaOverForSell(coinName2, "8h")
                //  await wait(200);
                //  var test8h =  await  findEmaOverForSell(coinName2, "12h")
          
                 //   var test8h =  await  findEmaOverForBuy(coinName2, "8h")
               //     await wait(100);
                //    var test12h =  await  findEmaOverForBuy(coinName2, "12h")
                     
                    }catch(err){
               //        console.log(coinName2+"  "+ err + "\n");
                       continue;
                       
                    }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

                }
                await wait(400);
        }


    } catch (err) {
    //	 log_str += err + "  " + coinName + "\n";
       console.log(err + "\n");
    }
}

(async function main(){

	let buySuccess = null;

	//	await updateEMA();
	//bot.sendMessage(chatId," =============Start 1 vong requets ======" );
	while(true)
	{
			log_str = "";
		//	bot.sendMessage(chatId," =============Start 1 vong requets ======" );
			 try{
				
			//	await sell();
				
			 }catch(e){
				console.log("Error for sell", e);
				process.exit(-1);
			 }
			 
			try{

			    await updatePrice("4h");
//			     await updateEMA("15m");
//				await updateEMA("30m");
//				await updateEMA("1h");
				await sync();
			}catch(e){
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




































