// JavaScript translation of BB slow bot.xml
// Simplified Bollinger Band strategy with configurable martingale.

// --- Variables ---
let baseStake = 10;
let stake = baseStake;
let martingaleFactor = 2;
let martingaleLevel = 2;
let level = 0;
let totalProfit = 0;
let targetProfit = 500;
let stopLoss = 500;
let ticksArr = [];

// Placeholder API ------------------------------------------------------------
function purchase(type) { /* CALL or PUT order */ }
function tick() { return 0; }
function ticks() { return []; }
function readDetails(index) { return 0; }
function notify(type, msg) { /* stub */ }
function tradeAgain() { /* restart */ }

// --- Helpers ---
function stakeValue() {
  return stake;
}

function sma(list, period) {
  if (list.length < period) return 0;
  const slice = list.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}

function stdDev(list, period) {
  if (list.length < period) return 0;
  const avg = sma(list, period);
  const slice = list.slice(-period);
  const variance = slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / slice.length;
  return Math.sqrt(variance);
}

function bollingerBands(list, period, mult = 2) {
  const mid = sma(list, period);
  const sd = stdDev(list, period);
  return {
    upper: mid + mult * sd,
    lower: mid - mult * sd,
  };
}

// --- Life-cycle ---
function init() {
  stake = baseStake;
  level = 0;
  totalProfit = 0;
  ticksArr = [];
}

function beforePurchase() {
  if (ticksArr.length < 20) return;
  const price = tick();
  const bb = bollingerBands(ticksArr, 20, 2);
  if (price > bb.upper) {
    purchase('PUT');
  } else if (price < bb.lower) {
    purchase('CALL');
  }
}

function tickAnalysis() {
  ticksArr = ticks();
}

function handleMartingale(result, profit) {
  if (result === 'win') {
    totalProfit += profit;
    stake = baseStake;
    level = 0;
  } else {
    totalProfit -= profit;
    if (level < martingaleLevel) {
      stake *= martingaleFactor;
      level++;
    } else {
      stake = baseStake;
      level = 0;
    }
  }
}

function checkStops() {
  if (totalProfit >= targetProfit) {
    notify('success', `Target hit: ${totalProfit}`);
    return false;
  }
  if (totalProfit <= -stopLoss) {
    notify('error', `Stop loss: ${totalProfit}`);
    return false;
  }
  notify('info', `Total Profit: ${totalProfit}`);
  return true;
}

function afterPurchase(result) {
  const profit = Math.abs(readDetails(4));
  handleMartingale(result, profit);
  if (checkStops()) {
    tradeAgain();
  }
}

// Exported API ---------------------------------------------------------------
module.exports = {
  init,
  beforePurchase,
  tickAnalysis,
  afterPurchase,
  stake: stakeValue,
};
