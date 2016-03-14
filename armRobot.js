var MegaPi = require("megapi").MegaPi;
var bot = new MegaPi(onStart);
var arm1Angle = 0;
var arm2Angle = 0;
var rotationAngle = 0;
function onReadArm1(level){
  arm1Angle = level;
  bot.analogRead(13,onReadArm2);
}
function onReadArm2(level){
  arm2Angle = level;
  bot.analogRead(15,onReadRotation);
}
function onReadRotation(level){
  rotationAngle = level;
  bot.analogRead(14,onReadArm1);
}
//11 h_rotation A15 rotationAngle
//3 arm_2 -up +down A13 arm2Angle 450 650
//4 arm_1 -up +down  A14 arm1Angle

function loop(){
  //bot.dcMotorStop(3);
  console.log(arm1Angle,arm2Angle,rotationAngle);
  moveArm1(500);
}
function onStart(){
  
  bot.analogRead(14,onReadArm1);
  bot.dcMotorRun(3,50);
  setTimeout(function(){
    bot.dcMotorStop(3);
  },1000);
  setInterval(loop,100);
}
function moveArm1(targetPosition){
  targetPosition = Math.min(500,Math.max(320,targetPosition));
  var dt = targetPosition-arm1Angle;
  if(dt>5){
    var spd = Math.min(50,dt*5);
    bot.dcMotorRun(4,-dt*5);
  }else if(dt<-5){
    var spd = Math.max(-50,dt*5);
    bot.dcMotorRun(4,-dt*5);
  }else{
    bot.dcMotorStop(4);
  }
}
function moveArm2(targetPosition){
  targetPosition = Math.min(650,Math.max(450,targetPosition));
  var dt = targetPosition-arm2Angle;
  if(dt>5){
    var spd = Math.min(50,dt*5);
    bot.dcMotorRun(3,dt*5);
  }else if(dt<-5){
    var spd = Math.max(-50,dt*5);
    bot.dcMotorRun(3,dt*5);
  }else{
    bot.dcMotorStop(3);
  }
}