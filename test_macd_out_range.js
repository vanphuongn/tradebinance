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


const fs = require('fs');
const { json } = require('express');


//console.log(jsonData);


const updatePriceForSell = async (coinName2,timeRequest, range, super_range)=>{
  try{

   //         console.log("timeRequest  " + timeRequest + "  , coinName :  " +coinName2 )
          //	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);

             let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })

              var intersect_macd_index_array = []
              var prices = []
              var last50Prices = []
              var lastestCandleIsPinbarUp = false
              var lastestCandleIsPinbarUp2 = false
              for(var i =0; i < priceDatas.length; i++)
              {
              //   console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
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

             for(var i = 0; i < macdData2.length; i++){
              macd_sum += macdData2[i].MACD
            }
            var macd_avg = macd_sum/macdData2.length
          //  range = Math.abs(macd_avg*5)
          //  super_range = Math.abs(macd_avg*8)
         //  console.log("macd :"+JSON.stringify(macdData2))
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
             // console.log("CHeck phan ky" + coinName2)
               //  console.log("intersect_macd_index_array "+ intersect_macd_index_array.length)
               var tyle = (Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)/ priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close)  * 100
               var tyle0 = (Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[0]].MACD)/ priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close)  * 100
               var macd0 = macdData2[[macdData2.length - 1] -intersect_macd_index_array[0]].MACD 
               var macd1 = macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD
             //  console.log("coinName " + coinName2 + "  tyle_1:  " + tyle + "  tyle_0 : " + tyle0  + "  macd_0:  "+macd0 + "  macd_1 : "+ macd1+    "  time " + timeRequest)
             

              if( (macdData2[[macdData2.length - 1] -intersect_macd_index_array[0]].MACD < macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)
                  && (priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close > priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close)
                  && (((Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)/ priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close) *100)> range )
                  )
              {
                  var time = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].closeTime)
                  var oldTime = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].closeTime)
             //     var lastPrice = priceDatas[priceDatas.length - 1].close
                  {
                        // console.log( coinName2 + " phan ki tang i :" + intersect_macd_index_array[0]
                        //   + "  i+1  : " + intersect_macd_index_array[1]
                        //   + "  timeRequest  " + timeRequest
                        // //  + "  lastestPrice  " + lastPrice
                        //   + "   price  :" + priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close
                        //   )
                            coinDivergenceList.push(coinName2)
                          //  logStr += total_coin_phanky+ "  "+  timeRequest +", phan ki giam " + coinName2 +"  "+ intersect_macd_index_array[0]+"   " + lastPrice +"\n"                          
                          logStr = total_coin_phanky+ "  "+  timeRequest +", Xem ban Phan ky " + coinName2 + "  tyle_1:  " + tyle + "  tyle_0 : " + tyle0  + "  macd_0:  "+macd0 + "  macd_1 : "+ macd1 + "  range " + range +"\n"
                          hasPhanKy = true
                         // bot.sendMessage(chatId, logStr)
               
                          }
              }
              if( (macdData2[[macdData2.length - 1] -intersect_macd_index_array[0]].MACD < macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)
                  // && (priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].close < priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].close)
                  && (((Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD) /priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close) *100) > super_range )
                  )
              {
                    //   console.log("Ema10 " + (ema10))
                    // console.log( coinName2 + " phan ki tang i :" + intersect_macd_index_array[0]
                    // + "  i+1  : " + intersect_macd_index_array[1]
                    // + "  timeRequest  " + timeRequest
                    // + "  lastestPrice  " + lastPrice
                    // + "   price  :" + priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close
                    // )
                    coinDivergenceList.push(coinName2)
                    // logStr += total_coin_phanky+ "  "+  timeRequest +", Qua ban " + coinName2 +"  "+ intersect_macd_index_array[0]+"   " 
                    
                    // +"\n"
                    logStr = total_coin_phanky+ "  "+  timeRequest +", Xem ban " + coinName2 + "  tyle_1:  " + tyle + "  tyle_0 : " + tyle0  + "  macd_0:  "+macd0 + "  macd_1 : "+ macd1+ "  supe range " + super_range+ "\n"
                    hasPhanKy = true
                //    bot.sendMessage(chatId, logStr)
                  }

               //   console.log("  i  " + i )
               if(hasPhanKy == true){
                bot.sendMessage(chatId, logStr)
                console.log(logStr)
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

const updatePriceForBuy = async (coinName2,timeRequest, range, super_range)=>{
        try{

         //         console.log("timeRequest  " + timeRequest + "  , coinName :  " +coinName2 )
                //	let macdData  = await macd(12,26,9,"close", "binance", "BNB/USDT",timeRequest,true);

                   let priceDatas =   await client.candles({ symbol: coinName2, limit:1000,interval:timeRequest })

                    var intersect_macd_index_array = []
                    var prices = []
                    var last50Prices = []
                    var lastestCandleIsPinbarUp = false
                    var lastestCandleIsPinbarUp2 = false
                    for(var i =0; i < priceDatas.length; i++)
                    {
                	  //   console.log(coinName2+ "   "+i + "    priceDatas " + priceDatas[i].close)
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
                  var macd_sum = 0;

                  for(var i = 0; i < macdData2.length; i++){
                    macd_sum += macdData2[i].MACD
                  }
                  var macd_avg = macd_sum/macdData2.length
                  // range = Math.abs(macd_avg*5)
                  // super_range = Math.abs(macd_avg*8)
                  // console.log("MACD__aVG " + macd_avg)

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
                   // console.log("CHeck phan ky" + coinName2)
                     //  console.log("intersect_macd_index_array "+ intersect_macd_index_array.length)
                    var tyle = (Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)/ priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close)  * 100
                    var tyle0 = (Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[0]].MACD)/ priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close)  * 100
                    var macd0 = macdData2[[macdData2.length - 1] -intersect_macd_index_array[0]].MACD 
                    var macd1 = macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD
                  //  console.log("coinName " + coinName2 + "  tyle_1:  " + tyle + "  tyle_0 : " + tyle0  + "  macd_0:  "+macd0 + "  macd_1 : "+ macd1+    "  time " + timeRequest)
                  
                    if( (macdData2[[macdData2.length - 1] -intersect_macd_index_array[0]].MACD > macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)
                        && (priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close < priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close)
                        && (((Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)/ priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close) *100)> range )
                        )
                    {
                        var time = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].closeTime)
                        var oldTime = timeConverter(priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].closeTime)
                        var lastPrice = priceDatas[priceDatas.length - 1].close
                        {
                          //     console.log( coinName2 + " phan ki tang i :" + intersect_macd_index_array[0]
                          //       + "  i+1  : " + intersect_macd_index_array[1]
                          //       + "  timeRequest  " + timeRequest
                          // //      + "  lastestPrice  " + lastPrice
                          // //      + "   price  :" + priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close
                          //       )
                                  coinDivergenceList.push(coinName2)
                               //   logStr += total_coin_phanky+ "  "+  timeRequest +", phan ki tang " + coinName2 +"  "+ intersect_macd_index_array[0]+"   "  +"\n"                          
                                  logStr = total_coin_phanky+ "  "+  timeRequest +", Xem mua Phan ky " + coinName2 + "  tyle_1:  " + tyle + "  tyle_0 : " + tyle0  + "  macd_0:  "+macd0 + "  macd_1 : "+ macd1 + "   range  "+ range + "\n"
                                  hasPhanKy = true
                                 
                                }
                    }

                    if( (macdData2[[macdData2.length - 1] -intersect_macd_index_array[0]].MACD > macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD)
                        // && (priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i]].close < priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[i+1]].close)
                        && (((Math.abs(macdData2[[macdData2.length - 1] - intersect_macd_index_array[1]].MACD) /priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[1]].close) *100) > super_range )
                        )
                    {
                          //   console.log("Ema10 " + (ema10))
                      //     console.log( coinName2 + " phan ki tang i :" + intersect_macd_index_array[0]
                      //     + "  i+1  : " + intersect_macd_index_array[1]
                      //     + "  timeRequest  " + timeRequest
                      //  //   + "  lastestPrice  " + lastPrice
                      // //    + "   price  :" + priceDatas[[priceDatas.length - 1] - intersect_macd_index_array[0]].close
                      //     )
                          coinDivergenceList.push(coinName2)
                          logStr = total_coin_phanky+ "  "+  timeRequest +", Xem mua  " + coinName2 + "  tyle_1:  " + tyle + "  tyle_0 : " + tyle0  + "  macd_0:  "+macd0 + "  macd_1 : "+ macd1 + "  super range  "+ super_range+ "\n"
                          hasPhanKy = true
                
                        }


                    if(hasPhanKy == true){
                    //  bot.sendMessage(chatId, logStr)
                      console.log(logStr)
                    }
                     //   console.log("  i  " + i )
                   

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
  //        total_coin_phanky = 0
	//      coinDivergenceList = []


	//	currentSymbols = await client.futuresOpenOrders()
		//  currentSymbols = []
		//  currentSymbols = await client.futuresOpenOrders()
	//	 console.log(currentSymbols);

      let rawdata = fs.readFileSync('coin_list.json');
      let coinArray = JSON.parse(rawdata)
      // Examine the values:
      var timeArr = ["15m", "30m", "1h", "4h"]
   
      for(var coinIndex = 0; coinIndex < pricesArr.length; coinIndex++)
     //  for(var coinIndex = 0; coinIndex < coinArray.length; coinIndex++)
         {
          console.log("------------------------------------------")
          //    var symbol = coinArray[coinIndex];
             // var coinName = coinArray[coinIndex].name ;
              var coinName = pricesArr[coinIndex].toString() ;
              var score_buy = 0;
              var score_sell = 0;
              var logStr2 = "";
            //  for(var time_itr = 0; time_itr <symbol.time_request.length; time_itr++ )
              for(var time_itr = 0; time_itr <timeArr.length; time_itr++ )
              {
                // var time_request = symbol.time_request[time_itr].time
                // var range = symbol.time_request[time_itr].range
                // var super_range = symbol.time_request[time_itr].super_range
                var time_request = timeArr[time_itr]
                var range = 0.66
                var super_range = 1

             //   console.log("coinName " + coinName + "  time_request " + time_request + "  range  " + range + "  super ranger "+ super_range)
                var check_buy =     updatePriceForBuy(coinName,time_request,range, super_range)
               
                var check_shell =  updatePriceForSell(coinName,time_request, range, super_range)
              
                if(check_buy.hasPhanKy == true)
                {
                  score_buy +=1
                  logStr2 += check_buy.logStr 
                } 
                if(check_shell.hasPhanKy == true)
                {
                  score_sell +=1
                  logStr2 += check_buy.logStr 
                }
              }

              if(score_buy >=3){
                  bot.sendMessage(chatId, logStr)
              }
              if(score_sell >=3){
                bot.sendMessage(chatId, logStr)
            }
                await wait(1000);
        }


    } catch (err) {
    //	 log_str += err + "  " + coinName + "\n";
       console.log("line 537  " +err + "\n");
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





































