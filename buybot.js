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


var accountInfo;
const {StochasticRSI} = require('technicalindicators');

const client = Binance({

	apiKey: 'dB3Ig87GhzpCeNlwAtq6tj7YLdDgA2W4CAKPY44u6fVTyTChtZfoI5EWVseZOasV',
	apiSecret:'sI908B3erDr0s1WRvr9pfoYmHw7PntWEvM8b46jPPUUWaCIYXDBrqgMj3w2LSbwh',
	useServerTime:true,
});
client.sy
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
var accountInfo;

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

const stepSizeMap = new Map();
const priceBuyMap = new Map();
const updateEMA = async()=>{
    try {
     
	
		prices = await client.futuresPrices();
		let pricesArr = Object.keys(prices);

			for(var i = 0; i < pricesArr.length; i++)
			 {
					var symbolName = pricesArr[i].toString();
					//console.log("symbolName   "+ symbolName)
					var coinName ;
					if(symbolName.includes("USDT"))
					{

						coinNameChars = symbolName.split("USDT");
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
					// && (m_Macd > m_Macd_signal)
					// && (macd_histogram_2 < macd_histogram_1)
					 )
					{
								bot.sendMessage(chatId, " Ema tang " + coinName +"   " + ema10);
								console.log("coin name " + coinName );
								log_str += " Ema tang " + coinName +"   " + ema10 +"\n";

								try {
									console.log("BUy symbol Name :"+ symbolName)
									buySuccess = await buy(symbolName);	
								} catch (e) {
									console.error('ERROR IN buy(): ', e);
									console.log('RESUMING OPERATIONS\n');
								//	continue;
								}
								// if(buySuccess === 'failure') continue;
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
    	// log_str += err + "  " + coinName + "\n";
        console.log(err + "\n");
    }
}

function roundStep(qty, stepSize) {
    // Integers do not require rounding
    if (Number.isInteger(qty)) return qty;
    const qtyString = qty.toFixed(16);
    const desiredDecimals = Math.max(stepSize.indexOf('1') - 1, 0);
    const decimalIndex = qtyString.indexOf('.');
    return parseFloat(qtyString.slice(0, decimalIndex + desiredDecimals + 1));
}

// create order
const makeBuyOrder = async(symbolName, buyQuantity, currentPrice)=>{
	console.log("Make buy order " + buyQuantity + " price. " + currentPrice);

	if(buyQuantity > 0)
	{
		buyOrderInfo = await client.order({

			symbol: symbolName,
			side: 'BUY',
			quantity: buyQuantity,
			price: currentPrice,
		});
		console.log('buyOrderInfo: ', buyOrderInfo, '\n');
	}
}
// wait buy order completely

const waitBuyOrderCompetion = async(symbolName)=>{

	console.log('WAITING BUY ORDER COMPLETION');

	for(let i = 0; i < 5;i++){
		buyOrderInfo = await client.getOrder({
			symbol: symbolName,
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
				symbol: symbolName,
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
		symbol: symbolName,
  		orderId: buyOrderInfo.orderId,
	});
	return 'failure';
}
// tinh so coin co the mua va gia
const calculateBuyQuantity = async(symbolName)=>{
	console.log('CALCULATING BUY QUANTITY');

	
	console.log(accountInfo);
	let USDTBalance = accountInfo.balances[INDEX_USDT].free;
	if(USDTBalance > 11){
		USDTBalance = 11;
	}
	console.log('USDT balance: ', USDTBalance);
	let prices = await client.prices();
	let currentPrice = prices[symbolName];
	priceBuyMap.set(symbolName, currentPrice)
	//currentPrice = currentPrice*1.02;
	console.log(symbolName +' Price: ', currentPrice);     
	
	var stepSizeScale = 1/ stepSizeMap.get(symbolName);
	var buyQuantity = (Math.floor(0.99*(USDTBalance / currentPrice)*stepSizeScale))/stepSizeScale;
	
	console.log("symbol :  " + symbolName + "  stepSizeScale " + stepSizeScale)
	console.log('BuyQuantity: ', buyQuantity, '\n');
	return { 
		buyQuantity,
		currentPrice
	};
}

const buy = async(symbolName)=>{


	let USDTBalance = accountInfo.balances[INDEX_USDT].free;
	console.log(' BUYING USDTBalance  ' + USDTBalance);
	if(USDTBalance > 11)
	{
		console.log('Do BUYING ');
		let { buyQuantity, currentPrice} = await calculateBuyQuantity(symbolName);
		
		let USDTBalance = accountInfo.balances[INDEX_USDT].free;
		if(USDTBalance > 11){
			USDTBalance = 11;
		}
		
		if(buyQuantity > 0.001)
			{
			await makeBuyOrder(symbolName,buyQuantity, currentPrice);
			let buySuccess =  await waitBuyOrderCompetion(symbolName);
			return buySuccess;
		}else{
			return 'success';
		}
	}
}

// Calculates how much profit a sale would incur
const calculateProfit = async (symbolName) => {
	console.log('CALCULATING PROFIT  ' + symbolName);
	let buyingPrice = priceBuyMap.get(symbolName);// buyOrderInfo.price;
	let prices = await client.prices({ symbol: symbolName });
	let currentPrice = prices[symbolName];
	let profit = ((currentPrice/buyingPrice) - 1) * 100;
	// console.log('currentPrice [XRP]: ', currentPrice);
	// console.log('buyingPrice: ', buyingPrice);
	console.log('profit: ', profit, '\n');
	return {
		profit,
		currentPrice
	};
}

// Creates a sell order in the Binance API
const makeSellOrder = async (symbolName,currentPrice, quantityValue) => {
	

	sellOrderInfo = await client.order({
		symbol: symbolName,
		side: 'SELL',
		quantity: quantityValue,
		price: currentPrice,
	});
	console.log('sellOrderInfo: ', sellOrderInfo, '\n');
}

// Waits till a sell order is completely filled or times out empty
const waitSellOrderCompletion = async (symbolName) => {
	console.log('WAITING SELL ORDER COMPLETION');
	for(let i = 0; i < 5; i++){
		sellOrderInfo = await client.getOrder({
			symbol: symbolName,
			orderId: sellOrderInfo.orderId,
		});
		// console.log('sellOrderInfo: ', sellOrderInfo);
		if(sellOrderInfo.status === 'FILLED'){
			console.log('SALE COMPLETE! \n');
			return 'success';
		}
		await wait(ORDER_UPDATE_PERIOD);
	}
	if(sellOrderInfo.status === 'PARTIALLY_FILLED'){
		console.log('SALE PARTIALLY FILLED, CONTINUING');
		while(true){
			sellOrderInfo = await client.getOrder({
				symbol: symbolName,
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
		symbol: symbolName,
  	orderId: sellOrderInfo.orderId,
	});
	return 'failure';
}

// Selling mechanism, invokes the 3 functions above as needed
const sell = async (symbolName) => {
	console.log('SELLING');
	let sellSuccess;

	//while(true)
	{
		
		let { profit, currentPrice } = await calculateProfit(symbolName);
		//if(profit >= 0.175)
		if(profit >= 1)
		{
			bot.sendMessage(chatId, " take profit " + coinName +"   " );
			let prices = await client.prices({ symbol: symbolName });
			let currentPrice = prices[symbolName];
			let coinBalance = accountInfo.balances[symbolName].free;
			sellQuantity = (Math.floor((coinBalance)*10000))/10000.0;
			await makeSellOrder(symbolName,currentPrice,sellQuantity);
			sellSuccess = await waitSellOrderCompletion(symbolName);
		//	if(sellSuccess === 'failure') continue;
			return;
		}
		// if(profit < -0.2){
			// TODO: Implement stop logic
		// }
		await wait(PRICE_UPDATE_PERIOD);
	}
}

const sellNow = async (symbolName) => {
	console.log('SELLING');
	let sellSuccess;

	//console.log(accountInfo.balances)
	while(true){
		console.log('CALCULATING PROFIT');
	
		let prices = await client.prices({ symbol: symbolName });
		let currentPrice = prices[symbolName];
		let accountInfo = await client.accountInfo()
		let sellQuantity
		accountInfo.balances.forEach((balance) => {
			if (balance.asset === symbolName.split("USDT")[0]) {
				console.log("Balace " + balance.free)
				sellQuantity = balance.free
			}
		})

		var stepSizeScale = 1/ stepSizeMap.get(symbolName);
	//var buyQuantity = (Math.floor(0.99*(USDTBalance / currentPrice)*stepSizeScale))/stepSizeScale;
		sellQuantity = (Math.floor(0.99*(sellQuantity)*stepSizeScale))/stepSizeScale;
		 
		// sellQuantity = (Math.floor((coinBalance)*10000))/10000.0;
	
		await makeSellOrder(symbolName,currentPrice,sellQuantity);
		sellSuccess = await waitSellOrderCompletion(symbolName);
		if(sellSuccess === 'failure') continue;
		return;
	
		await wait(PRICE_UPDATE_PERIOD);
	}
}

const sellByEmaSignal = async()=>{

	let sellSuccess;

	//let BTCBalance = accountInfo.balances[INDEX_COINT].free;
	prices = await client.prices();
	for(var i = 0; i < accountInfo.balances.length;i++)
	{
		let symbolName= accountInfo.balances[i].asset;
		let balance = accountInfo.balances[i].free;
		let currentPrice = prices[symbolName+"USDT"];
		let totalMoney = balance* currentPrice;
		

		if(totalMoney > 10)
		{
					await sell(symbolName+"USDT")
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
				//	 || (m_Macd < m_Macd_signal)
				//	|| (macd_histogram_2 > macd_histogram_1)
					 )
					{
								sellNow(symbolName+"USDT")
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

	var	exchangeInfo = await client.exchangeInfo();
	accountInfo = await client.accountInfo();
	var arayOrder = await client.tradesHistory({ symbol: 'BTTUSDT' })
	console.log("trade history 0 :  "+ JSON.stringify(arayOrder))
	console.log("trade history :  "+ JSON.stringify(arayOrder[arayOrder.length -1]))
	// client.allBookTickers((error, ticker) => {
	 	//console.log("bookTickers", client.allBookTickers()["HOTUSDT"]);
	//   });
//	console.log("Price : " +JSON.stringify( exchangeInfo.symbols[0].symbol))//filters[2]))
	exchangeInfo.symbols.forEach(element =>
		{ 
		//	console.log(element.symbol)
			stepSizeMap.set(element.symbol,element.filters[2] .stepSize)
		});
	//console.log(stepSizeMap);
	// let prices = await client.prices({ symbol: "XRPUSDT" });
	// let currentPrice = prices["XRPUSDT"];
//	console.log("Current xrp price : " + exchangeInfo.symbols[110])
	// let buySuccess = null;
	//  accountInfo = await client.accountInfo();
	// //try{
	// //	await sync();
		// try {
		// 	symbolName = "DATAUSDT"
		// 	//console.log("SEll symbol Name :"+ symbolName)
		// 	// buySuccess = await buy(symbolName)
		// 	sellSuccess = await sellNow(symbolName);	
		// } catch (e) {
		// 	console.error('ERROR IN sell(): ', e);
		// 	console.log('RESUMING OPERATIONS\n');
		// //	continue;
		// }

	// //	let accountInfo = await client.accountInfo();
	// 	//console.log(accountInfo);
	// }catch(e){
	// 	console.log('Erorr DURING INIT :', e);
	// 	process.exit(-1);
	// }
	
	//	await updateEMA();
	while(1){
			accountInfo = await client.accountInfo();
			log_str = "";
			//  try{
				
			// 	await sell();
				
			//  }catch(e){
			// 	console.log("Error for sell", e);
			// 	process.exit(-1);
			//  }
			try{
				await updateEMA();
				await sync();
			}catch(e){
				console.log('Erorr Update ema', e);
				process.exit(-1);
			}
			 try{
				
				await sellByEmaSignal();
				
			 }catch(e){
				console.log("Error for sell", e);
				process.exit(-1);
			 }
			

		
		await wait(1000);
		
	}

})();


