// JavaScript translation of AT bot.xml
// Reconstructed with a simplified 1-3-7 martingale strategy.

// --- Variables ---
let baseStake = 1;
let stake = baseStake;
let level = 0;           // 0:base, 1:*3, 2:*7
let totalProfit = 0;
let targetProfit = 10;
let stopLoss = 50;
let lastClose = 0;

// Placeholder API ------------------------------------------------------------
function purchase(type) { /* CALL or PUT order */ }
function tick() { return 0; }
function readOHLC(field, index) { return 0; }
function readDetails(index) { return 0; }
function notify(type, msg) { /* notification stub */ }
function tradeAgain() { /* restart trade logic */ }

// --- Initialization ---
function init() {
  stake = baseStake;
  level = 0;
  totalProfit = 0;
  lastClose = readOHLC('close', 1);
}

// --- Strategy helpers ---
function stakeValue() {
  return stake;
}

// Decide CALL or PUT based on last close vs current tick
function beforePurchase() {
  const current = tick();
  if (current >= lastClose) {
    purchase('CALL');
  } else {
    purchase('PUT');
  }
}

// Update last close for next decision
function tickAnalysis() {
  lastClose = readOHLC('close', 1);
}

function handleMartingale(result, profit) {
  if (result === 'win') {
    totalProfit += profit;
    stake = baseStake;
    level = 0;
  } else {
    totalProfit -= profit;
    if (level === 0) {
      stake = baseStake * 3;
      level = 1;
    } else if (level === 1) {
      stake = baseStake * 7;
      level = 2;
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
    notify('error', `Stop loss hit: ${totalProfit}`);
    return false;
  }
  notify('info', `Total Profit: ${totalProfit}`);
  return true;
}

// --- After purchase ---
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
