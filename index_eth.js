var Binance = require('binance-api-node').default;
const ema = require('trading-indicator').ema;
const kdj = require('kdj').kdj;
const macd = require('trading-indicator').macd;
const TelegramBot = require('node-telegram-bot-api');

var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
const token = '1677444880:AAHC0UgHkuf0Y7NqsubVJSN4Q0WpPfFOYb8';
const chatId = "662991734";
const bot = new TelegramBot(token,{polling:true});


const {StochasticRSI} = require('technicalindicators');

const client = Binance({

	apiKey: 'dB3Ig87GhzpCeNlwAtq6tj7YLdDgA2W4CAKPY44u6fVTyTChtZfoI5EWVseZOasV',
	apiSecret:'sI908B3erDr0s1WRvr9pfoYmHw7PntWEvM8b46jPPUUWaCIYXDBrqgMj3w2LSbwh',
	useServerTime:true,
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

let timeRequest = "15m";
let prices ;

const updateEMA = async()=>{
    try {
     
		let accountInfo = await client.accountInfo();
		prices = await client.prices();
		let pricesArr = Object.keys(prices);

			for(var i = 0; i < pricesArr.length; i++)
			 {
					var coinName = pricesArr[i].toString() ;
					if(coinName.includes("USDT"))
					{

						coinNameChars = coinName.split("USDT");
						coinName= coinNameChars[0]+ "/"+ "USDT"
					
						
					try{
						
				
			      	let macdData  = await macd(12,26,9,"close", "binance", coinName,timeRequest,true);
			      	let m_Macd = macdData[macdData.length-1].MACD;

			      	let m_Macd_signal = macdData[macdData.length-1].signal;
			      	let macd_histogram_1 = macdData[macdData.length-1].histogram;
					let macd_histogram_2 = macdData[macdData.length-2].histogram;
			   		//console.log("MACD  1 "+macdData[macdData.length-1].MACD, " histogram:"  + macdData[macdData.length-1].histogram," sigal  " +macdData[macdData.length-1].signal);
					//console.log("MACD  2 "+macdData[macdData.length-2].MACD, " histogram:"  + macdData[macdData.length-2].histogram," sigal  " +macdData[macdData.length-2].signal);
					//console.log("MACD  3 "+macdData[macdData.length-3].MACD, " histogram:"  + macdData[macdData.length-3].histogram," sigal  " +macdData[macdData.length-3].signal);


			        let ema10Data = await ema(10, "close", "binance", coinName, timeRequest, true)
			        ema10_0 = ema10Data[ema10Data.length - 1];
			        ema10_1 = ema10Data[ema10Data.length - 2];

			        console.log("  -  " + coinName + "  " + ema10_1 );
			     //	console.log("Ema 20 : " + ema10Data[ema10Data.length - 1] + "   ,  " + ema10Data[ema10Data.length - 2]);

			        let ema20Data = await ema(20, "close", "binance", coinName, timeRequest, true)
			        ema20_0 = ema20Data[ema20Data.length - 1];
		     		ema20_1 = ema20Data[ema20Data.length - 2];

			        let ema50Data = await ema(50, "close", "binance", coinName, timeRequest, true)
			        ema50_0 = ema50Data[ema50Data.length - 1];
					ema50_1 = ema50Data[ema50Data.length - 2];

					if(((ema10_1 < ema20_1) || (ema10_1 < ema50_1)||(ema20_1 < ema50_1))
					 &&((ema10_0 > ema20_0) && (ema10_0 > ema50_0) && (ema20_0 > ema50_0) ) 
					 && (m_Macd > m_Macd_signal)
					 && (macd_histogram_2 < macd_histogram_1)
					 )
					{
								bot.sendMessage(chatId, " Ema tang " + coinName +"   " + ema10);
								console.log("coin name " + coinName );
								log_str += " Ema tang " + coinName +"   " + ema10 +"\n";
					}
			   	 }
			   	  catch (err)
			   	   {
      		 		 console.log(err + "  " + coinName  );
      		 		 log_str += err + "  " + coinName + "\n";
      		 		 continue;
    				}
    			}
			}
    } catch (err) {
    	 log_str += err + "  " + coinName + "\n";
        console.log(err + "\n");
    }
}

// tinh so coin co the mua va gia
const calculateBuyQuantity = async()=>{
	console.log('CALCULATING BUY QUANTITY');
	let accountInfo = await client.accountInfo();
	//console.log(accountInfo);
	let USDTBalance = accountInfo.balances[INDEX_USDT].free;
	if(USDTBalance > 10){
		USDTBalance = 10;
	}
	console.log('USDT balance: ', USDTBalance);
	let prices = await client.prices({ symbol: coin_name });
	let currentPrice = prices.ETHUSDT;
	console.log('ETH Price: ', currentPrice);     

	var buyQuantity = (Math.floor(0.99*(USDTBalance / currentPrice)*10000))/10000.0;


	console.log('BuyQuantity: ', buyQuantity, '\n');
	return { 
		buyQuantity,
		currentPrice
	};
}

// create order
const makeBuyOrder = async(buyQuantity, currentPrice)=>{
	console.log("Make buy order " + buyQuantity + " price. " + currentPrice);

	if(buyQuantity > 0)
	{
		buyOrderInfo = await client.order({

			symbol: 'ETHUSDT',
			side: 'BUY',
			quantity: buyQuantity,
			price: currentPrice,
		});
		console.log('buyOrderInfo: ', buyOrderInfo, '\n');
	}
}
// wait buy order completely

const waitBuyOrderCompetion = async()=>{

	console.log('WAITING BUY ORDER COMPLETION');

	for(let i = 0; i < 5;i++){
		buyOrderInfo = await client.getOrder({
			symbol: coin_name,
  			orderId: buyOrderInfo.orderId,
		});
		// console.log('buyOrderInfo: ', buyOrderInfo);
		if(buyOrderInfo.status === 'FILLED'){
			console.log('PURCHASE COMPLETE! \n');
			return 'success';
		}
		await wait(ORDER_UPDATE_PERIOD);
	}
	if(buyOrderInfo.status === 'PARTIALLY_FILLED'){
		console.log('PURCHASE PARTIALLY FILLED, CONTINUING');
		while(true){
			buyOrderInfo = await client.getOrder({
				symbol: coin_name,
				orderId: buyOrderInfo.orderId,
			});
			if(buyOrderInfo.status === 'FILLED'){
				console.log('PURCHASE COMPLETE! \n');
				return 'success';
			}
			await wait(ORDER_UPDATE_PERIOD);
		}
	}
	console.log('PURCHASE TIMED OUT, CANCELLING \n');
	await client.cancelOrder({
		symbol: coin_name,
  	orderId: buyOrderInfo.orderId,
	});
	return 'failure';
}

const buy = async()=>{

	console.log('BUYING');
	let { buyQuantity, currentPrice} = await calculateBuyQuantity();

	if(buyQuantity > 0.001)
		{
		await makeBuyOrder(buyQuantity, currentPrice);
		let buySuccess =  await waitBuyOrderCompetion();
		return buySuccess;
	}else{
		return 'success';
	}
}

const makeSellOrder = async(currentPrice, btcQuantity)=>{
	console.log("Making sell order with price " + currentPrice);
	
		console.log("sell quantity " + btcQuantity);

	sellOrderInfo = await client.order({
		symbol: coin_name,
		side: 'SELL',
		quantity: btcQuantity,
		price: currentPrice,
	});
	console.log('sellOrderInfo: ', sellOrderInfo, '\n');
}

const waitSellOrderCompletion = async()=>{
	console.log('Waiting sell order completion');
	for(let i = 0; i < 5; i++)
		{
			sellOrderInfo = await client.getOrder({

				symbol:coin_name,
				orderId: sellOrderInfo.orderId,
			});

			if(sellOrderInfo.status === 'FILLED')
				{
					console.log('SALE COMPLETE! \n');
					return 'success';
				}
				await wait(ORDER_UPDATE_PERIOD);
		}
	if(sellOrderInfo.status === 'PARTIALLY_FILLED'){
		console.log('SALE PARTIALLY FILLED, CONTINUING');
		
		while(true){
			sellOrderInfo = await client.getOrder({
				symbol: coin_name,
				orderId: sellOrderInfo.orderId,
			});
			// console.log('sellOrderInfo: ', sellOrderInfo);
			if(sellOrderInfo.status === 'FILLED'){
				console.log('SALE COMPLETE! \n');
				return 'success';
			}
			await wait(ORDER_UPDATE_PERIOD);
		}
	}
	console.log('SALE TIMED OUT, CANCELLING \n');
	await client.cancelOrder({
		symbol: coin_name,
  		orderId: sellOrderInfo.orderId,
	});
	return 'failure';
}

const sell = async()=>{

	let sellSuccess;
	let accountInfo = await client.accountInfo();
	let BTCBalance = accountInfo.balances[INDEX_COINT].free;
	prices = await client.prices();
	for(var i = 0; i < accountInfo.balances.length;i++)
	{
		let symbolName= accountInfo.balances[i].asset;
		let balance = accountInfo.balances[i].free;
		let currentPrice = prices[symbolName+"USDT"];
		let totalMoney = balance* currentPrice;
	

		if(totalMoney > 0)
		{
			console.log("  xxx  "+ symbolName + "   : " +currentPrice +"   "+ balance+ "  " + totalMoney);
					let	coinName= symbolName + "/USDT"
					
					try{
			      	let macdData  = await macd(12,26,9,"close", "binance", coinName,"30m",true);
			      	let m_Macd = macdData[macdData.length-1].MACD;

			      	let m_Macd_signal = macdData[macdData.length-1].signal;
			      	let macd_histogram_1 = macdData[macdData.length-1].histogram;
					let macd_histogram_2 = macdData[macdData.length-2].histogram;
			   		//console.log("MACD  1 "+macdData[macdData.length-1].MACD, " histogram:"  + macdData[macdData.length-1].histogram," sigal  " +macdData[macdData.length-1].signal);
					//console.log("MACD  2 "+macdData[macdData.length-2].MACD, " histogram:"  + macdData[macdData.length-2].histogram," sigal  " +macdData[macdData.length-2].signal);
					//console.log("MACD  3 "+macdData[macdData.length-3].MACD, " histogram:"  + macdData[macdData.length-3].histogram," sigal  " +macdData[macdData.length-3].signal);


			        let ema10Data = await ema(10, "close", "binance", coinName, "30m", true)
			        ema10_0 = ema10Data[ema10Data.length - 1];
			        ema10_1 = ema10Data[ema10Data.length - 2];

			      //  console.log("  -  " + coinName + "  " + ema10_1 );
			     //	console.log("Ema 20 : " + ema10Data[ema10Data.length - 1] + "   ,  " + ema10Data[ema10Data.length - 2]);

			        let ema20Data = await ema(20, "close", "binance", coinName, "30m", true)
			        ema20_0 = ema20Data[ema20Data.length - 1];
		     		ema20_1 = ema20Data[ema20Data.length - 2];

			        let ema50Data = await ema(50, "close", "binance", coinName, "30m", true)
			        ema50_0 = ema50Data[ema50Data.length - 1];
					ema50_1 = ema50Data[ema50Data.length - 2];

					if(((ema10_0 < ema20_0) || (ema10_0 < ema50_0) ||  (ema20_0 < ema50_0) ) 
					 || (m_Macd < m_Macd_signal)
					|| (macd_histogram_2 > macd_histogram_1)
					 )
					{

								bot.sendMessage(chatId, " coin giam " + coinName +"   " + totalMoney);
								console.log("coin name " + coinName );
								log_str += " coin giam " + coinName +"   " + ema10 +"\n";
					}

				

			   	 }
			   	  catch (err)
			   	   {
      		 		 console.log(err + "  " + coinName  );
      		 		 log_str += err + "  " + coinName + "\n";
      		 		 continue;
    				}
    			
		}
	}


}


(async function main(){

	let buySuccess = null;
	try{
		await sync();


	//	let accountInfo = await client.accountInfo();
		//console.log(accountInfo);
	}catch(e){
		console.log('Erorr DURING INIT :', e);
		process.exit(-1);
	}
	//	await updateEMA();
	while(true){
			log_str = "";

			 try{
				
				await sell();
				
			 }catch(e){
				console.log("Error for sell", e);
				process.exit(-1);
			 }
			 
			try{
				await updateEMA();
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

	
		
		await wait(15000);
	}

})();





































