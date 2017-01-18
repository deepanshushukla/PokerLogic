//var events = require('events');
window.usercreate=false;
function Table(smallBlind, bigBlind, minPlayers, maxPlayers, minBuyIn, maxBuyIn,turntime) {
    this.smallBlind = maxBuyIn/100;
    this.bigBlind = maxBuyIn/50;
    this.minPlayers = minPlayers;
    this.maxPlayers =  maxPlayers;
    this.players = [];
    this.dealer = 0; //Track the dealer position between games
    this.minBuyIn = minBuyIn;
    this.maxBuyIn = maxBuyIn;
    this.playersToRemove = [];
    this.playersToAdd = [];
    //this.eventEmitter = new events.EventEmitter();
    this.turnBet = {};
    this.allowedAction = {};
    this.gameWinners = [];
    this.gameLosers = [];
    this.turntime = turntime;

    //Validate acceptable value ranges.
    var err;
    if (minPlayers < 2) { //require at least two players to start a game.
        err = new Error(101, 'Parameter [minPlayers] must be a postive integer of a minimum value of 2.');
    } else if (maxPlayers > 10) { //hard limit of 10 players at a table.
        err = new Error(102, 'Parameter [maxPlayers] must be a positive integer less than or equal to 10.');
    } else if (minPlayers > maxPlayers) { //Without this we can never start a game!
        err = new Error(103, 'Parameter [minPlayers] must be less than or equal to [maxPlayers].');
    }

    if (err) {
        return err;
    }
}

function Player(playerName,chips,seatId,avatar,playerId,type,chipsLeft,table) {
    // alert('player callses');
    this.playerName = playerName;
    this.chips = chips;
    this.folded = false;
    this.playerId='';
    this.allIn = false;
    this.talked = false;
    this.seatId=seatId;
    this.avatar=avatar;
    this.type=type;
    this.table = table; //Circular reference to allow reference back to parent object.
    this.cards = [];
    this.chipsLeft=chipsLeft;
    this.winnercards='';
}

function fillDeck(deck) {
    deck.push('AS');
    deck.push('KS');
    deck.push('QS');
    deck.push('JS');
    deck.push('TS');
    deck.push('9S');
    deck.push('8S');
    deck.push('7S');
    deck.push('6S');
    deck.push('5S');
    deck.push('4S');
    deck.push('3S');
    deck.push('2S');
    deck.push('AH');
    deck.push('KH');
    deck.push('QH');
    deck.push('JH');
    deck.push('TH');
    deck.push('9H');
    deck.push('8H');
    deck.push('7H');
    deck.push('6H');
    deck.push('5H');
    deck.push('4H');
    deck.push('3H');
    deck.push('2H');
    deck.push('AD');
    deck.push('KD');
    deck.push('QD');
    deck.push('JD');
    deck.push('TD');
    deck.push('9D');
    deck.push('8D');
    deck.push('7D');
    deck.push('6D');
    deck.push('5D');
    deck.push('4D');
    deck.push('3D');
    deck.push('2D');
    deck.push('AC');
    deck.push('KC');
    deck.push('QC');
    deck.push('JC');
    deck.push('TC');
    deck.push('9C');
    deck.push('8C');
    deck.push('7C');
    deck.push('6C');
    deck.push('5C');
    deck.push('4C');
    deck.push('3C');
    deck.push('2C');

    //Shuffle the deck array with Fisher-Yates
    var i, j, tempi, tempj;
    for (i = 0; i < deck.length; i += 1) {
        j = Math.floor(Math.random() * (i + 1));
        tempi = deck[i];
        tempj = deck[j];
        deck[i] = tempj;
        deck[j] = tempi;
    }
}

function getMaxBet(bets) {
    var maxBet, i;
    maxBet = 0;
    for (i = 0; i < bets.length; i += 1) {
        if (bets[i] > maxBet) {
            maxBet = bets[i];
        }
    }
    return maxBet;
}

function checkForEndOfRound(table) {
    var maxBet, i, endOfRound;
    endOfRound = true;
    maxBet = getMaxBet(table.game.bets);
    //For each player, check
    for (i = 0; i < table.players.length; i += 1)
    {
        if (table.players[i].folded === false) {
            if (table.players[i].talked === false || table.game.bets[i] !== maxBet)
            {
                if (table.players[i].allIn === false)
                {
                    // table.currentPlayer = i;
                    endOfRound = false;
                }
            }

        }
    }


        var itercount=1;
        checkCurrentPlayer(table,endOfRound,table.currentPlayer,itercount,0);




    return endOfRound;
}
function checkCurrentPlayer(table,endOfRound,currplayer,itercount,userindex){
    var userIndex = userindex;
    if(endOfRound)
    {
        userIndex = userindex;
    }
    else
    {

        userIndex =  $.inArray(currplayer, window.useractionsequence);
        if(userIndex == window.useractionsequence.length-1){
            userIndex = 0;
        }else{
            userIndex++;
        }
//        table.currentPlayer = window.useractionsequence[userIndex];
    }

    if (table.players[window.useractionsequence[userIndex]].folded === true || table.players[window.useractionsequence[userIndex]].allIn==true)
    {
        itercount=itercount+1;
        if(itercount<=window.useractionsequence.length){
            checkCurrentPlayer(table,endOfRound,window.useractionsequence[userIndex],itercount,(userindex+1))
        }

    }
    else{

        table.currentPlayer = window.useractionsequence[userIndex];

    }

}

function checkForAllInPlayer(table, winners) {
    var i, allInPlayer;
    allInPlayer = [];
    for (i = 0; i < winners.length; i += 1)
    {
        if (table.players[winners[i]].allIn === true) {
            allInPlayer.push(winners[i]);
        }
    }
    return allInPlayer;
}

function checkForWinner(table) {
console.log('checkforwinner');
    for( var i=0;i<table.players.length;i++){
        console.log(i +'   '+table.players[i].chips);
    }
    var i, j, k, l, maxRank, winners, part, prize, allInPlayer, minBets, roundEnd;
    //Identify winner(s)
    winners = [];
    loosers = [];
    maxRank = 0.000;
    for (k = 0; k < table.players.length; k += 1)
    {
        if (table.players[k].hand.rank === maxRank && table.players[k].folded === false) {
            winners.push(k);
        }
        if (table.players[k].hand.rank > maxRank && table.players[k].folded === false) {
            maxRank = table.players[k].hand.rank;
            winners.splice(0, winners.length);
            winners.push(k);
        }

    }


    part = 0;
    prize = 0;
    allInPlayer = checkForAllInPlayer(table, winners);
    if (allInPlayer.length > 0) {
        minBets = table.game.roundBets[winners[0]];
        for (j = 1; j < allInPlayer.length; j += 1)
        {
            if (table.game.roundBets[winners[j]] !== 0 && table.game.roundBets[winners[j]] < minBets) {
                minBets = table.game.roundBets[winners[j]];
            }
        }
        part = parseInt(minBets, 10);
    } else{
        part = parseInt(table.game.roundBets[winners[0]], 10);

    }
    for (l = 0; l < table.game.roundBets.length; l += 1)
    {
        if (table.game.roundBets[l] > part)
        {
            prize += part;
            table.game.roundBets[l] -= part;
        } else
        {
            prize += table.game.roundBets[l];
            table.game.roundBets[l] = 0;
        }
    }
console.log('prize--------/// '+prize);
    for (i = 0; i < winners.length; i += 1) {
        var winnerPrize = parseInt(prize / winners.length);
        console.log(winnerPrize);
        var winningPlayer = table.players[winners[i]];
        var seatId = table.players[winners[i]].seatId;
        winningPlayer.chips += winnerPrize;
        if (table.game.roundBets[winners[i]] === 0)
        {
            winningPlayer.folded = true;
            table.gameWinners.push({
                playerName: winningPlayer.playerName,
                seatId:seatId,
                amount: winnerPrize,
                hand: winningPlayer.hand,
                chips: winningPlayer.chips
            });

//        var winnerHand = '';
//        for (l = 0; l < table.gameWinners[winners[i]].hand.glowArray.length; l += 1) {
//                    winnerHand = winnerHand+' '+table.gameWinners[winners[i]].hand.glowArray[l];
//
//        }
//console.log(winnerHand);
//
//        pokerTableDom.winnerPlayerView({'winnerArray':winners,'looserArr':loosers});
//
//        $('.dealer_chat_body').append('<span>Winner'+table.players[winners[i]].playerName+'' +
//            ' amount '+table.gameWinners[winners[i]].amount+' ' +
//            ''+table.gameWinners[winners[i]].hand.message+'  '+winnerHand+'</span><br/>');
//
//        console.log('Winner  ' + table.players[winners[i]].playerName + ' wins');
//        console.log('Winnning message ' + table.players[winners[i]].hand.message);
//        console.log('Winnning Rank ' + table.players[winners[i]].hand.rank+' '+winnerHand);

        //alert('player ' + table.players[winners[i]].playerName + ' wins !!');
        }
    }

    roundEnd = true;
    for (l = 0; l < table.game.roundBets.length; l += 1) {
        if (table.game.roundBets[l] !== 0) {
            roundEnd = false;
        }
    }
    if (roundEnd === false) {
       // alert('again check for winner')
        checkForWinner(table);
    }
   if(roundEnd==true)    {
       var looserArr=getLooserArray(table.gameWinners);
       pokerTableDom.showLooser(looserArr);
       winnerView(table.gameWinners,0);


    }


}
function winnerView(winnerArray){
    var i=0;
    debugger;
    console.log(winnerArray)
        if(winnerArray.length>0)
        {
            console.log(winnerArray[i])
            pokerTableDom.winnerPlayerView({'winnerArray':[winnerArray[i]], 'looserArr': loosers});
        }
    var winnertimeout=setTimeout(function(winnerArr,i){
        if(winnerArray.length>0){
            winnerArray.splice(0, 1);
            winnerView(winnerArray,i);
        }
        else
        {
            clearTimeout(winnertimeout)
            setTimeout(function(){
                    currenttable.initNewRound();
            },3000);
        }

    },3000);


}
function checkForBankrupt(table) {
    var i;
    for (i = 0; i < table.players.length; i += 1) {
        if (table.players[i].chips === 0) {
            table.gameLosers.push( table.players[i] );
            $('.playeraction').append('<span>player ' + table.players[i].playerName + ' is going bankrupt</span><br>')
            //console.log('player ' + table.players[i].playerName + ' is going bankrupt');
          //  table.players.splice(i, 1);
        }
    }
}

function Hand(cards) {
    this.cards = cards;
}

function sortNumber(a, b) {
    return b - a;
}

function Result(rank, message,glowArray) {
    this.rank = rank;
    this.message = message;
    this.glowArray = glowArray;
}

function rankKickers(ranks, noOfCards) {
    var i, kickerRank, myRanks, rank;

    kickerRank = 0.0000;
    myRanks = [],mycards=[],cards=[];
    rank = '';
    ranks=ranks.split('').reverse().join('');

console.log(ranks)
    for (i = 0; i <= ranks.length; i += 1) {
        rank = ranks.substr(i, 1);

        if (rank === 'A') {cards.push('A');myRanks.push(0.2048); }
        if (rank === 'K') {cards.push('K');myRanks.push(0.1024); }
        if (rank === 'Q') {cards.push('Q');myRanks.push(0.0512); }
        if (rank === 'J') {cards.push('J');myRanks.push(0.0256); }
        if (rank === 'T') {cards.push('T');myRanks.push(0.0128); }
        if (rank === '9') {cards.push('9');myRanks.push(0.0064); }
        if (rank === '8') {cards.push('8');myRanks.push(0.0032); }
        if (rank === '7') {cards.push('7');myRanks.push(0.0016); }
        if (rank === '6') {cards.push('6');myRanks.push(0.0008); }
        if (rank === '5') {cards.push('5');myRanks.push(0.0004); }
        if (rank === '4') {cards.push('4');myRanks.push(0.0002); }
        if (rank === '3') {cards.push('3');myRanks.push(0.0001); }
        if (rank === '2') {cards.push('2');myRanks.push(0.0000); }
    }

    myRanks.sort(sortNumber);

    for (i = 0; i < noOfCards; i += 1) {
        kickerRank += myRanks[i];
        mycards.push(cards[i])
    }
    var result= {
        'kickerRank': kickerRank,
         'myCards':mycards
    }
    return result;
}
function rankHandDealRound(hand) {
    var rank, message, handRanks, handSuits, ranks, suits, cards, result, i;

    rank = 0.0000;
    message = '';
    handRanks = [];
    handSuits = [];

    for (i = 0; i < hand.cards.length; i += 1) {
        handRanks[i] = hand.cards[i].substr(0, 1);
        handSuits[i] = hand.cards[i].substr(1, 1);
    }

    ranks = handRanks.sort().toString().replace(/\W/g, "");
    suits = handSuits.sort().toString().replace(/\W/g, "");
    cards = hand.cards.toString();

    if (rank === 0) {
        if (ranks.indexOf('AA') > -1) {
            rank = 26;
        }
        if (ranks.indexOf('KK') > -1 && rank === 0) {
            rank = 25;
        }
        if (ranks.indexOf('QQ') > -1 && rank === 0) {
            rank = 24;
        }
        if (ranks.indexOf('JJ') > -1 && rank === 0) {
            rank = 23 ;
        }
        if (ranks.indexOf('TT') > -1 && rank === 0) {
            rank = 22;
        }
        if (ranks.indexOf('99') > -1 && rank === 0) {
            rank = 21 ;
        }
        if (ranks.indexOf('88') > -1 && rank === 0) {
            rank = 20;
        }
        if (ranks.indexOf('77') > -1 && rank === 0) {
            rank = 19 ;
        }
        if (ranks.indexOf('66') > -1 && rank === 0) {
            rank = 18;
        }
        if (ranks.indexOf('55') > -1 && rank === 0) {
            rank = 17;
        }
        if (ranks.indexOf('44') > -1 && rank === 0) {
            rank = 16;
        }
        if (ranks.indexOf('33') > -1 && rank === 0) {
            rank = 15;
        }
        if (ranks.indexOf('22') > -1 && rank === 0) {
            rank = 14;
        }
        if (rank !== 0) {
            message = 'Pair';
        }
    }

//High Card
    if (rank === 0) {
        if (ranks.indexOf('A') > -1) {
            rank = 13 + rankKickers(ranks.replace('A', ''), 1);
        }
        if (ranks.indexOf('K') > -1 && rank === 0) {
            rank = 12 + rankKickers(ranks.replace('K', ''), 1);
        }
        if (ranks.indexOf('Q') > -1 && rank === 0) {
            rank = 11 + rankKickers(ranks.replace('Q', ''), 1);
        }
        if (ranks.indexOf('J') > -1 && rank === 0) {
            rank = 10 + rankKickers(ranks.replace('J', ''), 1);
        }
        if (ranks.indexOf('T') > -1 && rank === 0) {
            rank = 9 + rankKickers(ranks.replace('T', ''), 1);
        }
        if (ranks.indexOf('9') > -1 && rank === 0) {
            rank = 8 + rankKickers(ranks.replace('9', ''), 1);
        }
        if (ranks.indexOf('8') > -1 && rank === 0) {
            rank = 7 + rankKickers(ranks.replace('8', ''), 1);
        }
        if (ranks.indexOf('7') > -1 && rank === 0) {
            rank = 6 + rankKickers(ranks.replace('7', ''), 1);
        }
        if (ranks.indexOf('6') > -1 && rank === 0) {
            rank = 5 + rankKickers(ranks.replace('6', ''), 1);
        }
        if (ranks.indexOf('5') > -1 && rank === 0) {
            rank = 4 + rankKickers(ranks.replace('5', ''), 1);
        }
        if (ranks.indexOf('4') > -1 && rank === 0) {
            rank = 3 + rankKickers(ranks.replace('4', ''), 1);
        }
        if (ranks.indexOf('3') > -1 && rank === 0) {
            rank = 2 + rankKickers(ranks.replace('3', ''), 1);
        }
        if (ranks.indexOf('2') > -1 && rank === 0) {
            rank = 1 + rankKickers(ranks.replace('2', ''), 1);
        }
        if (rank !== 0)
        {
            message = 'High Card';
        }
    }

    result = new Result(rank, message);

    return result;
}
function rankHandInt(hand) {
    var rank, message, handRanks, handSuits, ranks, suits, cards, result, i;

    rank = 0.0000;
    message = '';
    handRanks = [];
    handSuits = [];

//    for (i = 0; i < hand.cards.length; i += 1) {
//        handRanks[i] = hand.cards[i].substr(0, 1);
//        handSuits[i] = hand.cards[i].substr(1, 1);
//    }
//
//    ranks = handRanks.sort().toString().replace(/\W/g, "");
//    suits = handSuits.sort().toString().replace(/\W/g, "");
//    cards = hand.cards.toString();
//    var hand ={
////        0: "8S",1: "AH",2: "6C",3: "JH",4: "2H",5: "KS",6: "QC"
////        'cards':['QS','TH','JD','TS','5D','9H','TC']
////        'cards':['QS','TH','JD','KS','5D','9H','TC']
//        'cards':['KC','QC','5H','4C','TC','TH','TS']
//   }
    console.log(hand);
    for (i = 0; i < hand.cards.length; i += 1) {
        handRanks[i] = hand.cards[i].substr(0, 1);
        handSuits[i] = hand.cards[i].substr(1, 1);
    }

    ranksUnSorted = handRanks.toString().replace(/\W/g, "");
    suitsUnSorted = handSuits.toString().replace(/\W/g, "");
    ranks = handRanks.sort().toString().replace(/\W/g, "");
    suits = handSuits.sort().toString().replace(/\W/g, "");
    cards = hand.cards.toString();

//    ranks = '59JQTTT';
//    suits = 'CDDHHSS';
//    cards = 'QS,TH,JD,TS,5D,9H,TC';
    console.log(ranks)
    console.log(suits)

    var ranksSordtedArr=ranks.split('');
    console.log(ranksSordtedArr);
    var ranksUnSorted=ranksUnSorted.split('');
    console.log(ranksUnSorted);
    var newarray=[];
    suitsUnSortedArr=suitsUnSorted.split('');
    console.log(suitsUnSortedArr);




var myCards =[];


    //Royal Flush
    if (rank === 0) {

        if (rank !== 0) {message = 'Four of a kind'; }
    }

    //Four of a kind

    if (rank === 0) {
        if (ranks.indexOf('AAAA') > -1) {
            rankKicker = rankKickers(ranks.replace('AAAA', ''), 1);
            myCards.push('A','A','A','A');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 292 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('KKKK') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KKKK', ''), 1);
            myCards.push('K','K','K','K');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 291 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('QQQQ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQQQ', ''), 1);
            myCards.push('Q','Q','Q','Q');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 290 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('JJJJ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJJJ', ''), 1);
            myCards.push('J','J','J','J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 289+ parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('TTTT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TTTT', ''), 1);
            myCards.push('T','T','T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 288 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('9999') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('9999', ''), 1);
            myCards.push('9','9','9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 287+ parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('8888') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('8888', ''), 1);
            myCards.push('8','8','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 286 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('7777') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('7777', ''), 1);
            myCards.push('7','7','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 285 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('6666') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('6666', ''), 1);
            myCards.push('6','6','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 284 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('5555') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('5555', ''), 1);
            myCards.push('5','5','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 283 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('4444') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('4444', ''), 1);
            myCards.push('4','4','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 282 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('3333') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('3333', ''), 1);
            myCards.push('3','3','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 281 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('2222') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('2222', ''), 1);
            myCards.push('2','2','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 280 + parseFloat(rankKicker.kickerRank)
        }
        if (rank !== 0) {
            message = 'Four of a kind';
        }
    }


    //Full House
    if (rank === 0) {
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('KK') > -1) {
            myCards.push('A','A','A','K','K');
            rank = 279;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('A','A','A','Q','Q');
            rank = 278;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('A','A','A','J','J');
            rank = 277;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('A','A','A','T','T');
            rank = 276;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('A','A','A','9','9');
            rank = 275;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('A','A','A','8','8');
            rank = 274;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('A','A','A','7','7');
            rank = 273;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('A','A','A','6','6');
            rank = 272;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('A','A','A','5','5');
            rank = 271;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('A','A','A','4','4');
            rank = 270;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('A','A','A','3','3');
            rank = 269;
        }
        if (ranks.indexOf('AAA') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('A','A','A','2','2');
            rank = 268;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('K','K','K','A','A');
            rank = 267;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('K','K','K','Q','Q');
            rank = 266;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('K','K','K','J','J');
            rank = 265;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('K','K','K','T','T');
            rank = 264;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('K','K','K','9','9');
            rank = 263;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('K','K','K','8','8');
            rank = 262;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('K','K','K','7','7');
            rank = 261;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('K','K','K','6','6');
            rank = 260;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rank = 259;
            myCards.push('K','K','K','5','5');
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('K','K','K','4','4');
            rank = 258;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('K','K','K','3','3');
            rank = 257;
        }
        if (ranks.indexOf('KKK') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('K','K','K','2','2');
            rank = 256;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','A','A');
            rank = 255;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','K','K');
            rank = 254;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','J','J');
            rank = 253;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','J','J');
            rank = 252;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','9','9');
            rank = 251;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','8','8');
            rank = 250;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','7','7');
            rank = 249;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','6','6');
            rank = 248;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','5','5');
            rank = 247;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','4','4');
            rank = 246;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','3','3');
            rank = 245;
        }
        if (ranks.indexOf('QQQ') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('Q','Q','Q','2','2');
            rank = 244;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('J','J','J','A','A');
            rank = 243;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('J','J','J','K','K');
            rank = 242;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('J','J','J','Q','Q');
            rank = 241;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('J','J','J','T','T');
            rank = 240;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('J','J','J','9','9');
            rank = 239;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('J','J','J','8','8');
            rank = 238;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('J','J','J','7','7');
            rank = 237;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('J','J','J','6','6');
            rank = 236;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('J','J','J','5','5');
            rank = 235;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('J','J','J','4','4');
            rank = 234;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('J','J','J','3','3');
            rank = 233;
        }
        if (ranks.indexOf('JJJ') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('J','J','J','2','2');
            rank = 232;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('T','T','T','A','A');
            rank = 231;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('T','T','T','K','K');
            rank = 230;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('T','T','T','Q','Q');
            rank = 229;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('T','T','T','J','J');
            rank = 228;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('T','T','T','9','9');
            rank = 227;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('T','T','T','8','8');
            rank = 226;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('T','T','T','7','7');
            rank = 225;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('T','T','T','6','6');
            rank = 224;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('T','T','T','5','5');
            rank = 223;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('T','T','T','4','4');
            rank = 222;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('T','T','T','3','3');
            rank = 221;
        }
        if (ranks.indexOf('TTT') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('T','T','T','2','2');
            rank = 220;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('9','9','9','A','A');
            rank = 219;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('9','9','9','K','K');
            rank = 218;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('9','9','9','Q','Q');
            rank = 217;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('9','9','9','J','J');
            rank = 216;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('9','9','9','T','T');
            rank = 215;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('9','9','9','8','8');
            rank = 214;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('9','9','9','7','7');
            rank = 213;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('9','9','9','6','6');
            rank = 212;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('9','9','9','5','5');
            rank = 211;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('9','9','9','4','4');
            rank = 210;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('9','9','9','3','3');
            rank = 209;
        }
        if (ranks.indexOf('999') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('9','9','9','2','2');
            rank = 208;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('8','8','8','A','A');
            rank = 207;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('8','8','8','K','K');
            rank = 206;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('8','8','8','Q','Q');
            rank = 205;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('8','8','8','J','J');
            rank = 204;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('8','8','8','T','T');
            rank = 203;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('8','8','8','9','9');
            rank = 202;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('8','8','8','7','7');
            rank = 201;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('8','8','8','6','6');
            rank = 200;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('8','8','8','5','5');
            rank = 199;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('8','8','8','4','4');
            rank = 198;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('8','8','8','3','3');
            rank = 197;
        }
        if (ranks.indexOf('888') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('8','8','8','2','2');
            rank = 196;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('7','7','7','A','A');
            rank = 195;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('7','7','7','K','K');
            rank = 194;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('7','7','7','Q','Q');
            rank = 193;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('7','7','7','J','J');
            rank = 192;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('7','7','7','T','T');
            rank = 191;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('7','7','7','9','9');
            rank = 190;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('7','7','7','8','8');
            rank = 189;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('7','7','7','6','6');
            rank = 188;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('7','7','7','5','5');
            rank = 187;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('7','7','7','4','4');
            rank = 186;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('7','7','7','3','3');
            rank = 185;
        }
        if (ranks.indexOf('777') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('7','7','7','2','2');
            rank = 184;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('6','6','6','A','A');
            rank = 183;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('6','6','6','K','K');
            rank = 182;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('6','6','6','Q','Q');
            rank = 181;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('6','6','6','J','J');
            rank = 180;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('6','6','6','T','T');
            rank = 179;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('6','6','6','9','9');
            rank = 178;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('6','6','6','8','8');
            rank = 177;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('6','6','6','7','7');
            rank = 176;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('6','6','6','5','5');
            rank = 175;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('6','6','6','4','4');
            rank = 174;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('6','6','6','3','3');
            rank = 173;
        }
        if (ranks.indexOf('666') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('6','6','6','2','2');
            rank = 172;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('5','5','5','A','A');
            rank = 171;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('5','5','5','K','K');
            rank = 170;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('5','5','5','Q','Q');
            rank = 169;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('5','5','5','J','J');
            rank = 168;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('5','5','5','T','T');
            rank = 167;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('5','5','5','9','9');
            rank = 166;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('5','5','5','8','8');
            rank = 165;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('5','5','5','7','7');
            rank = 164;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('5','5','5','6','6');
            rank = 163;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('5','5','5','4','4');
            rank = 162;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('5','5','5','3','3');
            rank = 161;
        }
        if (ranks.indexOf('555') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('5','5','5','2','2');
            rank = 160;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('4','4','4','A','A');
            rank = 159;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('4','4','4','K','K');
            rank = 158;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('4','4','4','Q','Q');
            rank = 157;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('4','4','4','J','J');
            rank = 156;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('4','4','4','T','T');
            rank = 155;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('4','4','4','9','9');
            rank = 154;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('4','4','4','8','8');
            rank = 153;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('4','4','4','7','7');
            rank = 152;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('4','4','4','6','6');
            rank = 151;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('4','4','4','5','5');
            rank = 150;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('4','4','4','3','3');
            rank = 149;
        }
        if (ranks.indexOf('444') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('4','4','4','2','2');
            rank = 148;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('3','3','3','A','A');
            rank = 147;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('3','3','3','K','K');
            rank = 146;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('3','3','3','Q','Q');
            rank = 145;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('3','3','3','J','J');
            rank = 144;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('3','3','3','T','T');
            rank = 143;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('3','3','3','9','9');
            rank = 142;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('3','3','3','8','8');
            rank = 141;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('3','3','3','7','7');
            rank = 140;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('3','3','3','6','6');
            rank = 139;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('3','3','3','5','5');
            rank = 138;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('3','3','3','4','4');
            rank = 137;
        }
        if (ranks.indexOf('333') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            myCards.push('3','3','3','2','2');
            rank = 136;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('AA') > -1 && rank === 0) {
            myCards.push('2','2','2','A','A');
            rank = 135;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('KK') > -1 && rank === 0) {
            myCards.push('2','2','2','K','K');
            rank = 134;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            myCards.push('2','2','2','Q','Q');
            rank = 133;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            myCards.push('2','2','2','J','J');
            rank = 132;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            myCards.push('2','2','2','T','T');
            rank = 131;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            myCards.push('2','2','2','9','9');
            rank = 130;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            myCards.push('2','2','2','8','8');
            rank = 129;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            myCards.push('2','2','2','7','7');
            rank = 128;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            myCards.push('2','2','2','6','6');
            rank = 127;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            myCards.push('2','2','2','5','5');
            rank = 126;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            myCards.push('2','2','2','4','4');
            rank = 125;
        }
        if (ranks.indexOf('222') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            myCards.push('2','2','2','3','3');

            rank = 124;
        }
        if (rank !== 0) {
            message = 'Full House';
        }
    }
    //Flush
    if (rank === 0) {
        if (suits.indexOf('CCCCC') > -1 || suits.indexOf('DDDDD') > -1 || suits.indexOf('HHHHH') > -1 || suits.indexOf('SSSSS') > -1) {rank = 123; message = 'Flush';}

        //Straight flush
        if (cards.indexOf('TC') > -1 && cards.indexOf('JC') > -1 && cards.indexOf('QC') > -1 && cards.indexOf('KC') > -1 && cards.indexOf('AC') > -1 && rank === 123) {
            myCards.push('T','J','Q','K','A');
            rank = 302; message = 'Royal Flush';}
        if (cards.indexOf('TD') > -1 && cards.indexOf('JD') > -1 && cards.indexOf('QD') > -1 && cards.indexOf('KD') > -1 && cards.indexOf('AD') > -1 && rank === 123) {
            myCards.push('T','J','Q','K','A');
            rank = 302; message = 'Royal Flush';}
        if (cards.indexOf('TH') > -1 && cards.indexOf('JH') > -1 && cards.indexOf('QH') > -1 && cards.indexOf('KH') > -1 && cards.indexOf('AH') > -1 && rank === 123) {
            myCards.push('T','J','Q','K','A');
            rank = 302; message = 'Royal Flush';}
        if (cards.indexOf('TS') > -1 && cards.indexOf('JS') > -1 && cards.indexOf('QS') > -1 && cards.indexOf('KS') > -1 && cards.indexOf('AS') > -1 && rank === 123) {
            myCards.push('T','J','Q','K','A');
            rank = 302; message = 'Royal Flush';}
        if (cards.indexOf('9C') > -1 && cards.indexOf('TC') > -1 && cards.indexOf('JC') > -1 && cards.indexOf('QC') > -1 && cards.indexOf('KC') > -1 && rank === 123) {
            myCards.push('9','T','J','Q','K');
            rank = 301; message = 'Straight Flush';}
        if (cards.indexOf('9D') > -1 && cards.indexOf('TD') > -1 && cards.indexOf('JD') > -1 && cards.indexOf('QD') > -1 && cards.indexOf('KD') > -1 && rank === 123) {
            myCards.push('9','T','J','Q','K');
            rank = 301; message = 'Straight Flush';}
        if (cards.indexOf('9H') > -1 && cards.indexOf('TH') > -1 && cards.indexOf('JH') > -1 && cards.indexOf('QH') > -1 && cards.indexOf('KH') > -1 && rank === 123) {
            myCards.push('9','T','J','Q','K');
        rank = 301; message = 'Straight Flush';}
        if (cards.indexOf('9S') > -1 && cards.indexOf('TS') > -1 && cards.indexOf('JS') > -1 && cards.indexOf('QS') > -1 && cards.indexOf('KS') > -1 && rank === 123) {
            myCards.push('9','T','J','Q','K');
            rank = 301; message = 'Straight Flush';}
        if (cards.indexOf('8C') > -1 && cards.indexOf('9C') > -1 && cards.indexOf('TC') > -1 && cards.indexOf('JC') > -1 && cards.indexOf('QC') > -1 && rank === 123) {
            myCards.push('8','9','T','J','Q');
            rank = 300; message = 'Straight Flush';}
        if (cards.indexOf('8D') > -1 && cards.indexOf('9D') > -1 && cards.indexOf('TD') > -1 && cards.indexOf('JD') > -1 && cards.indexOf('QD') > -1 && rank === 123) {
            myCards.push('8','9','T','J','Q');
            rank = 300; message = 'Straight Flush';}
        if (cards.indexOf('8H') > -1 && cards.indexOf('9H') > -1 && cards.indexOf('TH') > -1 && cards.indexOf('JH') > -1 && cards.indexOf('QH') > -1 && rank === 123) {
            myCards.push('8','9','T','J','Q');
            rank = 300; message = 'Straight Flush';}
        if (cards.indexOf('8S') > -1 && cards.indexOf('9S') > -1 && cards.indexOf('TS') > -1 && cards.indexOf('JS') > -1 && cards.indexOf('QS') > -1 && rank === 123) {
            myCards.push('8','9','T','J','Q');
            rank = 300; message = 'Straight Flush';}
        if (cards.indexOf('7C') > -1 && cards.indexOf('8C') > -1 && cards.indexOf('9C') > -1 && cards.indexOf('TC') > -1 && cards.indexOf('JC') > -1 && rank === 123) {
            myCards.push('7','8','9','T','J');
            rank = 299; message = 'Straight Flush';}
        if (cards.indexOf('7D') > -1 && cards.indexOf('8D') > -1 && cards.indexOf('9D') > -1 && cards.indexOf('TD') > -1 && cards.indexOf('JD') > -1 && rank === 123) {
            myCards.push('7','8','9','T','J');
            rank = 299; message = 'Straight Flush';}
        if (cards.indexOf('7H') > -1 && cards.indexOf('8H') > -1 && cards.indexOf('9H') > -1 && cards.indexOf('TH') > -1 && cards.indexOf('JH') > -1 && rank === 123) {
            myCards.push('7','8','9','T','J');
            rank = 299; message = 'Straight Flush';}
        if (cards.indexOf('7S') > -1 && cards.indexOf('8S') > -1 && cards.indexOf('9S') > -1 && cards.indexOf('TS') > -1 && cards.indexOf('JS') > -1 && rank === 123) {
            myCards.push('7','8','9','T','J');
            rank = 299; message = 'Straight Flush';}
        if (cards.indexOf('6C') > -1 && cards.indexOf('7C') > -1 && cards.indexOf('8C') > -1 && cards.indexOf('9C') > -1 && cards.indexOf('TC') > -1 && rank === 123) {
            myCards.push('6','7','8','9','T');
            rank = 298; message = 'Straight Flush';}
        if (cards.indexOf('6D') > -1 && cards.indexOf('7D') > -1 && cards.indexOf('8D') > -1 && cards.indexOf('9D') > -1 && cards.indexOf('TD') > -1 && rank === 123) {
            myCards.push('6','7','8','9','T');
            rank = 298; message = 'Straight Flush';}
        if (cards.indexOf('6H') > -1 && cards.indexOf('7H') > -1 && cards.indexOf('8H') > -1 && cards.indexOf('9H') > -1 && cards.indexOf('TH') > -1 && rank === 123) {
            myCards.push('6','7','8','9','T');
            rank = 298; message = 'Straight Flush';}
        if (cards.indexOf('6S') > -1 && cards.indexOf('7S') > -1 && cards.indexOf('8S') > -1 && cards.indexOf('9S') > -1 && cards.indexOf('TS') > -1 && rank === 123) {
            myCards.push('6','7','8','9','T');
            rank = 298; message = 'Straight Flush';}
        if (cards.indexOf('5C') > -1 && cards.indexOf('6C') > -1 && cards.indexOf('7C') > -1 && cards.indexOf('8C') > -1 && cards.indexOf('9C') > -1 && rank === 123) {
            myCards.push('5','6','7','8','9');
            rank = 297; message = 'Straight Flush';}
        if (cards.indexOf('5D') > -1 && cards.indexOf('6D') > -1 && cards.indexOf('7D') > -1 && cards.indexOf('8D') > -1 && cards.indexOf('9D') > -1 && rank === 123) {
            myCards.push('5','6','7','8','9');
            rank = 297; message = 'Straight Flush';}
        if (cards.indexOf('5H') > -1 && cards.indexOf('6H') > -1 && cards.indexOf('7H') > -1 && cards.indexOf('8H') > -1 && cards.indexOf('9H') > -1 && rank === 123) {
            myCards.push('5','6','7','8','9');
            rank = 297; message = 'Straight Flush';}
        if (cards.indexOf('5S') > -1 && cards.indexOf('6S') > -1 && cards.indexOf('7S') > -1 && cards.indexOf('8S') > -1 && cards.indexOf('9S') > -1 && rank === 123) {
            myCards.push('5','6','7','8','9');
            rank = 297; message = 'Straight Flush';}
        if (cards.indexOf('4C') > -1 && cards.indexOf('5C') > -1 && cards.indexOf('6C') > -1 && cards.indexOf('7C') > -1 && cards.indexOf('8C') > -1 && rank === 123) {
            myCards.push('4','5','6','7','8');
            rank = 296; message = 'Straight Flush';}
        if (cards.indexOf('4D') > -1 && cards.indexOf('5D') > -1 && cards.indexOf('6D') > -1 && cards.indexOf('7D') > -1 && cards.indexOf('8D') > -1 && rank === 123) {
            myCards.push('4','5','6','7','8');
            rank = 296; message = 'Straight Flush';}
        if (cards.indexOf('4H') > -1 && cards.indexOf('5H') > -1 && cards.indexOf('6H') > -1 && cards.indexOf('7H') > -1 && cards.indexOf('8H') > -1 && rank === 123) {
            myCards.push('4','5','6','7','8');
            rank = 296; message = 'Straight Flush';}
        if (cards.indexOf('4S') > -1 && cards.indexOf('5S') > -1 && cards.indexOf('6S') > -1 && cards.indexOf('7S') > -1 && cards.indexOf('8S') > -1 && rank === 123) {
            myCards.push('4','5','6','7','8');
            rank = 296; message = 'Straight Flush';}
        if (cards.indexOf('3C') > -1 && cards.indexOf('4C') > -1 && cards.indexOf('5C') > -1 && cards.indexOf('6C') > -1 && cards.indexOf('7C') > -1 && rank === 123) {
            myCards.push('3','4','5','6','7');
            rank = 295; message = 'Straight Flush';}
        if (cards.indexOf('3D') > -1 && cards.indexOf('4D') > -1 && cards.indexOf('5D') > -1 && cards.indexOf('6D') > -1 && cards.indexOf('7D') > -1 && rank === 123) {
            myCards.push('3','4','5','6','7');
            rank = 295; message = 'Straight Flush';}
        if (cards.indexOf('3H') > -1 && cards.indexOf('4H') > -1 && cards.indexOf('5H') > -1 && cards.indexOf('6H') > -1 && cards.indexOf('7H') > -1 && rank === 123) {
            myCards.push('3','4','5','6','7');
            rank = 295; message = 'Straight Flush';}
        if (cards.indexOf('3S') > -1 && cards.indexOf('4S') > -1 && cards.indexOf('5S') > -1 && cards.indexOf('6S') > -1 && cards.indexOf('7S') > -1 && rank === 123) {
            myCards.push('3','4','5','6','7');
            rank = 295; message = 'Straight Flush';}
        if (cards.indexOf('2C') > -1 && cards.indexOf('3C') > -1 && cards.indexOf('4C') > -1 && cards.indexOf('5C') > -1 && cards.indexOf('6C') > -1 && rank === 123) {
            myCards.push('2','3','4','5','6');
            rank = 294; message = 'Straight Flush';}
        if (cards.indexOf('2D') > -1 && cards.indexOf('3D') > -1 && cards.indexOf('4D') > -1 && cards.indexOf('5D') > -1 && cards.indexOf('6D') > -1 && rank === 123) {
            myCards.push('2','3','4','5','6');
            rank = 294; message = 'Straight Flush';}
        if (cards.indexOf('2H') > -1 && cards.indexOf('3H') > -1 && cards.indexOf('4H') > -1 && cards.indexOf('5H') > -1 && cards.indexOf('6H') > -1 && rank === 123) {
            myCards.push('2','3','4','5','6');
            rank = 294; message = 'Straight Flush';}
        if (cards.indexOf('2S') > -1 && cards.indexOf('3S') > -1 && cards.indexOf('4S') > -1 && cards.indexOf('5S') > -1 && cards.indexOf('6S') > -1 && rank === 123) {
            myCards.push('2','3','4','5','6');
            rank = 294; message = 'Straight Flush';}
        if (cards.indexOf('AC') > -1 && cards.indexOf('2C') > -1 && cards.indexOf('3C') > -1 && cards.indexOf('4C') > -1 && cards.indexOf('5C') > -1 && rank === 123) {
            myCards.push('A','2','3','4','5');
            rank = 293; message = 'Straight Flush';}
        if (cards.indexOf('AS') > -1 && cards.indexOf('2S') > -1 && cards.indexOf('3S') > -1 && cards.indexOf('4S') > -1 && cards.indexOf('5S') > -1 && rank === 123) {
            myCards.push('A','2','3','4','5');
            rank = 293; message = 'Straight Flush';}
        if (cards.indexOf('AH') > -1 && cards.indexOf('2H') > -1 && cards.indexOf('3H') > -1 && cards.indexOf('4H') > -1 && cards.indexOf('5H') > -1 && rank === 123) {
            myCards.push('A','2','3','4','5');
            rank = 293; message = 'Straight Flush';}
        if (cards.indexOf('AD') > -1 && cards.indexOf('2D') > -1 && cards.indexOf('3D') > -1 && cards.indexOf('4D') > -1 && cards.indexOf('5D') > -1 && rank === 123) {
            myCards.push('A','2','3','4','5');
            rank = 293; message = 'Straight Flush';}
        if (rank === 123) {rank = rank + rankKickers(ranks, 5);}


    }

    //Straight
        if (rank === 0) {
            if (cards.indexOf('T') > -1 && cards.indexOf('J') > -1 && cards.indexOf('Q') > -1 && cards.indexOf('K') > -1 && cards.indexOf('A') > -1) {
                myCards.push('T','J','Q','K','A');

                rank = 122;
            }
            if (cards.indexOf('9') > -1 && cards.indexOf('T') > -1 && cards.indexOf('J') > -1 && cards.indexOf('Q') > -1 && cards.indexOf('K') > -1 && rank === 0) {
                rank = 121;
                myCards.push('9','T','J','Q','K');
            }
            if (cards.indexOf('8') > -1 && cards.indexOf('9') > -1 && cards.indexOf('T') > -1 && cards.indexOf('J') > -1 && cards.indexOf('Q') > -1 && rank === 0) {
                rank = 120;
                myCards.push('8','9','T','J','Q');
            }
            if (cards.indexOf('7') > -1 && cards.indexOf('8') > -1 && cards.indexOf('9') > -1 && cards.indexOf('T') > -1 && cards.indexOf('J') > -1 && rank === 0) {
                rank = 119;
                myCards.push('7','8','9','T','J');
            }
            if (cards.indexOf('6') > -1 && cards.indexOf('7') > -1 && cards.indexOf('8') > -1 && cards.indexOf('9') > -1 && cards.indexOf('T') > -1 && rank === 0) {
                rank = 118;
                myCards.push('6','7','8','9','T');
            }
            if (cards.indexOf('5') > -1 && cards.indexOf('6') > -1 && cards.indexOf('7') > -1 && cards.indexOf('8') > -1 && cards.indexOf('9') > -1 && rank === 0) {
                rank = 117;
                myCards.push('5','6','7','8','9');

            }
            if (cards.indexOf('4') > -1 && cards.indexOf('5') > -1 && cards.indexOf('6') > -1 && cards.indexOf('7') > -1 && cards.indexOf('8') > -1 && rank === 0) {
                rank = 116;
                myCards.push('4','5','6','7','8');

            }
            if (cards.indexOf('3') > -1 && cards.indexOf('4') > -1 && cards.indexOf('5') > -1 && cards.indexOf('6') > -1 && cards.indexOf('7') > -1 && rank === 0) {
                rank = 115;
                myCards.push('3','4','5','6','7');

            }
            if (cards.indexOf('2') > -1 && cards.indexOf('3') > -1 && cards.indexOf('4') > -1 && cards.indexOf('5') > -1 && cards.indexOf('6') > -1 && rank === 0) {
                rank = 114;
                myCards.push('2','3','4','5','6');

            }
            if (cards.indexOf('A') > -1 && cards.indexOf('2') > -1 && cards.indexOf('3') > -1 && cards.indexOf('4') > -1 && cards.indexOf('5') > -1 && rank === 0) {
                rank = 113;
                myCards.push('A','2','3','4','5');

            }
            if (rank !== 0) {
                message = 'Straight';
            }
        }

    //Three of a kind
    if (rank === 0) {
        if (ranks.indexOf('AAA') > -1) {
            rankKicker = rankKickers(ranks.replace('AAA', ''), 2);
            myCards.push('A','A','A');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 112 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KKK') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KKK', ''), 2);
            myCards.push('K','K','K');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 111 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQQ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQQ', ''), 2);
            myCards.push('Q','Q','Q');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 110 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJJ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJJ', ''), 2);
            myCards.push('J','J','J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 109 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TTT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TTT', ''), 2);
            myCards.push('T','T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 108 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('999') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('999', ''), 2);
            myCards.push('9','9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 107 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('888') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('888', ''), 2);
            myCards.push('8','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 106 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('777') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('777', ''), 2);
            myCards.push('7','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 105 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('666') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('666', ''), 2);
            myCards.push('6','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 104 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('555') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('555', ''), 2);
            myCards.push('5','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 103 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('444') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('444', ''), 2);
            myCards.push('4','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 102 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('333') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('333', ''), 2);
            myCards.push('3','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 101 +  parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('222') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('222', ''), 2);
            myCards.push('2','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 100 +  parseFloat(rankKicker.kickerRank);
        }
        if (rank !== 0) {message = 'Three of a Kind'; }
    }

    //Two pair
    if (rank === 0) {
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('KK') > -1) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('KK', ''), 1);
            myCards.push('A','A','K','K');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 99 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('QQ', ''), 1);
            myCards.push('A','A','Q','Q');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 98 + parseFloat(rankKicker.kickerRank)
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('JJ', ''), 1);
            myCards.push('A','A','J','J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 97 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('TT', ''), 1);
            myCards.push('A','A','T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 96 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('99', ''), 1);
            myCards.push('A','A','9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 95 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('88', ''), 1);
            myCards.push('A','A','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 94 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('77', ''), 1);
            myCards.push('A','A','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 93 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('66', ''), 1);
            myCards.push('A','A','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 92 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('55', ''), 1);
            myCards.push('A','A','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 91 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('44', ''), 1);
            myCards.push('A','A','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 90 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('33', ''), 1);
            myCards.push('A','A','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 89 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('AA') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('AA', '').replace('22', ''), 1);
            myCards.push('A','A','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 88 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('QQ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('QQ', ''), 1);
            myCards.push('K','K','Q','Q');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 87 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('JJ', ''), 1);
            myCards.push('K','K','J','J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 86 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('TT', ''), 1);
            myCards.push('K','K','T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 85 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('99', ''), 1);
            myCards.push('K','K','9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 84 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('88', ''), 1);
            myCards.push('K','K','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 83 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('77', ''), 1);
            myCards.push('K','K','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 82 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('66', ''), 1);
            myCards.push('K','K','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 81 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('55', ''), 1);
            myCards.push('K','K','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 80 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('44', ''), 1);
            myCards.push('K','K','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 79 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('33', ''), 1);
            myCards.push('K','K','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 78 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', '').replace('22', ''), 1);
            myCards.push('K','K','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 77 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('JJ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('JJ', ''), 1);
            myCards.push('Q','Q','J','J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 76 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('TT', ''), 1);
            myCards.push('Q','Q','T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 75 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('99', ''), 1);
            myCards.push('Q','Q','9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 74 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('88', ''), 1);
            myCards.push('Q','Q','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 73 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('77', ''), 1);
            myCards.push('Q','Q','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 72 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('66', ''), 1);
            myCards.push('Q','Q','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 71 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('55', ''), 1);
            myCards.push('Q','Q','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 70 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('44', ''), 1);
            myCards.push('Q','Q','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 69 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('33', ''), 1);
            myCards.push('Q','Q','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 68 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', '').replace('22', ''), 1);
            myCards.push('Q','Q','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 67 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('TT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('TT', ''), 1);
            myCards.push('J','J','T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 66 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('99', ''), 1);
            myCards.push('J','J','9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 65 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('88', ''), 1);
            myCards.push('J','J','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 64 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('77', ''), 1);
            myCards.push('J','J','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 63 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('66', ''), 1);
            myCards.push('J','J','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 62 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('55', ''), 1);
            myCards.push('J','J','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 61 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('44', ''), 1);
            myCards.push('J','J','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 60 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('33', ''), 1);
            myCards.push('J','J','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 59 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', '').replace('22', ''), 1);
            myCards.push('J','J','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 58+ parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('99') > -1 && rank === 0) {
                rankKicker = rankKickers(ranks.replace('TT', '').replace('99', ''), 1);
                myCards.push('T','T','9','9');
                myCards = myCards.concat(rankKicker.myCards);
                rank = 57+ parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('88', ''), 1);
            myCards.push('T','T','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 56 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('77', ''), 1);
            myCards.push('T','T','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 55 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('66', ''), 1);
            myCards.push('T','T','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 54 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('55', ''), 1);
            myCards.push('T','T','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 53 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('44', ''), 1);
            myCards.push('T','T','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 52 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('33', ''), 1);
            myCards.push('T','T','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 51 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', '').replace('22', ''), 1);
            myCards.push('T','T','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 50 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('88', ''), 1);
            myCards.push('9','9','8','8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 49 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('77', ''), 1);
            myCards.push('9','9','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 48 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('66', ''), 1);
            myCards.push('9','9','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 47 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('55', ''), 1);
            myCards.push('9','9','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 46 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('44', ''), 1);
            myCards.push('9','9','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 45 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('33', ''), 1);
            myCards.push('9','9','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 44 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', '').replace('22', ''), 1);
            myCards.push('9','9','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 43 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', '').replace('77', ''), 1);
            myCards.push('8','8','7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 42 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', '').replace('66', ''), 1);
            myCards.push('8','8','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 41 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', '').replace('55', ''), 1);
            myCards.push('8','8','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 40 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', '').replace('44', ''), 1);
            myCards.push('8','8','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 39 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', '').replace('33', ''), 1);
            myCards.push('8','8','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 38 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', '').replace('22', ''), 1);
            myCards.push('8','8','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 37 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('77') > -1 && ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('77', '').replace('66', ''), 1);
            myCards.push('7','7','6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 36 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('77') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('77', '').replace('55', ''), 1);
            myCards.push('7','7','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 35 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('77') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('77', '').replace('44', ''), 1);
            myCards.push('7','7','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 34 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('77') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('77', '').replace('33', ''), 1);
            myCards.push('7','7','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 33 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('77') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('77', '').replace('22', ''), 1);
            myCards.push('7','7','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 32 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('66') > -1 && ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('66', '').replace('55', ''), 1);
            myCards.push('6','6','5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 31 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('66') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('66', '').replace('44', ''), 1);
            myCards.push('6','6','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 30 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('66') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('66', '').replace('33', ''), 1);
            myCards.push('6','6','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 29 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('66') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('66', '').replace('22', ''), 1);
            myCards.push('6','6','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 28 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('55') > -1 && ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('55', '').replace('44', ''), 1);
            myCards.push('5','5','4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 27 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('55') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('55', '').replace('33', ''), 1);
            myCards.push('5','5','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 26 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('55') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('55', '').replace('22', ''), 1);
            myCards.push('5','5','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 25+ parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('44') > -1 && ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('44', '').replace('33', ''), 1);
            myCards.push('4','4','3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 24 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('44') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('44', '').replace('22', ''), 1);
            myCards.push('4','4','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 23 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('33') > -1 && ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('33', '').replace('22', ''), 1);
            myCards.push('3','3','2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 22 + parseFloat(rankKicker.kickerRank);
        }
        if (rank !== 0) {message = 'Two Pair'; }


    }

    //One Pair
    if (rank === 0) {
        if (ranks.indexOf('AA') > -1) {
            rankKicker = rankKickers(ranks.replace('AA', ''), 3);
            myCards.push('A','A');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 21 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('KK') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('KK', ''), 3);
            myCards.push('K','K');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 20 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('QQ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('QQ', ''), 3);
            myCards.push('Q','Q');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 19 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('JJ') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('JJ', ''), 3);
            myCards.push('J','J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 18 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('TT') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('TT', ''), 3);
            myCards.push('T','T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 17 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('99') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('99', ''), 3);
            myCards.push('9','9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 16 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('88') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('88', ''), 3);
            myCards.push('8','8')
            myCards = myCards.concat(rankKicker.myCards);
            rank = 15 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('77') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('77', ''), 3);
            myCards.push('7','7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 14 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('66') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('66', ''), 3);
            myCards.push('6','6');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 13 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('55') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('55', ''), 3);
            myCards.push('5','5');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 12 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('44') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('44', ''), 3);
            myCards.push('4','4');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 11 + parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('33') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('33', ''), 3);
            myCards.push('3','3');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 10+ parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('22') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('22', ''), 3);
            myCards.push('2','2');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 9 + parseFloat(rankKicker.kickerRank);
        }
        if (rank !== 0) {message = 'Pair'; }
    }

    //High Card
    if (rank === 0) {
        if (ranks.indexOf('A') > -1) {
            rankKicker = rankKickers(ranks.replace('A', ''), 4);;
            myCards.push('A');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 8 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('K') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('K', ''), 4);;
            myCards.push('K');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 7 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('Q') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('Q', ''), 4);;
            myCards.push('Q');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 6 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('J') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('J', ''), 4);;
            myCards.push('J');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 5 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('T') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('T', ''), 4);;
            myCards.push('T');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 4 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('9') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('9', ''), 4);;
            myCards.push('9');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 3 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('8') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('8', ''), 4);;
            myCards.push('8');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 2 +parseFloat(rankKicker.kickerRank);
        }
        if (ranks.indexOf('7') > -1 && rank === 0) {
            rankKicker = rankKickers(ranks.replace('7', ''), 4);;
            myCards.push('7');
            myCards = myCards.concat(rankKicker.myCards);
            rank = 1 +parseFloat(rankKicker.kickerRank);
        }
        if (rank !== 0) {message = 'High Card'; }
    }

    for (var i=0;i<=myCards.length;i++)
    {
        for (var j=0;j<ranksUnSorted.length;j++)
        {
            if(myCards[i]==ranksUnSorted[j])
            {

                if(newarray.indexOf(suitsUnSortedArr[j].toLowerCase()+''+myCards[i])==-1)
                {

                    newarray.push(suitsUnSortedArr[j].toLowerCase()+ ''+myCards[i] );
                    j=ranksUnSorted.length;
                }
            }
        }
    }
    console.log(newarray);
    console.log(myCards)
    result = new Result(rank, message,newarray);

    return result;
}

function rankHand(hand) {
    var myResult = rankHandInt(hand);
    hand.rank = myResult.rank;
    hand.message = myResult.message;
    hand.glowArray = myResult.glowArray;

    return hand;
}
function rankHandDeal(hand) {
    var myResult = rankHandDealRound(hand);
    hand.rank = myResult.rank;
    hand.message = myResult.message;

    return hand;
}

function getLooserArray(winnerarray)
{
    var winnerArr=[];
    var looserArr=[];
    for(var i=0;i<=winnerarray.length-1;i++){
        winnerArr.push(winnerarray.seatId);
    }
    for(var i=0;i<=currenttable.players.length-1;i++)
    {

        if(currenttable.players[i].folded!=true){
            if($.inArray( currenttable.players[i].seatId, winnerArr )<0){
                looserArr.push(currenttable.players[i].seatId);
            }
        }
    }
    return looserArr;
}
function progress(table) {
    // table.eventEmitter.emit( "turn" );
    window.roundended=false;
    allPlayerchipsnotzero=false;
    pokerTableDom.updateTotalpot();
 var i, j, cards, hand;
    if (table.game) {
       if(isAllFolded(table)){
            var winner=0;
            var winners=[];
           table.gameWinners=[];
           table.game.roundName = 'Showdown';
         for (i = 0; i < table.game.bets.length; i += 1)
            {

                table.game.pot += parseInt(table.game.bets[i], 10);
            }
            for (i = 0; i < table.players.length; i += 1)
            {
                if (table.players[i].folded ==false)
                {
                    winner=i;
                    winners.push(winner);
                }

            }
            var winnerPrize =  table.game.pot;
            var winningPlayer = table.players[winner];

           var seatId = table.players[winners].seatId;



                winningPlayer.chips += winnerPrize;

                    winningPlayer.folded = true;
                    table.gameWinners.push({
                        playerName: winningPlayer.playerName,
                        amount: winnerPrize,
                        seatId:seatId,
                        hand: {'message':''},
                        chips: winningPlayer.chips
                    });
            var looserArr=getLooserArray(table.gameWinners);
           pokerTableDom.showLooser(looserArr);
            pokerTableDom.winnerPlayerView({'winnerArray':[table.gameWinners[0]],'looserArr':[]});

           // console.log('player ' + table.players[winner].playerName + ' wins !!');

           setTimeout(function(){
               table.initNewRound();
           },3000);



            roundEnd = true;

            return;
        }
        if (checkForEndOfRound(table) === true) {
            window.roundended=true;
//                table.currentPlayer = (table.currentPlayer >= table.players.length-1) ? (table.currentPlayer-table.players.length+1) : (table.currentPlayer + 1 );


            //Move all bets to the pot
            for (i = 0; i < table.game.bets.length; i += 1) {
                table.game.pot += parseInt(table.game.bets[i], 10);
                table.game.roundBets[i] += parseInt(table.game.bets[i], 10);
            }
            if (table.game.roundName === 'River') {
                table.game.roundName = 'Showdown';
                $('.dealer_chat_body').append('<span>Round Started ShowDown</span><br/>');

                pokerTableDom.resetAutoActoinBtn('remove');
                table.game.bets.splice(0, table.game.bets.length);
                //Evaluate each hand
                for (j = 0; j < table.players.length; j += 1)
                {
                    cards = table.players[j].cards.concat(table.game.board);
                    hand = new Hand(cards);
                    table.players[j].hand = rankHand(hand);
                    table.players[j].winnercards = hand;
                }
                checkForWinner(table);
                checkForBankrupt(table);

            } else if (table.game.roundName === 'Turn') {
                $('.playeraction').append('<span style="font-size: 24px;font-weight: bold">effective turn</span><br>')

                table.game.roundName = 'River';
                $('.dealer_chat_body').append('<span>Round Started River</span><br/>');

                table.game.deck.pop(); //Burn a card
                pokerTableDom.resetAutoActoinBtn('remove');

                table.game.board.push(table.game.deck.pop()); //Turn a card
                //table.game.bets.splice(0,table.game.bets.length-1);

                pokerTableDom.setCommunityCard(table.game.board);
                var commmunityCards ='';
                for (i = 0; i < table.game.board.length; i += 1) { //Turn three cards
                    commmunityCards = commmunityCards+' '+table.game.board[i];

                }
                $('.dealer_chat_body').append('<span>CommmunityCards'+commmunityCards+'</span><br/>');

                for (i = 0; i < table.game.bets.length; i += 1) {
                    table.game.bets[i] = 0;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    table.players[i].talked = false;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    if(table.players[i].folded==false && table.players[i].chips != 0){
                        allPlayerchipsnotzero=true;
                    }

                }
                if(allPlayerchipsnotzero==false)
                {
                    progress(currenttable)
                }
                else
                {
                    window.showRequiredAction(window.currentspan);
                }
                pokerTableDom.setTableMoney([currenttable.game.pot],pokerTableDom.data.roomName)

                //table.eventEmitter.emit( "deal" );
            } else if (table.game.roundName === 'Flop') {
                table.game.roundName = 'Turn';
                $('.dealer_chat_body').append('<span>Round Started Turn</span><br/>');

                table.game.deck.pop(); //Burn a card
                table.game.board.push(table.game.deck.pop()); //Turn a card
                pokerTableDom.resetAutoActoinBtn('remove');

                pokerTableDom.setCommunityCard(table.game.board);
                for (i = 0; i < table.game.bets.length; i += 1) {
                    table.game.bets[i] = 0;
                }
                var commmunityCards ='';
                for (i = 0; i < table.game.board.length; i += 1) { //Turn three cards
                    commmunityCards = commmunityCards+' '+table.game.board[i];

                }
                $('.dealer_chat_body').append('<span>CommmunityCards'+commmunityCards+'</span><br/>');

                for (i = 0; i < table.players.length; i += 1) {
                    table.players[i].talked = false;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    if(table.players[i].folded==false && table.players[i].chips != 0){
                        allPlayerchipsnotzero=true;
                    }
                }
                if(allPlayerchipsnotzero==false)
                {
                    progress(currenttable)
                }
                else
                {
                    window.showRequiredAction(window.currentspan);
                }
                pokerTableDom.setTableMoney([currenttable.game.pot],pokerTableDom.data.roomName)

                //table.eventEmitter.emit( "deal" );
            } else if (table.game.roundName === 'Deal') {

                //        console.log('effective deal');
                table.game.roundName = 'Flop';
                $('.dealer_chat_body').append('<span>Round Started Flop</span><br/>');

                pokerTableDom.resetAutoActoinBtn('remove');

                table.game.deck.pop(); //Burn a card
                for (i = 0; i < 3; i += 1) { //Turn three cards
                    table.game.board.push(table.game.deck.pop());
                }
                var commmunityCards ='';
                for (i = 0; i < table.game.board.length; i += 1) { //Turn three cards
                    commmunityCards = commmunityCards+' '+table.game.board[i];

                }
                $('.dealer_chat_body').append('<span>CommmunityCards'+commmunityCards+'</span><br/>');

                pokerTableDom.setCommunityCard(table.game.board);

                //table.game.bets.splice(0,table.game.bets.length-1);
                for (i = 0; i < table.game.bets.length; i += 1) {
                    table.game.bets[i] = 0;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    table.players[i].talked = false;
                }
                for (i = 0; i < table.players.length; i += 1) {
                    if(table.players[i].folded==false && table.players[i].chips != 0){
                        allPlayerchipsnotzero=true;
                    }
                }
                if(allPlayerchipsnotzero==false)
                {
                    progress(currenttable)
                }
                else
                {
                    window.showRequiredAction(window.currentspan);
                }

                pokerTableDom.setTableMoney([currenttable.game.pot],pokerTableDom.data.roomName)

                //table.eventEmitter.emit( "deal" );
            }

        }
        else{

            window.showRequiredAction(window.currentspan);


        }

    }
}
function isAllFolded(table){
    var count=0;
    var foldallowed=false;
    for (i = 0; i < table.players.length; i += 1) {
        if (table.players[i].folded ==true)
        {
            count++;
        }

    }
    if(count>=table.players.length-1)
    {
        foldallowed=true;
    }
    return foldallowed;
}
function Game(smallBlind, bigBlind) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.pot = 0;
    this.roundName = 'Deal'; //Start the first round
    this.betName = 'bet'; //bet,raise,re-raise,cap
    this.bets = [];
    this.roundBets = [];
    this.deck = [];
    this.board = [];
    fillDeck(this.deck);
}

/*
 * Helper Methods Public
 */
// newRound helper
Table.prototype.getHandForPlayerName = function( playerName ){
    for( var i in this.players ){
        if( this.players[i].playerName === playerName ){
            return this.players[i].cards;
        }
    }
    return [];
};
Table.prototype.getDeal = function(){
    return this.game.board;
};
Table.prototype.getEventEmitter = function() {
    return this.eventEmitter;
};
Table.prototype.getCurrentPlayer = function(){
    return this.players[ this.currentPlayer ].playerName;
};
Table.prototype.getPreviousPlayerAction = function(){
    return this.turnBet;
};
// Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
Table.prototype.check = function( playerName ){
    var currentPlayer = this.currentPlayer;
    if( playerName === this.players[ currentPlayer ].playerName ){
        this.players[ currentPlayer ].Check();
        return true;
    }else{
        // todo: check if something went wrong ( not enough money or things )
        $('.playeraction').append('<span >wrong user has made a move</span><br>')

        //     console.log("wrong user has made a move");
        return false;
    }
};
Table.prototype.fold = function( playerName ){
    var currentPlayer = this.currentPlayer;
    if( playerName === this.players[ currentPlayer ].playerName ){
        this.players[ currentPlayer ].Fold();
        return true;
    }else{
        $('.playeraction').append('<span >wrong user has made a move</span><br>')
        //  console.log("wrong user has made a move");
        return false;
    }
};
Table.prototype.call = function( playerName ){
    var currentPlayer = this.currentPlayer;
    if( playerName === this.players[ currentPlayer ].playerName ){
        this.players[ currentPlayer ].Call();
        return true;
    }else{
        $('.playeraction').append('<span >wrong user has made a move</span><br>')
        //    console.log("wrong user has made a move");
        return false;
    }
};
Table.prototype.bet = function( playerName, amt ){
    var currentPlayer = this.currentPlayer;
    $('.playeraction').append('<span >MyPlayer name ....'+playerName+' Poker name ....'+this.players[ currentPlayer ].playerName+'</span><br>')
    //  console.log('MyPlayer name ....'+playerName)
    //  console.log('Poker name ....'+this.players[ currentPlayer ].playerName)
    if( playerName === this.players[ currentPlayer ].playerName ){
        this.players[ currentPlayer ].Bet( amt );
        return true;
    }else{
        $('.playeraction').append('<span >wrong user has made a move</span><br>')
        //   console.log("wrong user has made a move");
        return false;
    }
};
Table.prototype.getWinners = function(){
    return this.gameWinners;
};
Table.prototype.getLosers = function(){
    return this.gameLosers;
};
Table.prototype.getAllHands = function(){
    var all = this.losers.concat( this.players );
    var allHands = [];
    for( var i in all ){
        allHands.push({
            playerName: all[i].playerName,
            chips: all[i].chips,
            hand: all[i].cards
        });
    }
    return allHands;
};

Table.prototype.initNewRound = function () {

    pokerTableDom.resetAll();
    // debugger;
    //console.log('newRound Started');
    var i;
    this.dealer += 1;
    if (this.dealer >= this.players.length) {
        this.dealer = 0;
    }
    this.game.pot = 0;
    this.game.roundName = 'Deal'; //Start the first round
    this.game.betName = 'bet'; //bet,raise,re-raise,cap
    this.game.bets.splice(0, this.game.bets.length);
    this.game.deck.splice(0, this.game.deck.length);
    this.game.board.splice(0, this.game.board.length);
    for (i = 0; i < this.players.length; i += 1) {
        this.players[i].folded = false;
        this.players[i].talked = false;
        this.players[i].allIn = false;
        this.players[i].cards.splice(0, this.players[i].cards.length);

    }
    if(rechargeBot()){
        fillDeck(this.game.deck);

        this.NewRound();
        starTimer(currenttable);

    }

};
function rechargeBot(){
    var returnvalue=true;
    for (i = 0; i < currenttable.players.length; i += 1) {
        if(currenttable.players[i].type == 'bot' && currenttable.players[i].chips == 0)
        {
            currenttable.players[i].chips=parseInt(currenttable.maxBuyIn);
            var seatInfo = [];
            seatInfo['chipsLeft'] = currenttable.players[i].chips;
            //  alert(seatInfo['chipsLeft']);
            seatInfo['name'] = currenttable.players[i].playerName;
            seatInfo['playerId'] = currenttable.players[i].playerId;
            seatInfo['seatId'] = i;
            seatInfo['actionTakenInThisRound'] = 0;
            seatInfo['folded'] = false;
            seatInfo['playing'] = 2;
            seatInfo['away'] = false;
            seatInfo['allIn'] = false;
            seatInfo['bet'] = 2;
            seatInfo['chips'] = currenttable.players[i].chips;
            seatInfo['lostAllin'] = 0;
            seatInfo['lostAllinPlayerId'] = 0;
            seatInfo['occupied'] = true;
            seatInfo['reserved'] = false;
            seatInfo["mySeat"] = true; // added to check my seat id ~ nitin
            seatInfo['playerStatus'] = 'Active';
            assignSeatToUser(seatInfo, 'RING941039');
        }
        if(currenttable.players[i].type == 'user' && currenttable.players[i].chips == 0)
        {
            var txt;
            var r = confirm("You dont have any balance You want to recharge ");
            if (r == true) {
                currenttable.players[i].chips=parseInt(currenttable.maxBuyIn);
                returnvalue=true;
                var seatInfo = [];
                seatInfo['chipsLeft'] = currenttable.players[i].chips;
                //  alert(seatInfo['chipsLeft']);
                seatInfo['name'] = currenttable.players[i].playerName;
                seatInfo['playerId'] = currenttable.players[i].playerId;
                seatInfo['seatId'] = i;
                seatInfo['actionTakenInThisRound'] = 0;
                seatInfo['folded'] = false;
                seatInfo['playing'] = 2;
                seatInfo['away'] = false;
                seatInfo['allIn'] = false;
                seatInfo['bet'] = 2;
                seatInfo['chips'] = currenttable.players[i].chips;
                seatInfo['lostAllin'] = 0;
                seatInfo['lostAllinPlayerId'] = 0;
                seatInfo['occupied'] = true;
                seatInfo['reserved'] = false;
                seatInfo["mySeat"] = true; // added to check my seat id ~ nitin
                seatInfo['playerStatus'] = 'Active';
                assignSeatToUser(seatInfo, 'RING941039');
            } else
            {
                alert('NO Ext Game');
                returnvalue=false;


            }
        }

    }
    return returnvalue;
}
Table.prototype.StartGame = function ()
{
    //If there is no current game and we have enough players, start a new game.
    var  that = this;
    if (!this.game)
    {
        this.game = new Game(this.smallBlind, this.bigBlind);
        starTimer(that);


     }
};



Table.prototype.AddPlayer = function(playerName,chips,seatId,avatar,playerId,type,chipsLeft) {
    //alert("test");
    //if ( chips >= this.minBuyIn && chips <= this.maxBuyIn) {
        var player = new Player(playerName,chips,seatId,avatar,playerId,type,chipsLeft, this);
        this.playersToAdd.push( player );
   // }
    //if ( this.players.length === 0 && this.playersToAdd.length >= this.minPlayers )
    if ( this.players.length === 0 && this.playersToAdd.length >= this.maxPlayers )
    {
        $('.playeraction').append('<span >gamestarted</span><br>');

        console.log('gamestarted');

        this.StartGame();
    }
    return this.players.length;
};
Table.prototype.removePlayer = function (playerName){
    for( var i in this.players ){
        if( this.players[i].playerName === playerName )
        {
            this.playersToRemove.push( i );
            this.players[i].Fold();
        }
    }
    for( var i in this.playersToAdd ){
        if( this.playersToAdd[i].playerName === playerName )
        {
            this.playersToAdd.splice(i, 1);
        }
    }
}

Table.prototype.NewRound = function()
{

    pokerTableDom.resetAutoActoinBtn('remove');
     $('.dealer_chat_body').append('<hr><span><strong>New Game Started</strong><br>');
     // Add players in waiting list
    var removeIndex = 0;
    for( var i in this.playersToAdd ){
        if( removeIndex < this.playersToRemove.length ){
            var index = this.playersToRemove[ removeIndex ];
            this.players[ index ] = this.playersToAdd[ i ];
            removeIndex += 1;
        }else{
            this.players.push( this.playersToAdd[i] );
        }
    }
    this.playersToRemove = [];
    this.playersToAdd = [];
    this.gameWinners = [];
    this.gameLosers = [];


    var i, smallBlind, bigBlind;
    //Deal 2 cards to each player
    for (i = 0; i < this.players.length; i += 1)
    {
        this.players[i].cards.push(this.game.deck.pop());

        this.players[i].cards.push(this.game.deck.pop());
        this.game.bets[i] = 0;
        this.game.roundBets[i] = 0;
    }
    var userHoleCards = '';
    for (i = 0; i < this.players.length; i += 1) {
        for(var j=0;j<this.players[i].cards.length;j++){
            if(currenttable.players[i].type=='user'){
                userHoleCards = userHoleCards+' '+this.players[i].cards[j];
            }
        }
    }
    if(userHoleCards!='')
        $('.dealer_chat_body').append('<span>Your Hole Cards'+userHoleCards+'</span><br/>');
    //Identify Small and Big Blind player indexes
    smallBlind = this.dealer + 1;
    if (smallBlind >= this.players.length) {
        smallBlind = 0;
    }
    bigBlind = this.dealer + 2;
    if (bigBlind >= this.players.length) {
        bigBlind -= this.players.length;
    }
    //Force Blind Bets
    this.players[smallBlind].chips -= this.smallBlind;



    this.players[bigBlind].chips -= this.bigBlind;

    this.game.bets[smallBlind] = this.smallBlind;
    this.game.bets[bigBlind] = this.bigBlind;

    // get currentPlayer
    this.currentPlayer = this.dealer + 3;
    if(this.players.length <= 2){
        this.currentPlayer = this.dealer + 1;

        }
    if( this.currentPlayer >= this.players.length ) {
        this.currentPlayer -= this.players.length;
    }
    for (i = 0; i < this.players.length; i += 1)
    {
        $('.totalchips'+i).text(this.players[i].chips);
    }
    window.playernow=this.currentPlayer;
    var itercount=0;
    window.useractionsequence=[];
    for(var i=smallBlind;i<=this.players.length;i++){
        if(itercount==this.players.length)
        {
            break;
        }
        itercount=itercount+1;

        if(i==this.players.length){
            i=0;
        }

        window.useractionsequence.push(i)
    }

};

Table.prototype.startNewRound = function(){
    currenttable.updateBotActions('true','true','true','false','false');
    var data1 = {'currentPlayer':'','seatId':'','turnTime':'','roomName':'','usertype':'','gameType':'','bigBlind':'','bettingRule':'','ringVariant':''};
    var playername=currenttable.players[currenttable.currentPlayer].playerName;

    data1.currentPlayer = currenttable.currentPlayer;
    data1.seatId = Number(currenttable.currentPlayer);
    data1.turnTime = Number(currenttable.turntime);
    data1.roomName = pokerTableDom.data.roomName;
    data1.usertype = currenttable.players[currenttable.currentPlayer].type;
    data1.gameType = pokerTableDom.data.gameType;
    data1.bigBlind = currenttable.bigBlind;
    data1.bettingRule = 'NL';
    data1.ringVariant = pokerTableDom.data.ringVariant;
    console.log(data1);
//     if(currenttable.players[currenttable.currentPlayer].type=='bot')
//    {
        pokerTableDom.userTurns(data1);
   // }


    var timeout=parseInt(Math.random() * ((currenttable.turntime-2) - 5+1)+5);
    timeout*=1000;
    setTimeout(
        function(){
            if(currenttable.players[currenttable.currentPlayer].type=='bot')
            {
                var data = {'currentPlayer':'','seatId':'','turnTime':'','roomName':'','usertype':'','gameType':'','bigBlind':'','bettingRule':'','ringVariant':''};
                var playername=currenttable.players[currenttable.currentPlayer].playerName;
                var mydata = {
                    action: '',
                    amount: currenttable.raiseAmount(currenttable.players[currenttable.currentPlayer].playerName),
                    roomName:pokerTableDom.data.roomName
                };
                currenttable.callAutoBotAction(playername,currenttable.currentPlayer,'action',mydata);
                data.currentPlayer = currenttable.currentPlayer;
                data.seatId = Number(currenttable.currentPlayer);
                data.turnTime = Number(currenttable.turntime);
                data.roomName = pokerTableDom.data.roomName;
                data.usertype = currenttable.players[currenttable.currentPlayer].type;
                data.gameType = pokerTableDom.data.gameType;
                data.bigBlind = currenttable.bigBlind;
                data.bettingRule = 'NL';
                data.ringVariant = pokerTableDom.data.ringVariant;
              //  pokerTableDom.userTurns(data);
            }

        },timeout);
}

function starTimer(data_table)
{
   startTimerPopUp();
    clearInterval(starttimer);
    var i = 3;
    data_table.NewRound();


    var starttimer=setInterval(function () {
            i--;
            $('.time_countDown').text('Time Remains : ' + i);
            if (i == 0) {

                var smallBlind = currenttable.dealer + 1;
                if (smallBlind >= currenttable.players.length) {
                    smallBlind = 0;
                }
                var  bigBlind = currenttable.dealer + 2;
                if (bigBlind >= currenttable.players.length) {
                    bigBlind -= currenttable.players.length;
                }
                $('.time_Remains').remove();
                var data = {};
                data.roomName = pokerTableDom.data.roomName;
                data.seatId = smallBlind;
                data.maxUsers = currenttable.maxPlayers;
                data.smallBlind = currenttable.smallBlind;
                data.bigBlind = currenttable.bigBlind;
                data.amt = currenttable.smallBlind;
                data.usertype = currenttable.players[smallBlind].type;
                data.action = 'SMALL_BLIND';

            currenttable.callUserActionView(data);

            var data = {};
            data.roomName = pokerTableDom.data.roomName;
            data.seatId = bigBlind;
            data.maxUsers = currenttable.maxPlayers;
            data.smallBlind = currenttable.smallBlind;
            data.bigBlind = currenttable.bigBlind;
            data.amt = currenttable.bigBlind;
            data.usertype = currenttable.players[bigBlind].type;
            data.action = 'BIG_BLIND';


                currenttable.callUserActionView(data);
                data_table.startNewRound();
                setDealerDom({'dlrSeatId': currenttable.dealer, 'maxUsers': currenttable.maxPlayers,'dealerPos':dealerPosArray});
                pokerTableDom.updateTotalpot();
                pokerTableDom.cardDistribution();
                clearInterval(starttimer);
        }

    }, 1000);
}

Table.prototype.callAutoBotAction=function(playername,playerindex,action,data)
{
    // $('.playeraction').append('<span >Bot action: '+ JSON.stringify(window.botactions) +'</span><br>')
    //  console.log('calling auto bot action');
    console.log(window.botactions);
    var botaction='';
    this.getMove(window.botactions,function(action){
        var botaction= action;
        currenttable.allAction(playername,playerindex,botaction,data);
    });


}

    Table.prototype.allAction=function(playername,playerindex,action,data){
        var prevPlayer = currenttable.currentPlayer
        window.currentspan=data;
        var amt = 0;
        var actionTaken = null;
        if(action=='call'){
            actionTaken = 2;
            maxBet = getMaxBet(currenttable.game.bets);
            amt = maxBet - currenttable.game.bets[currenttable.currentPlayer];
            $('.dealer_chat_body').append('<span><strong>'+playername+' : </strong> Called <strong class="action">'+amt+'</strong></span><br>');

            currenttable.call(playername)

        }
        if(action=='fold'){
            amt = 0;
            actionTaken = 3;
            //$(that).attr('style','background:red');
            //$(that).parent().parent().attr('style','background:red');
            currenttable.fold(playername)
            $('.dealer_chat_body').append('<span><strong>'+playername+' : </strong> Folded </span><br>');

        }
        if(action=='bet'){
            actionTaken = 4;
            amt = currenttable.bigBlind;
            currenttable.bet(playername,currenttable.bigBlind);
            $('.dealer_chat_body').append('<span><strong>'+playername+' : </strong> bet <strong class="action">'+amt+'</strong></span><br>');

        }
        if(action=='check'){
            amt = 0;
            actionTaken = 2;
            maxBet = getMaxBet(currenttable.game.bets);
            currenttable.check(playername);
            $('.dealer_chat_body').append('<span><strong>'+playername+' : </strong> checked</span><br>');

        }
        if(action=='raise'){
           actionTaken = 4;
            console.log('RaiseAmount-/-/-/-/-'+ raiseAmount);
            var raiseAmount = parseInt(data.amount)-currenttable.game.bets[currenttable.currentPlayer];
            if(parseInt(data.amount) >= currenttable.players[currenttable.currentPlayer].chips)
            {
                raiseAmount =currenttable.players[currenttable.currentPlayer].chips;
            }

            amt = raiseAmount;

            currenttable.bet(playername,raiseAmount);
            $('.dealer_chat_body').append('<span><strong>'+playername+' : </strong> raised <strong class="action">'+raiseAmount+'</strong></span><br>');

        }
        if(currenttable.game.roundName!='Showdown'){


        var data = {};
        data.roomName = pokerTableDom.data.roomName;
        data.seatId = prevPlayer;
        data.maxUsers = currenttable.maxPlayers;
        data.smallBlind = currenttable.smallBlind;
        data.bigBlind = currenttable.bigBlind;
        data.amt = amt;
         pokerTableDom.lastPlayerActionAmt=amt;
        data.usertype = currenttable.players[prevPlayer].type;
        data.action = actionTaken;

        currenttable.callUserActionView(data);
        var data = {'currentPlayer':'','seatId':'','turnTime':'','roomName':'','usertype':'','gameType':'','bigBlind':'','bettingRule':'','ringVariant':''};
        data.currentPlayer = currenttable.currentPlayer;
        data.seatId = Number(currenttable.currentPlayer);
        data.turnTime = Number(currenttable.turntime);
        data.roomName = pokerTableDom.data.roomName;
        data.usertype = currenttable.players[currenttable.currentPlayer].type;
        data.gameType = pokerTableDom.data.gameType;
        data.bigBlind = currenttable.bigBlind;
        data.bettingRule = 'NL';
        data.ringVariant = pokerTableDom.data.ringVariant;


        pokerTableDom.userTurns(data);
        }
        else{
            alert('its showdown')
        }
    };

Table.prototype.callUserActionView = function(data){

    pokerTableDom.userActionView(data);
}

Table.prototype.getMove=function(botaction,getMoveCallback){
    var roundname=this.game.roundName;
    var temp=[];
    for (move in botaction) {
        if (botaction[move] == 'true') {
            temp.push(move);

        }
    }

    getIntelligentBotAction(temp,this,roundname,this.players,function(action){
        // $('.playeraction').append('<span>getMove'+action+'</span><br>')
        getMoveCallback(action);
    });
//    var max= 3,min=1;
//   return temp[parseInt(Math.random()*(max - min) + min)]


// get on from true
}


Table.prototype.updateBotActions=function(call,fold,raise,bet,check){
    window.botactions={
        'call':call,
        'fold':fold,
        'raise':raise,
        'bet':bet,
        'check':check
    }
}
Table.prototype.betButton=function(playerName){
    var currentPlayer = this.currentPlayer;
    var action='true';
    if( playerName === this.players[ currentPlayer ].playerName )
    {
        for (v = 0; v < this.game.bets.length; v += 1)
        {
            if (this.game.bets[v] !== 0)
            {
                action= 'false';
            }
        }
        return action;
    }
}
Table.prototype.raiseButton=function(playerName){
    var currentPlayer = this.currentPlayer;
    var action='false';
    if( playerName === this.players[ currentPlayer ].playerName )
    {
        for (v = 0; v < this.game.bets.length; v += 1)
        {
            if (this.game.bets[v] !== 0)
            {
                action= 'true';
            }
        }
        return action;
    }
}
Table.prototype.callButton=function(playerName){
    var currentPlayer = this.currentPlayer;
    var callAmount=0;
    var action='false';
    if( playerName === this.players[ currentPlayer ].playerName ){
        var maxBet = getMaxBet(this.game.bets);
        if(currenttable.game.bets[currenttable.currentPlayer]<maxBet ){
            action='true';
        }
    }
    return action;
}
Table.prototype.checkButton=function(playerName){

    var currentPlayer = this.currentPlayer;
    var action='false';
    var betAllowed=currenttable.betButton(playerName);
    var callAmount=currenttable.callAmount(playerName);
    //var equalbets=allBetsEqual();
    if( playerName === this.players[ currentPlayer ].playerName ){
       // if(betAllowed=='true' || callAmount==0)
        if(callAmount==0)
        {
            action='true';
        }
    }
    return action;
}

Table.prototype.raiseAmount=function(playerName)
{
    var currentPlayer = this.currentPlayer;
    var raiseAmount=0;
   if( playerName === this.players[ currentPlayer ].playerName)
    {
       var maxBet = getMaxBet(currenttable.game.bets);
        //raiseAmount=(maxBet+currenttable.bigBlind)-currenttable.game.bets[currenttable.currentPlayer];
        raiseAmount=(maxBet+currenttable.callAmount(playerName));
    }
    if(raiseAmount>=currenttable.players[currenttable.currentPlayer].chips){

        raiseAmount =currenttable.players[currenttable.currentPlayer].chips;

    }

    return raiseAmount;
}
Table.prototype.callAmount=function(playerName){
    var currentPlayer = this.currentPlayer;
    var callAmount=0;
    if( playerName === this.players[ currentPlayer ].playerName ){

        var maxBet = getMaxBet(this.game.bets);
        if(currenttable.game.bets[currenttable.currentPlayer]<maxBet)
            callAmount=parseInt(maxBet-this.game.bets[currenttable.currentPlayer]);
    }
    if(callAmount>=currenttable.players[currenttable.currentPlayer].chips){

        callAmount =currenttable.players[currenttable.currentPlayer].chips;

    }
    return callAmount;
}
Table.prototype.raise_Bet_Allowed=function(playerName,amount){
    var currentPlayer = this.currentPlayer;
    if( playerName === this.players[ currentPlayer ].playerName ){
        if (this.players[ currentPlayer ].chips > amount)
        {
            return 'true';
        }
        else
        {
            return 'false';
        }
    }
}
Table.prototype.callAllowed=function(playerName,amount){
    var currentPlayer = this.currentPlayer;
    if( playerName === this.players[ currentPlayer ].playerName ){
        if (this.players[ currentPlayer ].chips > amount) {
            return true;
        }
        else
        {
            return false;
        }
    }
}
Player.prototype.GetChips = function(cash) {
    this.chips += cash;
};

// Player actions: Check(), Fold(), Bet(bet), Call(), AllIn()
Table.prototype.allowedActions=function(){
    var checkAllow, v, i;
    checkAllow = true;
    betAllowed=false;
    var actionaarray=[];

    for (v = 0; v < this.game.bets.length; v += 1)
    {
        if (this.game.bets[v] !== 0)
        {
            checkAllow = false;
            betAllowed  = false;
        }
        else{
            betAllowed  = true;
        }
    }

    return {
        'checkAllow':checkAllow,
        'betAllowed':betAllowed
    };

};
Player.prototype.Check = function() {
    var checkAllow, v, i;
    var notfoldedarrary=[];
    checkAllow = true;
    for (v = 0; v < this.table.game.bets.length; v += 1)
    {
        if(this.table.players[v].folded==false && this.table.players[v].allIn==false)
        {
            notfoldedarrary.push(this.table.game.bets[v])
        }
    }
    for (v = 0; v < notfoldedarrary.length; v += 1) {

        if (notfoldedarrary[v] !== notfoldedarrary[0]) {
            checkAllow = false;
        }
    }
    if (checkAllow) {
        for (i = 0; i < this.table.players.length; i += 1) {
            if (this === this.table.players[i]) {
                //commented by deepanshu to end round if all amount is equal
                //this.table.game.bets[i] = 0;
                this.talked = true;
            }
        }
        //Attemp to progress the game
        this.turnBet = {action: "check", playerName: this.playerName}
        this.table.turnBet = {action: "check", playerName: this.playerName}
        progress(this.table);
    } else {
        $('.playeraction').append('<span>Check not allowed, replay please</span><br>')

        console.log("Check not allowed, replay please");
    }
};

Player.prototype.Fold = function() {
    var i, bet;
    for (i = 0; i < this.table.players.length; i += 1) {
        if (this === this.table.players[i]) {
            bet = parseInt(this.table.game.bets[i], 10);
            this.table.game.bets[i] = 0;
            this.table.game.pot += bet;
            this.talked = true;
        }
    }
    //Mark the player as folded
    this.folded = true;
    this.turnBet = {action: "fold", playerName: this.playerName}
    this.table.turnBet = {action: "fold", playerName: this.playerName}

    //Attemp to progress the game
    progress(this.table);
};

Player.prototype.Bet = function(bet) {
    var i;

    if (this.chips > bet) {
        for (i = 0; i < this.table.players.length; i += 1) {
            if (this === this.table.players[i]) {
                this.table.game.bets[i] += bet;
                this.table.players[i].chips -= bet;
                $('.chipsleft'+i).text(this.table.players[i].chips);
                this.talked = true;
            }
        }

        //Attemp to progress the game
        this.turnBet = {action: "bet", playerName: this.playerName, amount: bet}
        this.table.turnBet = {action: "bet", playerName: this.playerName, amount: bet}
        progress(this.table);
    } else {
        $('.playeraction').append('<span>You dont have enought chips --> ALL IN !!!</span><br>')

        console.log('You don\'t have enought chips --> ALL IN !!!');
        this.AllIn();
    }
};

Player.prototype.Call = function() {

    var maxBet, i;
    maxBet = getMaxBet(this.table.game.bets);
    if (this.chips > maxBet &&  maxBet!=0) {
        //Match the highest bet
        for (i = 0; i < this.table.players.length; i += 1) {
            if (this === this.table.players[i]) {
                if (this.table.game.bets[i] >= 0) {

                    this.chips += parseInt(this.table.game.bets[i]);
                }

                this.chips -= maxBet;
                this.table.game.bets[i] = maxBet;
                this.talked = true;
                $('.chipsleft'+i).text(this.table.players[i].chips);
            }
        }
        //Attemp to progress the game
        this.turnBet = {action: "call", playerName: this.playerName, amount: maxBet}
        this.table.turnBet = {action: "call", playerName: this.playerName, amount: maxBet}
        progress(this.table);
    } else {
        $('.playeraction').append('<span>You dont have enought chips --> ALL IN !!!</span><br>')

        console.log('You don\'t have enought chips --> ALL IN !!!');
        this.AllIn();
    }
};

Player.prototype.AllIn = function() {

   var i, allInValue=0;
    for (i = 0; i < this.table.players.length; i += 1) {
        if (this === this.table.players[i]) {
            if (this.table.players[i].chips !== 0) {
                allInValue = this.table.players[i].chips;
                this.table.game.bets[i] += this.table.players[i].chips;
                this.table.players[i].chips = 0;

                this.allIn = true;
                this.talked = true;
            }
        }
    }

    //Attemp to progress the game
    this.turnBet = {action: "allin", playerName: this.playerName, amount: allInValue}
    this.table.turnBet= {action: "allin", playerName: this.playerName, amount: allInValue}
    progress(this.table);
};

function rankHands(hands)
{
    var x, myResult;

    for (x = 0; x < hands.length; x += 1) {
        myResult = rankHandInt(hands[x]);
        hands[x].rank = myResult.rank;
        hands[x].message = myResult.message;
    }

    return hands;
}

//exports.Table = Table;
