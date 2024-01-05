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
const Stochastic   = require('technicalindicators').Stochastic

var express = require('express');
var app     = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";
const HaID = "897405122"
//const bot = new TelegramBot(token,{polling:true});

const token_warning = "6037137720:AAFBEfCG9xWY4K_3tx7VSZzMXGgmt9-Zdog"
const bot = new TelegramBot(token_warning,{polling:true});


const token_check_log_ = "6166932215:AAEbZ28_7Um4n3K64DOOA1BRisiSTg9siBQ"
const bot_check_log = new TelegramBot(token_check_log_,{polling:true});


const {StochasticRSI} = require('technicalindicators');

//const client = Binance().options({
//
//	apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
//	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
//	useServerTime:true,
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



const findEmaOverForBuy = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

    var hightArr = []
    var lowArr = []
    var closeArr = []
   // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

//    console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for(var i =0; i < priceDatas.length; i++)
    {
       // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
        hightArr.push(Number(priceDatas[i].high))
        lowArr.push(Number(priceDatas[i].low))
        closeArr.push(Number(priceDatas[i].close))
    }

    let period = 14;
    let signalPeriod = 3;

    let stoch_input = {
        high: hightArr,
        low: lowArr,
        close: closeArr,
        period: period,
        signalPeriod: signalPeriod
    };

    var stochArr= Stochastic.calculate(stoch_input)
  //  console.log("Stoch"+ JSON.stringify(stochArr[stochArr.length-1].d))

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

    for(var i = 0;i < macdData2.length-200;i++)
    {
        if( (macdData2[(macdData2.length -1)-i].MACD > macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD < macdData2[(macdData2.length -1)-(i+1)].signal)
		    )
        {

         //  console.log("under "+ i)
            var numCandleToLastestEma10OverBBmidle = 100
            for(var j = 1; j < 10; j++)
            {
                if((ema10[ema10.length-1-(i)- (j+1)]> bbResult[bbResult.length-1-i-(j+1)].middle )&&(ema10[ema10.length-1-(i)- (j)]< bbResult[bbResult.length-1-i-(j)].middle ))
                {
                    numCandleToLastestEma10OverBBmidle = j
                }
                
            }
          
            if(numCandleToLastestEma10OverBBmidle>5)
            {
                // if(i <5){
                //     console.log(coinName2+ "  "+ i + "  time "+ timeRequest+"  numCandleToLastestEma10OverBBmidle  "+ numCandleToLastestEma10OverBBmidle)
                // }
                lastMacdUnderSignal.push(i)
            }
        }
    }


    // loc macd Under to Over lan 2, bo tin hieu nhiễu
    // bằng cách chỉ lấy những lần mà giữa 2 lần cắt có ema10 cat tu duoi len
    
    // for(var i =0; i  < lastMacdUnderSignal.length;i++)
    // {
    //     if(lastMacdUnderSignal[i] < 60){
    //         console.log(coinName2+ "  "+ timeRequest+ "   lastMacdUnderSignal "+ lastMacdUnderSignal[i])
    //     }
    // }


    var lastMacdUnderToOverSignalUpdate = []
    var index=0;
    var nexIndex = 1
    lastMacdUnderToOverSignalUpdate.push(lastMacdUnderSignal[index])
    while(nexIndex <lastMacdUnderSignal.length )
    {
      
        var hasCross = false
        for(var j = lastMacdUnderSignal[index]; j < lastMacdUnderSignal[nexIndex];j++){
            if((ema10[ema10.length-1-j]> bbResult[resultLength-1 -j].middle )
                     &&(ema10[ema10.length-1-(j+1)] < bbResult[resultLength-1 -(j+1)].middle )
            )
            {
             //  console.log("Has Cross "+lastMacdUnderSignal[ nexIndex])
                hasCross = true
                break;
            }
        }
        
        if(hasCross == true){
         //   console.log("index "+ j + "  nexIndex  "+lastMacdUnderSignal[ nexIndex])
            lastMacdUnderToOverSignalUpdate.push(lastMacdUnderSignal[nexIndex])
            index = nexIndex
        }
        else (hasCross == false)
        {
            nexIndex+=1
        }
    }
    
    // for(var i =0; i  < lastMacdUnderToOverSignalUpdate.length;i++)
    // {
    //     if(lastMacdUnderToOverSignalUpdate[i] < 30)
    //     {
    //         console.log(coinName2+"  "+ timeRequest+  "   lastMacdUnderToOverSignalUpdate "+ lastMacdUnderToOverSignalUpdate[i])
    //     }
    // }

  

    var price_min0 = 0
    var price_min1 = 0

    var price_max0= 0
    var price_max1= 0

    var ema10_min0 = 0
    var ema10_min1 = 0
    var ema10_min2 = 0

    var ema10_max0 = 0
    var ema10_max1 = 0
    var ema10_max2 = 0

    var macd_min0 = 0
    var macd_min1 = 0

    var macd_max0 = 0
    var macd_max1 = 0

    var indexResult = 0
    var logData  =""
    for(var i = 0; i < lastMacdUnderToOverSignalUpdate.length-2;i++)
    {
       try{
        
        // console.log(coinName2+ "  lastMacdUnderSignal[i] "+ lastMacdUnderSignal[i]+ "  lastMacdUnderSignal[i+1]  "+ lastMacdUnderSignal[i+1])
            if((macdData2[macdData2.length-1-lastMacdUnderToOverSignalUpdate[i]].MACD> macdData2[macdData2.length-1-lastMacdUnderToOverSignalUpdate[i+1]].MACD) 
            && (macdData2[macdData2.length-1-lastMacdUnderToOverSignalUpdate[i+1]].MACD> macdData2[macdData2.length-1-lastMacdUnderToOverSignalUpdate[i+2]].MACD) 
            )
            {
                
                var ema10_min0_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i]; k<lastMacdUnderToOverSignalUpdate[i+1]; k++)
                {
                    ema10_min0_arr.push(ema10[ema10.length-1-k])
                }

                ema10_min0 = Math.min( ...ema10_min0_arr )
            //   console.log("  ema10_min0 "+ ema10_min0)
            
                var ema10_min1_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i+1]; k<lastMacdUnderToOverSignalUpdate[i+2]; k++)
                {
                    ema10_min1_arr.push(ema10[ema10.length-1-k])
                }

                ema10_min1 = Math.min( ...ema10_min1_arr )

                var price_min0_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i]; k<lastMacdUnderToOverSignalUpdate[i+1]; k++)
                {
                    price_min0_arr.push(priceDatas[priceDatas.length-1-k].close)
                }

                price_min0 = Math.min( ...price_min0_arr )
            //   console.log("  ema10_min0 "+ ema10_min0)
            
                var price_min1_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i+1]; k<lastMacdUnderToOverSignalUpdate[i+2]; k++)
                {
                    price_min1_arr.push(priceDatas[priceDatas.length-1-k].close)
                }

                price_min1 = Math.min( ...price_min1_arr )

                var macd_min0_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i]; k<lastMacdUnderToOverSignalUpdate[i]+15; k++)
                {
                    macd_min0_arr.push(macdData2[macdData2.length-1-k].MACD)
                }
                var macd_max0_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i]; k<lastMacdUnderToOverSignalUpdate[i+1]; k++)
                {
                    macd_max0_arr.push(macdData2[macdData2.length-1-k].MACD)
                }

                macd_min0 = Math.min( ...macd_min0_arr )
                macd_max0 = Math.max( ...macd_max0_arr )
            //   console.log("  ema10_min0 "+ ema10_min0)
            
                var macd_min1_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i+1]; k<lastMacdUnderToOverSignalUpdate[i+1]+15; k++)
                {
                    macd_min1_arr.push(macdData2[macdData2.length-1-k].MACD)
                }

                var macd_max1_arr = []
                for(var k = lastMacdUnderToOverSignalUpdate[i+1]; k<lastMacdUnderToOverSignalUpdate[i+2]; k++)
                {
                    macd_max1_arr.push(macdData2[macdData2.length-1-k].MACD)
                }

                macd_min1 = Math.min( ...macd_min1_arr )
                macd_max1 = Math.max( ...macd_max1_arr )

                var check_macd_min_0 = false
                var check_macd_min_1  = false

                if(((macd_max0-macd_min0)/(macd_max0 -macdData2[macdData2.length-1-lastMacdUnderToOverSignalUpdate[i+1]].MACD))<0.6)
                {
                    check_macd_min_0 = true
                 
    
                }
                if(((macd_max1-macd_min1)/(macd_max1 -macdData2[macdData2.length-1-lastMacdUnderToOverSignalUpdate[i+2]].MACD))<0.5)
                {
                    check_macd_min_1 = true
                    // console.log(coinName2+ "  "+ check_macd_min_1)
    
                }
            //   console.log("Index of min "+ ema10_min1);
            
        
              //  if(check_macd_min_0 == true)
                {
                  //  console.log(coinName2+ "  "+ timeRequest+ "  " + check_macd_min_0)
                if( 
                 //   (stochArr[stochArr.length-1].d < 20)
                 // (check_macd_min_0 == true)
                //  &&    (check_macd_min_1 == true)
                    
                // && 
                //(ema10_min1 >= ema10_min0)
              //  &&
                 (ema10_min1 <= ema10[ema10.length-1-lastMacdUnderToOverSignalUpdate[i+2]])
                // && (price_min0 <= price_min1)
                && (price_min1 <= priceDatas[priceDatas.length-1-lastMacdUnderToOverSignalUpdate[i+2]].close)
            // && (ema10_max0 <= ema10_max1)
                )
                {
                    var tp1 = 100*((ema10_max0/priceDatas[priceDatas.length-1].close)-1)
                    var tp2 = 100*((ema10_max1/priceDatas[priceDatas.length-1].close)-1)
                    var indexOfLastMacdUnderSignal  = 0
                    for(var z =0; z < lastMacdUnderSignal.length-1;z++)
                    {
                        if(lastMacdUnderToOverSignalUpdate[i] == lastMacdUnderSignal[z])
                        {
                            indexOfLastMacdUnderSignal = z
                          //  console.log(coinName2+ " time "+ timeRequest+"  indexOfLastMacdUnderSignal  "+ indexOfLastMacdUnderSignal )
                        }
                    }

                 if((macdData2[macdData2.length-1-lastMacdUnderSignal[indexOfLastMacdUnderSignal]].MACD > macdData2[macdData2.length-1-lastMacdUnderSignal[indexOfLastMacdUnderSignal+1]].MACD) 
                 && (macdData2[macdData2.length-1-lastMacdUnderSignal[indexOfLastMacdUnderSignal+1]].MACD > macdData2[macdData2.length-1-lastMacdUnderSignal[indexOfLastMacdUnderSignal+2]].MACD))
                    {
                        if((lastMacdUnderToOverSignalUpdate[i] < 5))// && (tp1>1))
                        {
                            logData = coinName2+  "  buy  time "+ timeRequest
                            +" \n i "+ lastMacdUnderToOverSignalUpdate[i]+ "  "
                            +" \n i+1 "+ lastMacdUnderToOverSignalUpdate[i+1]+ "  "
                            +" \n i+2 "+ lastMacdUnderToOverSignalUpdate[i+2]+ "  "
                            indexResult = lastMacdUnderToOverSignalUpdate[i]
                            // +" \n  TP1:"+ ema10_max0.toFixed(8) + " % "+ tp1.toFixed(8)
                            // + "\n   TP2: "+ ema10_max1.toFixed(8)+ " % "+ tp2.toFixed(8)
                        //  + "\n  SL :"+ price_min0
                            console.log(logData)
                        //    bot.sendMessage(chatId,logData)
                            // +" i +1  "+ lastMacdUnderSignal[i+1]+ "  " +" i+2 "+ lastMacdUnderSignal[i+2]+ "  "
                            // +"  timeClose  "+ timeConverter(priceDatas[macdData2.length-1-lastMacdUnderSignal[i]].closeTime)
                    
                        }
                    }
                }
            }

            }
     
        // for(var i = indexResult; i < ema10.length;i++)
        // {
            // if((ema10[ema10.length-1]> bbResult[resultLength-1].middle)
            // && (ema10[ema10.length-2]< bbResult[resultLength-2].middle)
            // )
            // {
            //     var logData = coinName2+  "  time "+ timeRequest
            //     +" \n i "+ lastMacdUnderToOverSignalUpdate[indexResult]+ "  "
            //     +" \n i+1 "+ lastMacdUnderToOverSignalUpdate[i+1]+ "  "
            //     +" \n i+2 "+ lastMacdUnderToOverSignalUpdate[i+2]+ "  "
               
          
            //   //  bot.sendMessage(chatId,logData)
            // }
       // }
        }catch(err){
         //  console.log(timeRequest+ "  "+coinName2+"  "+ err + "\n");
        //    continue;
        
        }
    }

    if(indexResult>0 )
    {
      //  console.log(timeRequest+ " "+ coinName2+ "  index : "+ indexResult)
    
        var lastestCandelOK = 1000
        for(var i = 0; i < indexResult; i++ )
        {
            if((ema10[ema10.length-1-i]> bbResult[bbResult.length-1-i].middle)
            &&(ema10[ema10.length-1-(i+1)]< bbResult[bbResult.length-1-(i+1)].middle)
            )
            {
                lastestCandelOK = i
            }
        }
        if(lastestCandelOK <=5)//||  (stochArr[stochArr.length-1].d < 20))
        {
            var pt = ((ema89[ema89.length-1] /priceDatas[priceDatas.length-1].close)-1)*100
                console.log(timeRequest+ " BUY "+ coinName2+ "  lastestCandelOK : "
                + lastestCandelOK + " PT "+ ema89[ema89.length-1]  + "  %Pt "+ pt )
                bot.sendMessage(chatId,"  i : "+ lastestCandelOK+"  buy"+ logData)
          
          //  bot.sendMessage(HaID,timeRequest+ "  buy "+ coinName2+ "  lastestCandelOK : "+ lastestCandelOK)
        }
    }


}
const findEmaOverForSell = async(coinName2, timeRequest)=>{
    let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
    var prices = []
    var last30Prices = []
    var last10Prices = []
    var last5Prices = []

   var hightArr = []
    var lowArr = []
    var closeArr = []
   // console.log(" priceDatas[priceDatas.length-1].closeTime   "+timeConverter(priceDatas[priceDatas.length-1].closeTime))

//    console.log(coinName2+ " priceDatas " + JSON.stringify(priceDatas[0]))
    for(var i =0; i < priceDatas.length; i++)
    {
       // console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].open)
        prices.push(Number(priceDatas[i].close))
        hightArr.push(Number(priceDatas[i].high))
        lowArr.push(Number(priceDatas[i].low))
        closeArr.push(Number(priceDatas[i].close))
    }

    let period = 14;
    let signalPeriod = 3;

    let stoch_input = {
        high: hightArr,
        low: lowArr,
        close: closeArr,
        period: period,
        signalPeriod: signalPeriod
    };

    var stochArr= Stochastic.calculate(stoch_input)
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

    var lastMacdOverSignal = []

    for(var i = 0;i < macdData2.length-200;i++)
    {
        if( (macdData2[(macdData2.length -1)-i].MACD < macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD > macdData2[(macdData2.length -1)-(i+1)].signal)
		    )
        {

            //  console.log("under "+ i)
            var numCandleToLastestEma10UnderBBmidle = 0
            for(var j = 1; j < 10; j++)
            {
                if((ema10[ema10.length-1-(i)- (j+1)]< bbResult[bbResult.length-1-i-(j+1)].middle )&&(ema10[ema10.length-1-(i)- (j)]>bbResult[bbResult.length-1-i-(j)].middle ))
                {
                    numCandleToLastestEma10UnderBBmidle = j
                }
                
            }
          
            if(numCandleToLastestEma10UnderBBmidle > 5){
         //  console.log("under "+ i)
                lastMacdOverSignal.push(i)
            }
        }
    }


    // loc macd Under to Over lan 2, bo tin hieu nhiễu
    // bằng cách chỉ lấy những lần mà giữa 2 lần cắt có ema10 cat tu duoi len
    
    // for(var i =0; i  < lastMacdUnderSignal.length;i++)
    // {
    //    console.log("lastMacdUnderSignal "+ lastMacdUnderSignal[i])
    // }


    var lastMacdOverToUnderSignalUpdate = []
    var index=0;
    var nexIndex = 1
    lastMacdOverToUnderSignalUpdate.push(lastMacdOverSignal[index])

    while(nexIndex <lastMacdOverSignal.length )
    {
      
        var hasCross = false
        for(var j = lastMacdOverSignal[index]; j < lastMacdOverSignal[nexIndex];j++){
            if((ema10[ema10.length-1-j]< bbResult[resultLength-1 -j].middle )
                     &&(ema10[ema10.length-1-(j+1)] > bbResult[resultLength-1 -(j+1)].middle )
            )
            {
             //  console.log("Has Cross "+lastMacdUnderSignal[ nexIndex])
                hasCross = true
                break;
            }
        }
        
        if(hasCross == true){
          //  console.log("index "+ j + "  nexIndex  "+lastMacdUnderSignal[ nexIndex])
          lastMacdOverToUnderSignalUpdate.push(lastMacdOverSignal[ nexIndex])
            index = nexIndex
        }
        else (hasCross == false)
        {
            nexIndex+=1
        }
    }
    
    for(var i =0; i  < lastMacdUnderToOverSignalUpdate.length;i++)
    {
        if(lastMacdUnderToOverSignalUpdate[i] < 50){
            console.log(coinName2+ "  "+ timeRequest +"  lastMacdUnderToOverSignalUpdate "+ lastMacdUnderToOverSignalUpdate[i])
        }
    }

    var price_max0= 0
    var price_max1= 0
    var ema10_max0 = 0
    var ema10_max1 = 0
    var ema10_max2 = 0

    var macd_min0 = 0
    var macd_min1 = 0

    var macd_max0 = 0
    var macd_max1 = 0

    var indexResult = 0
    var logData = ""
    for(var i = 0; i < lastMacdOverToUnderSignalUpdate.length;i++)
    {
       try{
       // console.log(coinName2+ "  lastMacdUnderSignal[i] "+ lastMacdUnderSignal[i]+ "  lastMacdUnderSignal[i+1]  "+ lastMacdUnderSignal[i+1])
        if((macdData2[macdData2.length-1-lastMacdOverToUnderSignalUpdate[i]].MACD< macdData2[macdData2.length-1-lastMacdOverToUnderSignalUpdate[i+1]].MACD) 
        && (macdData2[macdData2.length-1-lastMacdOverToUnderSignalUpdate[i+1]].MACD< macdData2[macdData2.length-1-lastMacdOverToUnderSignalUpdate[i+2]].MACD) 
        )
        {
        
            var ema10_max0_arr = []
            for(var k = lastMacdOverToUnderSignalUpdate[i]; k<lastMacdOverToUnderSignalUpdate[i+1]; k++)
            {
               
                ema10_max0_arr.push(ema10[ema10.length-1-k])
            }

            ema10_max0 = Math.max( ...ema10_max0_arr )
         //   console.log("  ema10_min0 "+ ema10_min0)
          
            var ema10_max1_arr = []
            for(var k = lastMacdOverToUnderSignalUpdate[i+1]; k<lastMacdOverToUnderSignalUpdate[i+2]; k++)
            {
                ema10_max1_arr.push(ema10[ema10.length-1-k])
            }

            ema10_max1 = Math.max( ...ema10_max1_arr )

            var price_max0_arr = []
            for(var k = lastMacdOverToUnderSignalUpdate[i]; k<lastMacdOverToUnderSignalUpdate[+1]; k++)
            {
                price_max0_arr.push(priceDatas[priceDatas.length-1-k].close)
            }


            price_max0 = Math.max( ...price_max0_arr )
         //   console.log("  ema10_min0 "+ ema10_min0)
          
            var price_max1_arr = []
            for(var k = lastMacdOverToUnderSignalUpdate[i+1]; k<lastMacdOverToUnderSignalUpdate[i+2]; k++)
            {
                price_max1_arr.push(priceDatas[priceDatas.length-1-k].close)
            }

            price_max1 = Math.max( ...price_max1_arr )
         //   console.log("Index of min "+ ema10_min1);
        //    console.log("  ema10_min1 "+ ema10_min1)

            var indexOfLastMacdOverSignal  = 0
            for(var z =0; z < lastMacdOverSignal.length-1;z++)
            {
                if(lastMacdOverToUnderSignalUpdate[i] == lastMacdOverSignal[z])
                {
                    indexOfLastMacdOverSignal = z
                    //  console.log(coinName2+ " time "+ timeRequest+"  indexOfLastMacdUnderSignal  "+ indexOfLastMacdUnderSignal )
                }
            }

            
            if(
                //(ema10_max1 <= ema10_max0)
           // && 
            (ema10_max1 >= ema10[ema10.length-1-lastMacdOverToUnderSignalUpdate[i+2]])
            // && (price_min0 <= price_min1)
            && (price_max1 >= priceDatas[priceDatas.length-1-lastMacdOverToUnderSignalUpdate[i+2]].close)
           // && (ema10_max0 <= ema10_max1)
            )
            {
                var tp1 = 100*((ema10_max0/priceDatas[priceDatas.length-1].close)-1)
                var tp2 = 100*((ema10_max1/priceDatas[priceDatas.length-1].close)-1)

                if((macdData2[macdData2.length-1-lastMacdOverSignal[indexOfLastMacdOverSignal]].MACD> macdData2[macdData2.length-1-lastMacdOverSignal[indexOfLastMacdOverSignal+1]].MACD) 
                && (macdData2[macdData2.length-1-lastMacdOverSignal[indexOfLastMacdOverSignal+1]].MACD > macdData2[macdData2.length-1-lastMacdOverSignal[indexOfLastMacdOverSignal+2]].MACD))
                {
                    if((lastMacdOverToUnderSignalUpdate[i] < 10))// && (tp1>1))
                    {
                        logData = coinName2+  " sell time "+ timeRequest
                        +" \n i "+ lastMacdOverToUnderSignalUpdate[i]+ "  "
                        +" \n i+1 "+ lastMacdOverToUnderSignalUpdate[i+1]+ "  "
                        +" \n i+2 "+ lastMacdOverToUnderSignalUpdate[i+2]+ "  "
                        indexResult = lastMacdOverToUnderSignalUpdate[i]
                        // +" \n  TP1:"+ ema10_max0.toFixed(8) + " % "+ tp1.toFixed(8)
                        // + "\n   TP2: "+ ema10_max1.toFixed(8)+ " % "+ tp2.toFixed(8)
                    //  + "\n  SL :"+ price_min0
                        console.log(logData)
                    //    bot.sendMessage(chatId,logData)
                        // +" i +1  "+ lastMacdUnderSignal[i+1]+ "  " +" i+2 "+ lastMacdUnderSignal[i+2]+ "  "
                        // +"  timeClose  "+ timeConverter(priceDatas[macdData2.length-1-lastMacdUnderSignal[i]].closeTime)
                
                    }
                }
            }

        }
      
        // for(var i = indexResult; i < ema10.length;i++)
        // {
            // if((ema10[ema10.length-1]> bbResult[resultLength-1].middle)
            // && (ema10[ema10.length-2]< bbResult[resultLength-2].middle)
            // )
            // {
            //     var logData = coinName2+  "  time "+ timeRequest
            //     +" \n i "+ lastMacdUnderToOverSignalUpdate[indexResult]+ "  "
            //     +" \n i+1 "+ lastMacdUnderToOverSignalUpdate[i+1]+ "  "
            //     +" \n i+2 "+ lastMacdUnderToOverSignalUpdate[i+2]+ "  "
               
          
            //   //  bot.sendMessage(chatId,logData)
            // }
       // }
        }catch(err){
            console.log(timeRequest+ "  "+coinName2+"  "+ err + "\n");
        //    continue;
        
        }
    }

    if(indexResult>0)
    {
      //  console.log(timeRequest+ " "+ coinName2+ "  index : "+ indexResult)
    

        var lastestCandelOK = 1000
        for(var i = 0; i < indexResult; i++ )
        {
            if((ema10[ema10.length-1-i]< bbResult[bbResult.length-1-i].middle)
            &&(ema10[ema10.length-1-(i+1)]> bbResult[bbResult.length-1-(i+1)].middle)
            )
            {
                lastestCandelOK = i
            }
        }
        if(lastestCandelOK <= 3 && (stochArr[stochArr.length-1].d > 80))
        {
            var pt = ((priceDatas[priceDatas.length-1].close/ema89[ema89.length-1] )-1)*100
            console.log(timeRequest+ " Sell  "+ coinName2+ "  lastestCandelOK : "
            + lastestCandelOK + " PT "+ ema89[ema89.length-1]  + "  %Pt "+ pt )
            bot.sendMessage(chatId,"  i : "+ lastestCandelOK+ "  "+logData)
             bot.sendMessage(HaID,timeRequest+ " sell  "+ coinName2+ "  lastestCandelOK : "+ lastestCandelOK)
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
        	//var coinName2= "LINKUSDT"
               if(coinName2.includes("USDT") && (coinName2 != "COCOSUSDT"))
                {
                    try{
                        //  var test15m =  await  findEmaOverForBuy(coinName2, "5m")
                        //   await wait(100);
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
                    //emaawait wait(100);

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
                //  await wait(100);
                //  var test6h =  await  findEmaOverForSell(coinName2, "6h")
                //  await wait(100);
                //  var test8h =  await  findEmaOverForSell(coinName2, "8h")
                //  await wait(200);
                //  var test8h =  await  findEmaOverForSell(coinName2, "12h")
          
                 //   var test8h =  await  findEmaOverForBuy(coinName2, "8h")
               //     await wait(100);
                //    var test12h =  await  findEmaOverForBuy(coinName2, "12h")
                     
                    }catch(err){
                        //console.log(coinName2+"  "+ err + "\n");
                    //    continue;
                       
                    }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

                }
                await wait(100);
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



































