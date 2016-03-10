var MegaPi = require("megapi").MegaPi;
var bot = new MegaPi(onStart);

var level = 1;
function loop(){
  bot.servoRun(0,level?100:40);
  level = 1-level;
}
function onStart(){
  setInterval(loop,1000);
}