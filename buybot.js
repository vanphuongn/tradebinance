var Binance = require('binance-api-node').default;
//const ema = require('trading-indicator').ema;
const kdj = require('kdj').kdj;
const macd = require('trading-indicator').macd;
const TelegramBot = require('node-telegram-bot-api');
var MACD = require('technicalindicators').MACD;
var EMA = require('technicalindicators').EMA
var express = require('express');
var app     = express();
const WebSocketClient = require('ws')
app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
//const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const token = '5967294536:AAHR4YyRbr5OdMMfVn7xvc3xFLAITBQGw4I';

const chatId = "662991734";
const bot = new TelegramBot(token,{polling:true});

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
   apiKey: '6oHHrDBqe5pra9PhYEoafxbNMANrLW1XNR75B1Lqe3sFAetMapH5P18SmCRGYvPx',
	apiSecret:'8bvKE2GciMLJHNTPpLIDOwGDG8sCOUs7dUTUQFnad3RbuulIjXYwyC4CzhYVII4H',
	useServerTime:true,
    recvWindow: 1000, // Set a higher recvWindow to increase response timeout


});

//client.websockets.chart("BNBBTC", "1m", async (symbol, interval, chart) => {
//    let tick = await client.last(chart);
//    const last = chart[tick].close;
//
//    // Optionally convert 'chart' object to array:
//    const ohlc = binance.ohlc(chart);
//    console.log(ohlc);
//});


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
//var macdInput = {
//  values            : [127.75,129.02,132.75,145.40,148.98,137.52,147.38,139.05,137.23,149.30,162.45,178.95,200.35,221.90,243.23,243.52,286.42,280.27],
//  fastPeriod        : 5,
//  slowPeriod        : 8,
//  signalPeriod      : 3 ,
//  SimpleMAOscillator: false,
//  SimpleMASignal    : false
//}
//
//console.log("macd  "+JSON.stringify(MACD.calculate(macdInput)));

requestTime = "30m"
var total_coin_phanky = 0
var coinDivergenceList = []
so_nen_check_giao_cat = 20
currentSymbols = []

var checkPinbarUp = function(open, high, low, close, coinName = ""){
    var long = high - low
    var belowTail =  0

    if(open > close){
        belowTail = close - low
    }else if(open <= close){
        belowTail = open - low
    }

     if((belowTail) > (0.65 * long))
     {
        console.log(coinName + "   belowTail / long " + (belowTail/long) + "open : " + open + " close " + close + " low "+ low + "  high "+ high)
        bot_check_log.sendMessage(chatId, coinName + "   belowTail / long  " + (belowTail/long) + "open : " + open + " close " + close + " low "+ low + "  high "+ high)

        return true;
     }else {
        return false;
     }
}
var checkPinbarDown = function(open, high, low, close){
    var long = high - low
    var belowTail =  0

    if(open > close){
        aboveTail = high - open
    }else if(open <= close){
        aboveTail = high - close
    }

     if((aboveTail) > (0.65 * long))
     {
      console.log(coinName + "   aboveTail / long  " + (aboveTail/long) + "open : " + open + " close " + close + " low "+ low + "  high "+ high)
        bot_check_log.sendMessage(chatId, coinName + "   aboveTail / long  " + (belowTail/long) + "open : " + open + " close " + close + " low "+ low + "  high "+ high)

        return true;
     }else {
        return false;
     }
}

var checkPinbarForBuy = async(coinName2)=>{
	try{

		//	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);
			let price15mDatas = await client.candles({ symbol: coinName2, limit:10,interval:"15m" })

			var lastestCandleIsPinbarUp15m = false
			var lastestCandleIsPinbarUp15m2 = false
			lastestCandleIsPinbarUp15m = checkPinbarUp(price15mDatas[price15mDatas.length-1].open, price15mDatas[price15mDatas.length-1].high,
                price15mDatas[price15mDatas.length-1].low,price15mDatas[price15mDatas.length-1].close,coinName2)

            lastestCandleIsPinbarUp15m2 = checkPinbarUp(price15mDatas[price15mDatas.length-2].open, price15mDatas[price15mDatas.length-2].high,
                price15mDatas[price15mDatas.length-2].low,price15mDatas[price15mDatas.length-2].close,coinName2)

             await wait(100);

            let price30mDatas = await client.candles({ symbol: coinName2, limit:10,interval:"30m" })

			var lastestCandleIsPinbarUp30m = false
			var lastestCandleIsPinbarUp30m2 = false
			lastestCandleIsPinbarUp30 = checkPinbarUp(price30mDatas[price30mDatas.length-1].open, price30mDatas[price30mDatas.length-1].high,
                price30mDatas[price30mDatas.length-1].low,price30mDatas[price30mDatas.length-1].close,coinName2)
            lastestCandleIsPinbarUp30m2 = checkPinbarUp(price30mDatas[price30mDatas.length-2].open, price30mDatas[price30mDatas.length-2].high,
                price30mDatas[price30mDatas.length-2].low,price30mDatas[price30mDatas.length-2].close,coinName2)

            await wait(100);

            let price1hDatas = await client.candles({ symbol: coinName2, limit:10,interval:"1h" })
            var lastestCandleIsPinbarUp1h = false
            lastestCandleIsPinbarUp1h = checkPinbarUp(price1hDatas[price1hDatas.length-2].open, price1hDatas[price1hDatas.length-2].high,
                price1hDatas[price1hDatas.length-2].low,price1hDatas[price1hDatas.length-2].close,coinName2)

            var lastestCandleIsPinbarUp1h2 = false
            lastestCandleIsPinbarUp1h2 = checkPinbarUp(price1hDatas[price1hDatas.length-2].open, price1hDatas[price1hDatas.length-2].high,
                price1hDatas[price1hDatas.length-2].low,price1hDatas[price1hDatas.length-2].close,coinName2)

            if((lastestCandleIsPinbarUp15m == true) ||(lastestCandleIsPinbarUp15m2 == true)
            (lastestCandleIsPinbarUp30m == true)||(lastestCandleIsPinbarUp30m2 == true)
            ||(lastestCandleIsPinbarUp1h == true)||(lastestCandleIsPinbarUp1h2 == true)
            ){
                return true;
            }else{
                return false;
            }

	}
		catch (err)
		{
	//	 console.log(err + "  " + coinName2  );
	//	 log_str += err + "  " + coinName2 + "\n";

	}
}

var checkPinbarForShell = async(coinName2)=>{
	try{

		//	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);
			let price15mDatas = await client.candles({ symbol: coinName2, limit:10,interval:"15m" })

			var lastestCandleIsPinbarDown15m = false
			var lastestCandleIsPinbarDown15m2 = false
			lastestCandleIsPinbarDown15m = checkPinbarDown(price15mDatas[price15mDatas.length-1].open, price15mDatas[price15mDatas.length-1].high,
                price15mDatas[price15mDatas.length-1].low,price15mDatas[price15mDatas.length-1].close)

            lastestCandleIsPinbarDown15m2 = checkPinbarDown(price15mDatas[price15mDatas.length-2].open, price15mDatas[price15mDatas.length-2].high,
                price15mDatas[price15mDatas.length-2].low,price15mDatas[price15mDatas.length-2].close)

             await wait(100);

            let price30mDatas = await client.candles({ symbol: coinName2, limit:10,interval:"30m" })

			var lastestCandleIsPinbarDown30m = false
			var lastestCandleIsPinbarDown30m2 = false
			lastestCandleIsPinbarDown30m = checkPinbarDown(price30mDatas[price30mDatas.length-1].open, price30mDatas[price30mDatas.length-1].high,
                price30mDatas[price30mDatas.length-1].low,price30mDatas[price30mDatas.length-1].close)
            lastestCandleIsPinbarDown30m2 = checkPinbarDown(price30mDatas[price30mDatas.length-2].open, price30mDatas[price30mDatas.length-2].high,
                price30mDatas[price30mDatas.length-2].low,price30mDatas[price30mDatas.length-2].close)

            await wait(100);

            let price1hDatas = await client.candles({ symbol: coinName2, limit:10,interval:"1h" })
            var lastestCandleIsPinbarDown1h = false
            lastestCandleIsPinbarDown1h = checkPinbarDown(price1hDatas[price1hDatas.length-2].open, price1hDatas[price1hDatas.length-2].high,
                price1hDatas[price1hDatas.length-2].low,price1hDatas[price1hDatas.length-2].close)

            var lastestCandleIsPinbarDown1h2 = false
            lastestCandleIsPinbarDown1h2 = checkPinbarDown(price1hDatas[price1hDatas.length-2].open, price1hDatas[price1hDatas.length-2].high,
                price1hDatas[price1hDatas.length-2].low,price1hDatas[price1hDatas.length-2].close)

            if((lastestCandleIsPinbarDown15m == true) ||(lastestCandleIsPinbarDown15m2 == true)
            (lastestCandleIsPinbarDown30m == true)||(lastestCandleIsPinbarDown30m2 == true)
            ||(lastestCandleIsPinbarDown1h == true)||(lastestCandleIsPinbarDown1h2 == true)
            ){
                return true;
            }else{
                return false;
            }

	}
		catch (err)
		{
	//	 console.log(err + "  " + coinName2  );
	//	 log_str += err + "  " + coinName2 + "\n";

	}
}





const updatePriceForSell =async (coinName2,timeRequest, so_nen_check_giao_cat)=>{
	try{

		//	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);
			let priceDatas = await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
			var intersect_macd_index_array = []
			var prices = []
			var last50Prices = []
			var lastestCandleIsPinbarDown = false
			for(var i =0; i < priceDatas.length; i++)
			{
		   // console.log(coinName2 +"    "+i + "    priceDatas " + priceDatas[i].close)
				prices.push(Number(priceDatas[i].close))
			}

//            lastestCandleIsPinbarDown = checkPinbarDown(priceDatas[priceDatas.length-1].open, priceDatas[priceDatas.length-1].high,
//                priceDatas[priceDatas.length-1].low,priceDatas[priceDatas.length-1].close)

   lastestCandleIsPinbarDown = checkPinbarDown(priceDatas[priceDatas.length-2].open, priceDatas[priceDatas.length-2].high,
                priceDatas[priceDatas.length-2].low,priceDatas[priceDatas.length-2].close)

			for(var i = 30; i >0; i--)
			{
		//	    console.log(i + "    priceDatas " + priceDatas[i].close)
				last50Prices.push(Number(priceDatas[priceDatas.length-i].high))

			}
			var min = Math.min( ...last50Prices )
			var max = Math.max( ...last50Prices )
//                     console.log("last50Prices     " + last50Prices
//                      + "  min  " + min
//                      )
//                     for(var i =0; i < prices.length; i++)
//                        {
//                            console.log(i + "    priceDatas " + prices[i])
//
//                        }


			   var macdInput = {
				  values            : prices,
				  fastPeriod        : 12,
				  slowPeriod        : 26,
				  signalPeriod      : 9 ,
				  SimpleMAOscillator: false,
				  SimpleMASignal    : false
				}

//                   var result =  MACD.calculate(macdInput);
	   //   console.log("macdInput :"+JSON.stringify(macdInput))
		   var macdData2 = MACD.calculate(macdInput)
		   var ema10 = EMA.calculate({period : 10, values : prices})
		   var ema20 = EMA.calculate({period : 20, values : prices})

	   //   console.log("macd :"+JSON.stringify(macdData2))
		 // console.log("macd length:"+macdData2.length)

			for(var i = 0;  i < macdData2.length;i++)
			{
				if( (macdData2[(macdData2.length -1)-i].MACD < macdData2[(macdData2.length -1)-i].signal)
				&& (macdData2[(macdData2.length -1)-(i+1)].MACD > macdData2[(macdData2.length -1)-(i+1)].signal)
				)
				{
		 //           console.log(i  +"  macdData  " + macdData2[i].MACD)
					intersect_macd_index_array.push(i)
				}
		   }
		 //   console.log("  intersect_macd_index_array length  " + intersect_macd_index_array.length)
		 var hasPhanKy = false;
		 var logStr = "";

		   for(var i = 0; i < intersect_macd_index_array.length -1; i++)
		   {
				// console.log("  intersect_macd_index_array i  " + intersect_macd_index_array[i])
				if( (macdData2[[macdData2.length - 1] -intersect_macd_index_array[i]].MACD < macdData2[[macdData2.length - 1] - intersect_macd_index_array[i+1]].MACD)

					&&  priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].close > priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].close
				)
				{
					var time = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].closeTime)
					var oldTime = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].closeTime)
					var lastPrice = priceDatas[priceDatas.length - 1].close
				//	console.log("so_nen_check_giao_cat " + so_nen_check_giao_cat)
					if((max / lastPrice) < 1.05 && (intersect_macd_index_array[i]  < 30)
				//	&& (ema10[ema10.length-1] < ema20[ema20.length-1])
                 //   && (lastestCandleIsPinbarDown == true)
					&& (macdData2[(macdData2.length -1)].MACD < macdData2[(macdData2.length -1)].signal)
					)
					{
						total_coin_phanky+=1
                        var checkPinbarDown = checkPinbarForShell(coinName2)
                        if(checkPinbarDown == true){
                        //	bot.sendMessage(chatId, total_coin_phanky + "  " + timeRequest+  ", phan ki ban " + coinName2 +"  "+ intersect_macd_index_array[i]+"   " + lastPrice);
                            logStr += total_coin_phanky+ "  "+  timeRequest +", phan ki giam + pinbar " + coinName2 +"  "+ intersect_macd_index_array[i]+"   " + lastPrice +"\n"
                        //	bot.sendMessage(chatId,logStr );
                            hasPhanKy = true
                        }
					}
				}
		   	}
		   		return {hasPhanKy,logStr}
			}
			 catch (err)
			  {
		   //	 console.log(err + "  " + coinName2  );
		   //	 log_str += err + "  " + coinName2 + "\n";

			}
}


const updatePriceForBuy =async (coinName2,timeRequest)=>{
        try{

         //         console.log("timeRequest  " + timeRequest + "  , coinName :  " +coinName2 )
                //	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);

                   let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })
                     // live candles

//               let priceDatas =     client.ws.candles(tickers => {
//                      console.log(tickers)
//                    })
//                     client.ws.candles('ETHBTC', '1s', candle => {
//                      console.log(candle)
//                    })

                    var intersect_macd_index_array = []
                    var prices = []
                    var last50Prices = []
                    var lastestCandleIsPinbarUp = false
                    var lastestCandleIsPinbarUp2 = false
                    for(var i =0; i < priceDatas.length; i++)
                    {
                	   //  console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
                        prices.push(Number(priceDatas[i].close))
                    }
                    //   console.log("COiname " + coinName2 + "  timerequest " + timeRequest)


                    for(var i = 30; i >0; i--)
                    {
                //	    console.log(i + "    priceDatas " + priceDatas[i].close)
                        last50Prices.push(Number(priceDatas[priceDatas.length-i].low))
                    }
                    var min = Math.min( ...last50Prices )
				//	var min = Math.min( ...last50Prices )
					var max = Math.max( ...last50Prices )
    //                     console.log("last50Prices     " + last50Prices
    //                      + "  min  " + min
    //                      )
    //                     for(var i =0; i < prices.length; i++)
    //                        {
    //                            console.log(i + "    priceDatas " + prices[i])
    //
    //                        }


                       var macdInput = {
                          values            : prices,
                          fastPeriod        : 12,
                          slowPeriod        : 26,
                          signalPeriod      : 9 ,
                          SimpleMAOscillator: false,
                          SimpleMASignal    : false
                        }

    //                   var result =  MACD.calculate(macdInput);
               //   console.log("macdInput :"+JSON.stringify(macdInput))
                   var macdData2 = MACD.calculate(macdInput)
                   var ema10 = EMA.calculate({period : 10, values : prices})
                   var ema20 = EMA.calculate({period : 20, values : prices})

				   if((timeRequest == "5m") || (timeRequest == "15m") )
				   {
					//	console.log(  await client.futuresOpenOrders() );

						for(var i = 0; i < currentSymbols.length ;i++)
						{
					   //	var symbol = currentSymbols[i]
						 // console.log(   currentSymbols[i].symbol);
						 // console.log( currentSymbols[i].positionSide);
						   if(coinName2 ==  currentSymbols[i].symbol)
						   {

							   if(String(currentSymbols[i].positionSide) == "SHORT")
							   {
									console.log(timeRequest +"Trung coin name" + coinName2 + "   ema 10 " + ema10[ema10.length-1] + "  ema20  " + ema20[ema20.length-1])
									var xxx = ema10[ema10.length-1] -  ema20[ema20.length-1]
									console.log( "xxx    " + xxx)
									if((ema10[ema10.length-1] > ema20[ema20.length-1]) && (ema10[ema10.length-2] < ema20[ema20.length-2])

									)
									{
										bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + "   ema 10 " + ema10[ema10.length-1] + "  ema20  " + ema20[ema20.length-1]);
										bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + "   ema 10 " + ema10[ema10.length-1] + "  ema20  " + ema20[ema20.length-1]);
									}
									if( priceDatas[priceDatas.length - 1].close  > max )
									{
										bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + " Gia cao hon gia min");
										bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + " Gia cao hon gia min");
									}

							   }else if(String(currentSymbols[i].positionSide) == "LONG")
							   {
								//	console.log("Trung coin name" + coinName2)
								if((ema10[ema10.length-1] < ema20[ema20.length-1]) &&(ema10[ema10.length-2] > ema20[ema20.length-2]) )
								{
									bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + "   ema 10 " + ema10[ema10.length-1] + "  ema20  " + ema20[ema20.length-1]);
									bot.sendMessage(chatId,timeRequest +"    Canh bao: Can Than Lo  " + coinName2 + "   ema 10 " + ema10[ema10.length-1] + "  ema20  " + ema20[ema20.length-1]);
								}

								if( priceDatas[priceDatas.length - 1].close  < min )
								{
									bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + " Gia thap hon gia min");
									bot.sendMessage(chatId,timeRequest +"   Canh bao: Can Than Lo  " + coinName2 + " Gia thap hon gia min");
								}
							   }
						   }
						}
					}

               //  console.log("macd :"+JSON.stringify(macdData2))
                 // console.log("macd length:"+macdData2.length)

                    for(var i = 0;  i < macdData2.length;i++)
                    {
                        if( (macdData2[(macdData2.length -1)-i].MACD > macdData2[(macdData2.length -1)-i].signal)
                        && (macdData2[(macdData2.length -1)-(i+1)].MACD < macdData2[(macdData2.length -1)-(i+1)].signal)
                        )
                        {
                     //       console.log(i  +"  macdData  " + macdData2[i].MACD)
                            intersect_macd_index_array.push(i)
                        }
                   }
                 //   console.log("  intersect_macd_index_array length  " + intersect_macd_index_array.length)

                    var hasPhanKy = false;
                    var logStr = "";

                     //  console.log("intersect_macd_index_array "+ intersect_macd_index_array.length)
                   for(var i = 0; i < intersect_macd_index_array.length-1; i++)
                   {
                  //       console.log("  intersect_macd_index_array i  " + intersect_macd_index_array[i])
                        if( (macdData2[[macdData2.length - 1] -intersect_macd_index_array[i]].MACD > macdData2[[macdData2.length - 1] - intersect_macd_index_array[i+1]].MACD)
                            &&  priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].close < priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].close
                        )
                        {
                            var time = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].closeTime)
                            var oldTime = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].closeTime)
                            var lastPrice = priceDatas[priceDatas.length - 1].close

                            if((lastPrice / min) < 1.05 && (intersect_macd_index_array[i]  < 30)
                         //	&& (ema10[ema10.length-1] > ema20[ema20.length-1])
                             //   && ((lastestCandleIsPinbarUp == true) || (lastestCandleIsPinbarUp2 == true))
								&&  (macdData2[(macdData2.length -1)].MACD > macdData2[(macdData2.length -1)].signal)
                            )
                            {
                               total_coin_phanky+=1


                               var checkPinbarUp = checkPinbarForBuy(coinName2)
                               if(checkPinbarUp == true){

                                //   console.log("Ema10 " + (ema10))
                                console.log( coinName2 + " phan ki tang i :" + intersect_macd_index_array[i]
                                   + "  i+1  : " + intersect_macd_index_array[i+1]
                                   + "  timeRequest  " + timeRequest
                                   + " macdData  "+ macdData2[[macdData2.length - 1] - intersect_macd_index_array[i]].MACD
                                   + " macdData  old "+ macdData2[[macdData2.length - 1] - intersect_macd_index_array[i+1]].MACD
                                   + "  lastestPrice  " + lastPrice
                                   + "   price  :" + priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].close

                                   + "   time  "  + time
                                   + "  old price  :" + priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].close
                                   + "   oldtime  "  + oldTime
                                   )
                                    coinDivergenceList.push(coinName2)
                                    logStr += total_coin_phanky+ "  "+  timeRequest +", phan ki tang " + coinName2 +"  "+ intersect_macd_index_array[i]+"   " + lastPrice +"\n"
                                                               console.log( logStr)
                                 //   bot.sendMessage(chatId,logStr );
                                    // if((timeRequest == "5m") || (timeRequest == "15m") ){
                                    // 	if(intersect_macd_index_array[i] < 20){
                                    // 	hasPhanKy = true;
                                    // 	}
                                    // }
                                    hasPhanKy = true;
								}
//								if((timeRequest == "5m") || (timeRequest == "15m") )
//								{
//
//									if( intersect_macd_index_array[i] < 15)
//								   {
//										hasPhanKy = true;
//									}
//								}
//								else{
//								   hasPhanKy = true;
//								}
                            }
                        }

                     //   console.log("  i  " + i )
                   }

                //   console.log("hasPhanKy phan ky  " + hasPhanKy + "   " + logStr)
                   return {hasPhanKy,logStr}

    //               for (var i = 0; i <ergenceList.length; i++){
    //                    var coinName = coinDivergenceList[i]
    //                    console.log("Con phan ky  " + coinName)
    //
    //               }

                 }

        catch (err)
        {
    //	 console.log(err + "  " + coinName2  );
    //	 log_str += err + "  " + coinName2 + "\n";
        // continue;
        }
}

const updatePrice = async(timeRequest )=>{
    try {

		let accountInfo = await client.accountInfo();

	//	prices = await client.prices();
		prices = await client.futuresPrices();
		let pricesArr = Object.keys(prices);
         total_coin_phanky = 0
	     coinDivergenceList = []


		currentSymbols = await client.futuresOpenOrders()
		//  currentSymbols = []
		//  currentSymbols = await client.futuresOpenOrders()
		 console.log(currentSymbols);

       for(var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
         {
               var coinName2 = pricesArr[coinIndex].toString() ;
            //	var coinName = "BNBUSDT"
               if(coinName2.includes("USDT"))
                {
                    try{
                //  var test5m = await updatePriceForBuy("BTCUSDT", "4h")
               // console.log("test5m " +coinName2)
			   				  // check for buy
			   		//var test3m =   await updatePriceForBuy(coinName2, "3m")
                 //   var test5m =   await updatePriceForBuy(coinName2, "5m")
                      var test15m =  await  updatePriceForBuy(coinName2, "15m")
                      var test30m =  await  updatePriceForBuy(coinName2, "30m")
                      var test1h =  await  updatePriceForBuy(coinName2, "1h")

                      if((test30m.hasPhanKy == true)||(test1h.hasPhanKy == true) ||(test15m.hasPhanKy == true))
                      {
                       //  if((test5m.hasPhanKy == true)||(test15m.hasPhanKy == true))
                         {
                             console.log("test5m phan ky buy " +test5m.hasPhanKy+ "   logData2  : "+ test5m.logStr)
                            var logData = test5m.logStr + test15m.logStr + test30m.logStr + test1h.logStr;
                              bot.sendMessage(chatId,logData );
                         }
                      }

					  // check for shell
				//	  var test3mShell =  await updatePriceForSell(coinName2, "3m", 30)
					 // var test5mShell =  await updatePriceForSell(coinName2, "5m", 30)
                      var test15mShell =  await   updatePriceForSell(coinName2, "15m",30)
                      var test30mShell = await   updatePriceForSell(coinName2, "30m",30)
                      var test1hShell =  await  updatePriceForSell(coinName2, "1h",30)
				//	  console.log(coinName2 +"    test5m " +test5mShell.hasPhanKy+ "   logData2  : "+ test5mShell.logStr)
                      if((test30mShell.hasPhanKy == true)||(test1hShell.hasPhanKy == true) || ((test5mShell.hasPhanKy == true)&&(test15mShell.hasPhanKy == true)))
                      {
                        // if((test5mShell.hasPhanKy == true)||(test15mShell.hasPhanKy == true))
                         {
							console.log("test5m2 " +test5mShell.hasPhanKy+ "   logData2  : "+ test5mShell.logStr)
                            var logData = test5mShell.logStr + test15mShell.logStr + test30mShell.logStr + test1hShell.logStr;
                            bot.sendMessage(chatId,logData );
                         }
                      }

                      //  console.log("value  " + value)
                    }catch(err){
                        continue;
                    }
                //	coinNameChars = coinName.split("USDT");
                //	coinName= coinNameChars[0]+ "/"+ "USDT"

                }
                await wait(1000);
        }


    } catch (err) {
    //	 log_str += err + "  " + coinName + "\n";
       console.log(err + "\n");
    }
}


(async function main(){

	let buySuccess = null;

	//	await updateEMA();
	bot.sendMessage(chatId," =============Start 1 vong requets ======" );
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





































