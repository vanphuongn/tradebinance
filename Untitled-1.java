//+------------------------------------------------------------------+
//|                                                         bai2.mq4 |
//|                                  Copyright 2023, MetaQuotes Ltd. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+

#property copyright "Copyright 2023, MetaQuotes Ltd."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict

#include <stdlib.mqh>

//#include <mt4gui2.mqh>
// extern variables

extern double 	equityPercent = 2;
extern double 	fixedLotSize = 0.1;
extern double 	lotSize = 0.1;
extern double 	stopLoss = 50;
extern double 	takeProfit = 100;
extern double 	trailingStop = 50;

extern int 		slippage = 5; // do truot gia cho phep
extern int 		magicNumber = 123;
extern int 		mininumProfit = 50;
extern int 		fastMAPeriod = 10;
extern int 		slowMAPeriod = 20;
extern int 		reward_risk = 1;

extern bool 	hasTrailingStop = true;
extern bool 	dynamicLotSize = false;
extern bool 	checkOncePerBar = true;

// global variables
int buyTicket;
int sellTicket;
double usePoint;
int useSlippage;
int errorCode;


// for tele
//string bot_name;
//input long inChatID = 662991734 ;
//input string inToken = "6658651142:AAFR8xdRamvhin-XPvh-dBQb2FZMHntg6Wg";
//CCustomBot teleBot;

extern int CustomIndicatorHandle = 0;

int OnInit()
{
    //  teleBot.Token(inToken);
    //  teleBot.GetMe();
    //  bot_name = teleBot.Name();
    //  Print("bot_name"+ bot_name);
    //  string msg = "start bot forex " ;
    //  teleBot.SendMessage(inChatID, msg);
    //  Print("Send msg to tele  ");
    //  Comment("Phuongdz");
    //---
    usePoint = pipPoint(Symbol());
    useSlippage = getSlippage(Symbol(), slippage);
    return(INIT_SUCCEEDED);

}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//-----------------------------------------------------------------+
void OnTick()
{
    // Alert("Check ontick:");
    double previousOpen, previousClose;
    double currentOpen, currentClose;
    // Get the close price of the current candle
    currentClose = iClose(Symbol(), 0, 0);
    // Get the close price of the previous candle
    previousClose = iClose(Symbol(), 0, 1);
    currentOpen = iOpen (Symbol(), 0, 0);
    // Get the close price of the previous candle
    previousOpen = iOpen(Symbol(), 0, 1);

    int trend0 = iCustom(Symbol(),0,"TDI_mtf+alerts b600+","Current time frame",
                         13,PRICE_CLOSE,1,PRICE_CLOSE,1, false,2,0,7,0,34,0,1.6185,32,50,68,
                         "turn on Alert = true; turn off = false", true,true,true,true,false,
                         "arrows settings", false, "tdi arrows1",LimeGreen, Red,
                         6,1);

    int trend1 = iCustom(Symbol(),0,"TDI_mtf+alerts b600+","Current time frame",
                         13,PRICE_CLOSE,1,PRICE_CLOSE,1, false,2,0,7,0,34,0,1.6185,32,50,68,
                         "turn on Alert = true; turn off = false", true,true,true,true,false,
                         "arrows settings", false, "tdi arrows1",LimeGreen, Red,
                         6,2);

    // cal lotsize

    double lotSize = calcLotSize(dynamicLotSize,equityPercent, stopLoss, fixedLotSize);
    lotSize = verifyLotSize(lotSize);

    int previousLowestPrice = (previousOpen < previousClose) ? previousOpen : previousClose;
    int previousHigherPrice = (previousOpen > previousClose) ? previousOpen : previousClose;

    // buyOrder
    double askPrice = MarketInfo(Symbol(), MODE_ASK);
    if ((trend0 != trend1) && (trend0 ==  1)
            && (askPrice >previousLowestPrice)
            // && (buyTicket == 0)
            && (buyMarketCount(Symbol(), magicNumber) ==0))
    {
        if(sellMarketCount(Symbol(), magicNumber) > 0)
        {
            closeAllSellOrders(Symbol(), magicNumber, slippage);
        }

        sellTicket = 0;
        double currentPrice = MarketInfo(Symbol(), MODE_ASK);
        stopLoss = (currentPrice -getNearestLowerFractalPrice())/usePoint;
        takeProfit = stopLoss* reward_risk;
        if(stopLoss >0)
        {
            buyTicket = openBuyOrder(Symbol(), lotSize, useSlippage, magicNumber);
            int currentBar = Bars - 1;
            // Alert("==========Make buy order   "+ Symbol() +" index "+ currentBar  +"=========");
            //   teleBot.SendMessage(inChatID, "Make buy order   "+ Symbol());

            if(buyTicket > 0 && (stopLoss >0 || takeProfit >0))
            {
                OrderSelect(buyTicket, SELECT_BY_TICKET);
                double openPrice = OrderOpenPrice();
                double currentPrice = MarketInfo(Symbol(), MODE_ASK);
                stopLoss = (currentPrice -getNearestLowerFractalPrice())/usePoint;
                takeProfit = stopLoss* reward_risk;
                Alert("==========Make buy order   "+ Symbol() +" stopLoss "+ stopLoss +" takeProfit   " + takeProfit +"=========");
                double buyStopLoss = calcBuyStopLoss(Symbol(), stopLoss, openPrice);
                if(buyStopLoss >0)
                {
                    buyStopLoss = adjustBelowStopLevel(Symbol(), buyStopLoss, 5);
                }

                double buyTakeProfit = calBuyTakeProfit(Symbol(), takeProfit, openPrice);
                Alert("==========modify buy order   "+ Symbol() +" buyStopLoss "+ buyStopLoss +" buyTakeProfit   " + buyTakeProfit +"=========");

                if(buyTakeProfit >0)
                {
                    buyTakeProfit = adjustAboveStopLevel(Symbol(), buyTakeProfit, 5);
                }
                addStopProfit(buyTicket, buyStopLoss, buyTakeProfit);
            }
        }
    }

    // sell Order
    double bidPrice = MarketInfo(Symbol(), MODE_BID);
    // if(fastMA < slowMA && sellTicket == 0)
    if ((trend0 != trend1) && (trend0 ==  -1)
            && (bidPrice < previousHigherPrice)
            //&& (sellTicket == 0)
            && (sellMarketCount(Symbol(), magicNumber) ==0)
            )
    {

        if(buyMarketCount(Symbol(), magicNumber) > 0)
        {
            closeAllBuyOrders(Symbol(), magicNumber, slippage);
        }

        double currentPrice = MarketInfo(Symbol(), MODE_BID);
        stopLoss = (getNearestUpperFractalPrice()- currentPrice)/usePoint;
        takeProfit = stopLoss* reward_risk;
        if(stopLoss >0)
        {
            sellTicket = openSellOrder(Symbol(), lotSize, useSlippage, magicNumber);
            int currentBar = Bars - 1;
            //teleBot.SendMessage(inChatID, "Make sell order   "+ Symbol());

            if(sellTicket > 0 && (stopLoss >0 || takeProfit >0))
            {
                OrderSelect(sellTicket,SELECT_BY_TICKET);
                double openPrice = OrderOpenPrice();
                Alert("==========Make sell order   "+ Symbol() +" stopLoss "+ stopLoss +" takeProfit   " + takeProfit +"=========");
                double sellStopLoss = calcSellStopLoss(Symbol(), stopLoss, openPrice);
                if(sellStopLoss > 0)
                {
                    sellStopLoss = adjustAboveStopLevel(Symbol(), sellStopLoss, 5);
                }
                double sellTakeProfit = calcSellTakeProfit(Symbol(), takeProfit, openPrice);
                if(sellTakeProfit >0)
                {
                    sellTakeProfit = adjustBelowStopLevel(Symbol(), sellTakeProfit, 5);
                }
                addStopProfit(sellTicket, sellStopLoss, sellTakeProfit);
            }
        }
    }

    if(hasTrailingStop == true)
    {
        // adjust trailing stops
        if(buyMarketCount(Symbol(), magicNumber) > 0 && trailingStop >0)
        {
            buyTrailingStop(Symbol(), trailingStop, mininumProfit, magicNumber);
        }

        if(sellMarketCount(Symbol(), magicNumber >0) && trailingStop > 0)
        {
            sellTrailingStop(Symbol(), trailingStop, mininumProfit, magicNumber);
        }
    }
}


double getNearestUpperFractalPrice()
{
    int nearestFractalBar = -1; // Số thanh nến chứa điểm Fractal gần nhất
    double nearestFractalPrice = 0.0; // Giá của điểm Fractal gần nhất

    int totalBars = Bars - 1; // Tổng số nến trên biểu đồ (trừ đi nến hiện tại)
    Alert("Tong so nen"+ totalBars);
    for (int i =0; i < totalBars; i++)
    {
        // Kiểm tra xem nến hiện tại có phải là điểm Fractal lên trên không
        bool isFractalUpper = iFractals(Symbol(), Period(), MODE_UPPER, i) != 0;
        if (isFractalUpper)
        {
            nearestFractalBar = i;
            nearestFractalPrice = High[i];
            break;
        }
    }

    if (nearestFractalBar != -1)
    {
        Alert("Fractal lên trên gần nhất tại nến số ", nearestFractalBar, " với giá ", nearestFractalPrice);
    }
    else
    {
        Print("Không tìm thấy Fractal lên trên.");
    }
    return nearestFractalPrice;

}

double getNearestLowerFractalPrice()
{
    int nearestFractalBar = -1; // Số thanh nến chứa điểm Fractal gần nhất
    double nearestFractalPrice = 0.0; // Giá của điểm Fractal gần nhất
    int totalBars = Bars - 1; // Tổng số nến trên biểu đồ (trừ đi nến hiện tại)

    for (int i =0; i < totalBars; i++)
    {
        // Kiểm tra xem nến hiện tại có phải là điểm Fractal xuống dưới không
        bool isFractalLower = iFractals(Symbol(), Period(), MODE_LOWER, i) != 0;

        if (isFractalLower)
        {
            nearestFractalBar = i;
            nearestFractalPrice = Low[i];
            break;
        }
    }

    if (nearestFractalBar != -1)
    {
        Print("Fractal xuống dưới gần nhất tại nến số ", nearestFractalBar, " với giá ", nearestFractalPrice);
    }
    else
    {
        Print("Không tìm thấy Fractal xuống dưới.");
    }

    return nearestFractalPrice;

}


int openBuyOrder(string argSymbol, double argLotSize, double argSlippage, double argMagicNumber, string argComment = "Buy Order")
{

    while(IsTradeContextBusy())
    {
        Sleep(10);
    }
    // place order
    int ticket = OrderSend(argSymbol, OP_BUY, argLotSize, MarketInfo(argSymbol, MODE_ASK), argSlippage, 0,0,argComment, 0, Green);
    // error handling
    if(ticket == -1)
    {
        string errorCode = GetLastError();
        string errDesc = ErrorDescription(errorCode);
        string errAlert = StringConcatenate("Open Buy Order -Error ", errorCode, " : ", errDesc);
        Alert(errAlert);
        string ErrLog = StringConcatenate("Bid: ",MarketInfo(argSymbol,MODE_BID),
                                          " Ask: ",MarketInfo(argSymbol,MODE_ASK)," Lots: ",argLotSize);
        Print(ErrLog);
    }
    return ticket;
}

int openSellOrder(string argSymbol, double argLotSize, double argSlippage,
                  double argMagicNumber, string argComment = "Sell Order")
{
    while(IsTradeContextBusy()) Sleep(10);
    // Place Sell Order
    int Ticket = OrderSend(argSymbol,OP_SELL,argLotSize,MarketInfo(argSymbol,MODE_BID),
                           argSlippage,0,0,argComment,argMagicNumber,0,Red);
    // Error Handling
    if(Ticket == -1)
    {
        int ErrorCode = GetLastError();
        string ErrDesc = ErrorDescription(ErrorCode);
        string ErrAlert = StringConcatenate("Open Sell Order - Error ",ErrorCode,
                                            ": ",ErrDesc);
        Alert(ErrAlert);
        string ErrLog = StringConcatenate("Bid: ",MarketInfo(argSymbol,MODE_BID),
                                          " Ask: ",MarketInfo(argSymbol,MODE_ASK)," Lots: ",argLotSize);
        Print(ErrLog);
    }
    return(Ticket);

}


int openBuyStopOrder(string argSymbol, double argLotSize, double argPendingPrice, double argStopLoss, double argTakeProfit, double argSlippage, double argMagicNumber, datetime argExpiration = 0, string argComment = "Buy Stop Order")
{
    while(IsTradeContextBusy()) Sleep(10);
    // Place Buy Stop Order

    int Ticket = OrderSend(argSymbol,OP_BUYSTOP,argLotSize,argPendingPrice,argSlippage,
                           argStopLoss,argTakeProfit,argComment,argMagicNumber,argExpiration,Green);

    // Error Handling

    if(Ticket == -1)
    {
        int ErrorCode = GetLastError();
        string ErrDesc = ErrorDescription(ErrorCode);
        string ErrAlert = StringConcatenate("Open Buy Stop Order - Error ",ErrorCode,
                                            ": ",ErrDesc);
        Alert(ErrAlert);
        string ErrLog = StringConcatenate("Ask: ",MarketInfo(argSymbol,MODE_ASK), " Lots: ",argLotSize," Price: ",argPendingPrice," Stop: ",argStopLoss, " Profit: ",argTakeProfit," Expiration: ",TimeToStr(argExpiration));
        Print(ErrLog);
    }
    return(Ticket);

}

int openSellStopOrder(string argSymbol, double argLotSize, double argPendingPrice, double argStopLoss, double argTakeProfit, double argSlippage, double argMagicNumber, datetime argExpiration = 0, string argComment = "Sell Stop Order")
{
    while(IsTradeContextBusy()) Sleep(10);

    // Place Sell Stop Order
    int Ticket = OrderSend(argSymbol,OP_SELLSTOP,argLotSize,argPendingPrice,argSlippage,
                           argStopLoss,argTakeProfit,argComment,argMagicNumber,argExpiration,Red);
    // Error Handling
    if(Ticket == -1)
    {
        int ErrorCode = GetLastError();
        string ErrDesc = ErrorDescription(ErrorCode);
        string ErrAlert = StringConcatenate("Open Sell Stop Order - Error ",ErrorCode,
                                            ": ",ErrDesc);
        Alert(ErrAlert);
        string ErrLog = StringConcatenate("Bid: ",MarketInfo(argSymbol,MODE_BID), " Lots: ",argLotSize," Price: ",argPendingPrice," Stop: ",argStopLoss, " Profit: ",argTakeProfit," Expiration: ",TimeToStr(argExpiration));
        Print(ErrLog);
    }

    return(Ticket);
}

int openBuyLimitOrder(string argSymbol, double argLotSize, double argPendingPrice, double argStopLoss, double argTakeProfit, double argSlippage, double argMagicNumber, datetime argExpiration, string argComment = "Buy Limit Order")
{

    while(IsTradeContextBusy()) Sleep(10);
    // Place Buy Limit Order
    int Ticket = OrderSend(argSymbol,OP_BUYLIMIT,argLotSize,argPendingPrice,argSlippage,
                           argStopLoss,argTakeProfit,argComment,argMagicNumber,argExpiration,Green);

    // Error Handling
    if(Ticket == -1)
    {
        int ErrorCode = GetLastError();
        string ErrDesc = ErrorDescription(ErrorCode);
        string ErrAlert = StringConcatenate("Open Buy Limit Order - Error ",ErrorCode,
                                            ": ",ErrDesc);
        Alert(ErrAlert);
        string ErrLog = StringConcatenate("Bid: ",MarketInfo(argSymbol,MODE_BID), " Lots: ",argLotSize," Price: ",argPendingPrice," Stop: ",argStopLoss, " Profit: ",argTakeProfit," Expiration: ",TimeToStr(argExpiration));
        Print(ErrLog);
    }
    return(Ticket);
}

int openSellLimitOrder(string argSymbol, double argLotSize, double argPendingPrice,
                       double argStopLoss, double argTakeProfit, double argSlippage, double argMagicNumber,
                       datetime argExpiration, string argComment = "Sell Limit Order")
{
    while(IsTradeContextBusy()) Sleep(10);
    // Place Sell Limit Order
    int Ticket = OrderSend(argSymbol,OP_SELLLIMIT,argLotSize,argPendingPrice,argSlippage,
                           argStopLoss,argTakeProfit,argComment,argMagicNumber,argExpiration,Red);
    // Error Handling
    if(Ticket == -1)
    {
        int ErrorCode = GetLastError();
        string ErrDesc = ErrorDescription(ErrorCode);
        string ErrAlert = StringConcatenate("Open Sell Stop Order - Error ",ErrorCode,
                                            ": ",ErrDesc);
        Alert(ErrAlert);
        string ErrLog = StringConcatenate("Ask: ",MarketInfo(argSymbol,MODE_ASK), " Lots: ",argLotSize," Price: ",
                                          argPendingPrice," Stop: ",argStopLoss, " Profit: ",argTakeProfit," Expiration: ",TimeToStr(argExpiration));
        Print(ErrLog);
    }
    return(Ticket);

}

bool closeBuyOrder(string argSymbol, int argCloseTicket, double argSlippage)
{
    OrderSelect(argCloseTicket, SELECT_BY_TICKET);
    if(OrderCloseTime() == 0)
    {
        double closeLots = OrderLots();
        while(IsTradeContextBusy()) Sleep(10);
        double closePrice = MarketInfo(argSymbol, MODE_ASK);
        bool closed = OrderClose(argCloseTicket, closeLots, closePrice, argSlippage, Red);

        if(closed == false)
        {
            int ErrorCode = GetLastError();
            string ErrDesc = ErrorDescription(ErrorCode);
            string ErrAlert = StringConcatenate("Close Buy Order - Error: ",ErrorCode,
                                                ": ",ErrDesc);
            Alert(ErrAlert);
            string ErrLog = StringConcatenate("Ticket: ",argCloseTicket," Ask: ",
                                              MarketInfo(argSymbol,MODE_ASK));
            Print(ErrLog);
        }
        return closed;
    }
    return false;
}

bool closeSellOrder(string argSymbol, int argCloseTicket, double argSlippage)
{
    OrderSelect(argCloseTicket, SELECT_BY_TICKET);
    if(OrderCloseTime() == 0)
    {
        double closeLots = OrderLots();
        while(IsTradeContextBusy()) Sleep(10);
        double closePrice = MarketInfo(argSymbol, MODE_BID);
        bool closed = OrderClose(argCloseTicket, closeLots, closePrice, argSlippage, Red);
        if(closed == false)
        {
            int ErrorCode = GetLastError();
            string ErrDesc = ErrorDescription(ErrorCode);
            string ErrAlert = StringConcatenate("Close Buy Order - Error: ",ErrorCode,": ",ErrDesc);
            Alert(ErrAlert);
            string ErrLog = StringConcatenate("Ticket: ",argCloseTicket," Ask: ",
                                              MarketInfo(argSymbol,MODE_BID));
            Print(ErrLog);
        }
        return closed;
    }
    return false;
}

bool closePendingOrder(string argSymbol, int argCloseTicket)
{
    OrderSelect(argCloseTicket,SELECT_BY_TICKET);
    bool Deleted = false;
    if(OrderCloseTime() == 0)
    {
        while(IsTradeContextBusy()) Sleep(10);
        Deleted = OrderDelete(argCloseTicket,Red);
        if(Deleted == false)
        {
            int ErrorCode = GetLastError();
            string ErrDesc = ErrorDescription(ErrorCode);
            string ErrAlert = StringConcatenate("Close Pending Order - Error: ",
                                                ErrorCode,": ",ErrDesc);
            Alert(ErrAlert);
            string ErrLog = StringConcatenate("Ticket: ",argCloseTicket," Bid: ",
                                              MarketInfo(argSymbol,MODE_BID)," Ask: ",MarketInfo(argSymbol,MODE_ASK));
            Print(ErrLog);
        }
    }
    return(Deleted);
}

double calcBuyStopLoss(string argSymbol, int argStopLoss, double argOpenPrice)
{
    if(argStopLoss == 0) return 0;
    double buyStopLoss = argOpenPrice -(argStopLoss * pipPoint(argSymbol));
    return buyStopLoss;

}

double calBuyTakeProfit(string argSymbol, int argTakeProfit, double argOpenPrice)

{
    if(argTakeProfit== 0) return 0;
    double buyTakeProfit = argOpenPrice + (argTakeProfit* pipPoint(argSymbol));
    return buyTakeProfit;

}

double calcSellStopLoss(string argSymbol, int argStopLoss, double argOpenPrice)
{
    if(argStopLoss == 0) return 0;
    double sellStopLoss = argOpenPrice +(argStopLoss * pipPoint(argSymbol));
    return sellStopLoss;
}

double calSellTakeProfit(string argSymbol, int argTakeProfit, double argOpenPrice)
{

    if(argTakeProfit== 0) return 0;
    double sellTakeProfit = argOpenPrice - (argTakeProfit* pipPoint(argSymbol));
    return sellTakeProfit;
}

double calcLotSize(bool argDynamicLotSize, double agrEquityPercent, double argStopLoss, double argFixedLotSize= 0.01)
{
    double mlotSize = 0;
    if(argDynamicLotSize == true)
    {
        double riskAmount = AccountEquity() * (agrEquityPercent / 100);
        double tickValue = MarketInfo(Symbol(), MODE_TICKVALUE);
        if((Point == 0.001) || (Point == 0.00001))
        {
            tickValue *= 10;
        }
        mlotSize = (riskAmount / argStopLoss) /tickValue;
    }else{
        mlotSize = argFixedLotSize;
    }
    return mlotSize;
}

double verifyLotSize(double argLotSize)
{
    // verification lotsize
    if(argLotSize < MarketInfo(Symbol(), MODE_MINLOT))
    {
        argLotSize = MarketInfo(Symbol(), MODE_MINLOT);
    }

    else if(argLotSize > MarketInfo(Symbol(), MODE_MAXLOT))
    {
        argLotSize = MarketInfo(Symbol(), MODE_MAXLOT);
    }

    if(MarketInfo(Symbol(), MODE_LOTSTEP) == 0.1)
    {
        argLotSize = NormalizeDouble(lotSize,1);
    }else{
        argLotSize =NormalizeDouble(lotSize, 2);
    }
    return argLotSize;
}

bool verifyUpperStopLevel(string argSymbol, double argVerifyPrice, double argOpenPrice = 0)
{
    double openPrice = argOpenPrice;
    double stopLevel = MarketInfo(argSymbol, MODE_STOPLEVEL) * Point;
    if(argOpenPrice == 0)
    {
        openPrice = MarketInfo(argSymbol, MODE_ASK);
    }
    else{
        openPrice = argOpenPrice;
    }

    double upperStopLevel = openPrice + stopLevel;
    bool stopVerify = false;

    if(argVerifyPrice > upperStopLevel)
    {
        stopVerify = true;

    }else
    {
        stopVerify = false;
    }

    return stopVerify;

}


bool verifyLowerStopLevel(string argSymbol, double argVerifyPrice, double argOpenPrice = 0)
{

    double openPrice = argOpenPrice;
    double stopLevel = MarketInfo(argSymbol, MODE_STOPLEVEL) * Point;
    if(argOpenPrice == 0)
    {
        openPrice = MarketInfo(argSymbol, MODE_BID);
    }
    else{
        openPrice = argOpenPrice;
    }

    double upperStopLevel = openPrice - stopLevel;
    bool stopVerify = false;

    if(argVerifyPrice > upperStopLevel)
    {
        stopVerify = true;
    }else
    {
        stopVerify = false;
    }
    return stopVerify;
}

double adjustAboveStopLevel(string argSymbol, double argAdjustPrice, int argAddPips = 0, double argOpenPrice = 0)
{
    double stopLevel = MarketInfo(argSymbol, MODE_STOPLEVEL) * Point;
    double openPrice = argOpenPrice;
    if(argOpenPrice ==0)
    {
        openPrice = MarketInfo(argSymbol, MODE_ASK);

    }else
    {
        openPrice = argOpenPrice + stopLevel;

    }

    double upperStopLevel = openPrice + stopLevel;
    double adjustedPrice = argAdjustPrice;
    if(argAdjustPrice <= upperStopLevel)
    {
        adjustedPrice = upperStopLevel+ (argAddPips+ pipPoint(argSymbol));
    }
    else{
        adjustedPrice = argAdjustPrice;
    }
    return adjustedPrice;

}


double adjustBelowStopLevel(string argSymbol, double argAdjustPrice, int argAddPips = 0, double argOpenPrice = 0)
{
    double stopLevel = MarketInfo(argSymbol, MODE_STOPLEVEL) * Point;
    double openPrice = argOpenPrice;
    if(argOpenPrice ==0)
    {
        openPrice = MarketInfo(argSymbol, MODE_BID);

    }else
    {
        openPrice = argOpenPrice;
    }

    double lowerStopLevel = openPrice - stopLevel;
    double adjustedPrice = argAdjustPrice;

    if(argAdjustPrice >= lowerStopLevel)
    {
        adjustedPrice = lowerStopLevel- (argAddPips+ pipPoint(argSymbol));
    }
    else{
        adjustedPrice = argAdjustPrice;
    }
    return adjustedPrice;

}


bool addStopProfit(int argTicket, double argStopLoss, double argTakeProfit)
{
    if(argStopLoss == 0 && argTakeProfit == 0) return false;
    OrderSelect(argTicket, SELECT_BY_TICKET);
    double openPrice = OrderOpenPrice();
    while(IsTradeContextBusy())
    {
        Sleep(10);
    }
    // modify

    bool ticketMod = OrderModify(argTicket, OrderOpenPrice(), argStopLoss, argTakeProfit, 0);

    // Error Handling

    if(ticketMod == false)
    {
        int errorCode = GetLastError();
        string errDesc = ErrorDescription(errorCode);
        string errAlert = StringConcatenate("Add Stop/Profit - Error ",errorCode,": ", errDesc);
        Alert(errAlert);
        string errLog = StringConcatenate("Bid: ",MarketInfo(OrderSymbol(),MODE_BID),
                                          " Ask: ",MarketInfo(OrderSymbol(),MODE_ASK)," Ticket: ",argTicket,
                                          " Stop: ",argStopLoss," Profit: ",argTakeProfit);
        Print(errLog);
    }
    return(ticketMod);

}


int totalOrderCount(string argSymbol, int argMagicNumber)
{
    int orderCount;
    for(int counter =0; counter <= OrdersTotal()-1; counter ++)
    {

        OrderSelect(counter, SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol)
        {
            orderCount++;
        }
    }

    return orderCount;
}

void closeAllBuyOrders(string argSymbol, int argMargicNumber, int argSlippage)
{
    for(int counter = 0; counter <= OrdersTotal()-1; counter++)
    {
        OrderSelect(counter, SELECT_BY_POS);

        if(OrderMagicNumber() == argMargicNumber && OrderSymbol() == argSymbol && OrderType() == OP_BUY)
        {
            // close order
            int closeTicket = OrderTicket();
            double closeLots = OrderLots();
            while(IsTradeContextBusy()) Sleep(10);
            double closePrice = MarketInfo(argSymbol, MODE_BID);
            bool closed = OrderClose(closeTicket, closeLots, closePrice, argSlippage, Red);

            // err handling
            if(closed == false)
            {
                string errCode = GetLastError();
                string errDesc = ErrorDescription(errorCode);
                string errAlert = StringConcatenate("Close All buy Order - Error ", errCode, " :", errDesc);
                Alert(errAlert);
                string errLog = StringConcatenate("Bid: ",MarketInfo(argSymbol,MODE_BID), " Ticket: ",closeTicket, " Price: ",closePrice);
                Print(errLog);
            }
            else{
                counter--;
            }
        }
    }
}


void closeAllSellOrders(string argSymbol, int argMagicNumber, int argSlippage)
{
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELL)
        {
            // Close Order
            int CloseTicket = OrderTicket();
            double CloseLots = OrderLots();
            while(IsTradeContextBusy()) Sleep(10);
            double ClosePrice = MarketInfo(argSymbol,MODE_ASK);
            bool Closed = OrderClose(CloseTicket,CloseLots,ClosePrice,argSlippage,Red);
            // Error Handling

            if(Closed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Close All Sell Orders - Error ",
                                                    ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Ask: ", MarketInfo(argSymbol,MODE_ASK)," Ticket: ",CloseTicket," Price: ", ClosePrice);
                Print(ErrLog);
            }
            else Counter--;
        }
    }
}



void closeAllBuyStopOrders(string argSymbol, int argMagicNumber)
{
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUYSTOP)
        {
            // Delete Order
            int CloseTicket = OrderTicket();
            while(IsTradeContextBusy()) Sleep(10);
            bool Closed = OrderDelete(CloseTicket,Red);
            // Error Handling
            if(Closed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Close All Buy Stop Orders - ",
                                                    "Error",ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Bid: ", MarketInfo(argSymbol,MODE_BID)," Ask: ", MarketInfo(argSymbol,MODE_ASK)," Ticket: ",CloseTicket);
                Print(ErrLog);
            }
            else Counter--;
        }
    }
}


void closeAllSellStopOrders(string argSymbol, int argMagicNumber)
{
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELLSTOP)
        {
            // Delete Order
            int CloseTicket = OrderTicket();
            while(IsTradeContextBusy()) Sleep(10);
            bool Closed = OrderDelete(CloseTicket,Red);
            // Error Handling
            if(Closed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Close All Sell Stop Orders - ", "Error ",ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Bid: ", MarketInfo(argSymbol,MODE_BID)," Ask: ", MarketInfo(argSymbol,MODE_ASK)," Ticket: ",CloseTicket);
                Print(ErrLog);
            }
            else Counter--;
        }
    }
}


void closeAllBuyStopOrders(string argSymbol, int argMagicNumber, int argSlippage)
{
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUYSTOP)
        {
            // Delete Order
            int CloseTicket = OrderTicket();
            while(IsTradeContextBusy()) Sleep(10);
            bool Closed = OrderDelete(CloseTicket,Red);
            // Error Handlin
            if(Closed == false)
            {
                string ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Close All Buy Stop Orders",
                                                    " - Error ",ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Bid: ",
                                                  MarketInfo(argSymbol,MODE_BID), " Ask: ",
                                                  MarketInfo(argSymbol,MODE_ASK)," Ticket: ",CloseTicket);
                Print(ErrLog);
            }
            else Counter--;
        }
    }
}

void closeAllBuyLimitOrders(string argSymbol, int argMagicNumber)
{
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUYLIMIT)
        {
            // Delete Order
            int CloseTicket = OrderTicket();
            while(IsTradeContextBusy()) Sleep(10);
            bool Closed = OrderDelete(CloseTicket,Red);
            // Error Handling
            if(Closed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Close All Buy Limit Orders - ", "Error ",ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Bid: ", MarketInfo(argSymbol,MODE_BID)," Ask: ", MarketInfo(argSymbol,MODE_ASK)," Ticket: ",CloseTicket);
                Print(ErrLog);
            }
            else Counter--;
        }
    }
}


void closeAllSellLimitOrders(string argSymbol, int argMagicNumber)
{
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELLLIMIT)
        {
            // Delete Order
            int CloseTicket = OrderTicket();
            while(IsTradeContextBusy()) Sleep(10);
            bool Closed = OrderDelete(CloseTicket,Red);
            // Error Handling

            if(Closed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Close All Sell Limit Orders - ", "Error ",ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Bid: ", MarketInfo(argSymbol,MODE_BID)," Ask: ", MarketInfo(argSymbol,MODE_ASK)," Ticket: ",CloseTicket);
                Print(ErrLog);
            }
            else Counter--;
        }
    }
}

void buyTrailingStop(string argSymbol, int argTrailingStop, int argMinProfit, int argMagicNumber)
{
    for(int counter = 0; counter <= OrdersTotal()-1; counter++)
    {
        OrderSelect(counter, SELECT_BY_POS);
     // cal max stop and min profit
        double maxStopLoss = MarketInfo(argSymbol, MODE_BID) - (trailingStop * pipPoint(argSymbol));
        maxStopLoss = NormalizeDouble(maxStopLoss, MarketInfo(OrderSymbol(), MODE_DIGITS));
        double currentStop = NormalizeDouble(OrderStopLoss(), MarketInfo(OrderSymbol(), MODE_DIGITS));
        double pipsProfit = MarketInfo(argSymbol, MODE_BID) - OrderOpenPrice();
        double minProfit = mininumProfit * pipPoint(argSymbol);
        // modify stop

        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUY && currentStop < maxStopLoss && pipsProfit >= minProfit)
        {
            bool trailed = OrderModify(OrderTicket(), OrderOpenPrice(), maxStopLoss, OrderTakeProfit(), 0);

            // err handling
            // Error Handling

            if(trailed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Buy Trailing Stop – Error ",ErrorCode,": ",ErrDesc);
                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Bid: ", MarketInfo(argSymbol,MODE_BID)," Ticket: ",OrderTicket()," Stop: ", OrderStopLoss()," Trail: ",maxStopLoss);
                Print(ErrLog);

            }
        }
    }
}

void sellTrailingStop(string argSymbol, int argTrailingStop, int argMinProfit, int argMagicNumber)
{

    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        // Calculate Max Stop and Min Profit
        double MaxStopLoss = MarketInfo(argSymbol,MODE_ASK) +
                (argTrailingStop * pipPoint(argSymbol));

        MaxStopLoss = NormalizeDouble(MaxStopLoss,
                                      MarketInfo(OrderSymbol(),MODE_DIGITS));
        double CurrentStop = NormalizeDouble(OrderStopLoss(),
                                             MarketInfo(OrderSymbol(),MODE_DIGITS));
        double PipsProfit = OrderOpenPrice() - MarketInfo(argSymbol,MODE_ASK);
        double MinProfit = argMinProfit * pipPoint(argSymbol);

        // Modify Stop
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELL && (CurrentStop > MaxStopLoss || CurrentStop == 0) && PipsProfit >= MinProfit)
        {
            bool Trailed = OrderModify(OrderTicket(),OrderOpenPrice(),MaxStopLoss,
                                                                             OrderTakeProfit(),0);
            // Error Handling
            if(Trailed == false)
            {
                int ErrorCode = GetLastError();
                string ErrDesc = ErrorDescription(ErrorCode);
                string ErrAlert = StringConcatenate("Sell Trailing Stop - Error ",
                                                    ErrorCode,": ",ErrDesc);

                Alert(ErrAlert);
                string ErrLog = StringConcatenate("Ask: ", MarketInfo(argSymbol,MODE_ASK)," Ticket: ",OrderTicket()," Stop: ", OrderStopLoss()," Trail: ",MaxStopLoss);
                Print(ErrLog);

            }
        }
    }
}

//+------------------------------------------------------------------+
// pip point func
// point la don vi nho nhat cua 1 cap tien, phu thuoc vao so chu so thap phan
// vi du cua Yen la 0.01, cac dong khac la 0.0001
//+------------------------------------------------------------------+
double pipPoint(string currency)
{
    double calcPoint = 0.01;
    int calcDigits = MarketInfo(currency, MODE_DIGITS);
    if(calcDigits ==2 || calcDigits == 3)
    {
        calcPoint = 0.01;
    }else if(calcDigits == 4 || calcDigits == 5)
    {
        calcPoint = 0.0001;
    }

    return calcPoint;
}

// get slippage func
int getSlippage(string currency, int slippagePips)
{
    double calcSlippage = slippagePips;
    int calcDigits = MarketInfo(currency, MODE_DIGITS);
    if(calcDigits == 2 || calcDigits == 4)
    {
        calcSlippage= slippagePips;
    }
    else if(calcDigits == 3 || calcDigits == 5)
    {

        calcSlippage = slippagePips * 10;

    }
    return calcSlippage;

}

int buyMarketCount(string argSymbol, int argMagicNumber)
{
    int OrderCount;
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUY)
        {
            OrderCount++;
        }
    }
    return(OrderCount);
}

int sellMarketCount(string argSymbol, int argMagicNumber)
{
    int OrderCount;
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELL)
        {
            OrderCount++;
        }
    }
    return(OrderCount);

}

int buyStopCount(string argSymbol, int argMagicNumber)
{
    int OrderCount;
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUYSTOP)
        {
            OrderCount++;
        }
    }
    return(OrderCount);

}

int sellStopCount(string argSymbol, int argMagicNumber)
{
    int OrderCount;
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELLSTOP)
        {
            OrderCount++;
        }
    }
    return(OrderCount);

}

int buyLimitCount(string argSymbol, int argMagicNumber)
{

    int OrderCount;
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_BUYLIMIT)
        {
            OrderCount++;
        }
    }

    return(OrderCount);

}


int sellLimitCount(string argSymbol, int argMagicNumber)
{
    int OrderCount;
    for(int Counter = 0; Counter <= OrdersTotal()-1; Counter++)
    {
        OrderSelect(Counter,SELECT_BY_POS);
        if(OrderMagicNumber() == argMagicNumber && OrderSymbol() == argSymbol
                && OrderType() == OP_SELLLIMIT)
        {
            OrderCount++;
        }
    }
    return(OrderCount);

}

double calcSellTakeProfit(string argSymbol, int argTakeProfit, double argOpenPrice)
{
    if(argTakeProfit == 0) return(0);
    double SellTakeProfit = argOpenPrice - (argTakeProfit * pipPoint(argSymbol));
    return(SellTakeProfit);

}
