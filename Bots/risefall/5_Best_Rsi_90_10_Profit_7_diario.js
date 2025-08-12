// JavaScript translation of 5_Best_Rsi_90_10_Profit_7%_diario.xml
// Reconstructed core trading logic from the original blockly file.

// ---- Variables ----
let maxAcceptableLoss = 800;
let targetProfit = 25;
let winAmount = 0.35;
let initialStake = 0.35;
let stake = initialStake;
let totalProfit = 0;

let tickList = [];

// Placeholder API ------------------------------------------------------------
function purchase(type) { /* CALL or PUT order */ }
function ticks() { return []; }
function notify(type, msg) { /* notification stub */ }
function tradeAgain() { /* restart trading */ }
function readDetails(index) { return 0; }

// ---- Indicator helpers ----
function rsi(values, period) {
  if (!values || values.length <= period) return 0;
  let gain = 0;
  let loss = 0;
  for (let i = values.length - period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    if (change >= 0) gain += change; else loss -= change;
  }
  if (loss === 0) return 100;
  const rs = gain / loss;
  return 100 - 100 / (1 + rs);
}

function stakeValue() { return stake; }

// ---- Life-cycle hooks ----
function init() {
  stake = initialStake;
  totalProfit = 0;
}

function tickAnalysis() {
  tickList = ticks();
}

function beforePurchase() {
  const rsiValue = rsi(tickList, 2);
  notify('error', `RSI: ${rsiValue}`);
  if (rsiValue >= 90) {
    purchase('PUT');
  } else if (rsiValue <= 10) {
    purchase('CALL');
  }
}

function checkStops() {
  if (totalProfit >= targetProfit) {
    notify('info', `Done! Total profit: ${totalProfit}`);
    return false;
  }
  if (totalProfit < 0 && Math.abs(totalProfit) >= maxAcceptableLoss) {
    notify('info', 'Max Acceptable Loss Reached');
    return false;
  }
  return true;
}

function afterPurchase(result) {
  const profit = Math.abs(readDetails(4));
  if (result === 'win') {
    notify('success', `Won: ${profit}`);
    stake = winAmount;
    totalProfit += profit;
  } else {
    notify('warn', `Lost: ${profit}`);
    stake += profit * 1.041;
    totalProfit -= profit;
  }
  notify('info', `Total Profit: ${totalProfit}`);
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
