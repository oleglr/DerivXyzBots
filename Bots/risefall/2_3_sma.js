// JavaScript translation of 2-3-sma.xml
// Reconstructed core trading logic from the original blockly file.

// ---- Variables ----
let initialStake = 0.35;
let stopLoss = 300;
let targetProfit = 50;
let martingale = 1.36;
let stake = initialStake;
let totalProfit = 0;
let maxLoss = 0;

let lastTick = 0;
let tickList = [];

// Placeholder API ------------------------------------------------------------
function purchase(type) { /* CALL or PUT order */ }
function tick() { return 0; }
function ticks() { return []; }
function notify(type, msg) { /* notify stub */ }
function tradeAgain() { /* restart trade logic */ }
function readDetails(index) { return 0; }

// ---- Utility helpers ----
function sma(list, period) {
  if (!list || list.length < period) return 0;
  const slice = list.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}

// ---- Configuration ----
function config(_initialStake, _stopLoss, _targetProfit) {
  initialStake = _initialStake;
  stopLoss = _stopLoss;
  targetProfit = _targetProfit;
  stake = _initialStake;
  totalProfit = 0;
  maxLoss = 0;
}

// ---- Strategy helpers ----
function stakeValue() {
  return stake;
}

function isFromBelow() {
  return (
    lastTick > sma(tickList, 100) &&
    sma(tickList, 12) > sma(tickList, 100) &&
    sma(tickList, 4) > sma(tickList, 12)
  );
}

function isFromAbove() {
  return (
    lastTick < sma(tickList, 100) &&
    sma(tickList, 12) < sma(tickList, 100) &&
    sma(tickList, 4) < sma(tickList, 12)
  );
}

// ---- Life-cycle hooks ----
function init() {
  config(initialStake, stopLoss, targetProfit);
}

function beforePurchase() {
  if (isFromBelow()) {
    purchase('CALL');
  } else if (isFromAbove()) {
    purchase('PUT');
  }
}

function tickAnalysis() {
  lastTick = tick();
  tickList = ticks();
}

function doMartingale(result, profit) {
  totalProfit += profit;
  if (result === 'win') {
    stake = initialStake;
  } else {
    stake *= martingale;
  }
  if (totalProfit < maxLoss) {
    maxLoss = totalProfit;
  }
}

function checkStops() {
  if (totalProfit > targetProfit) {
    notify('success', `Win ${totalProfit}`);
    return false;
  }
  if (totalProfit < -stopLoss) {
    notify('info', `Loose ${totalProfit}`);
    return false;
  }
  notify('success', `Total Profit: ${totalProfit} Max Loss: ${maxLoss}`);
  return totalProfit < targetProfit && totalProfit > -stopLoss;
}

function afterPurchase(result) {
  const profit = Math.abs(readDetails(4));
  doMartingale(result, profit);
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

