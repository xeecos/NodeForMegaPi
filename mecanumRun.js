var MegaPi = require("megapi").MegaPi;
var bot = new MegaPi(onStart);

var level = 1;
function loop(){
  bot.mecanumRun(0,level?50:-50,0);
  level = 1-level;
}
function onStart(){
  bot.mecanumRun(0,0,0);
  setInterval(loop,2000);
}