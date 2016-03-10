'use strict';

var SerialPort = require("serialport").SerialPort
var serialPort;
var buffer = [];
var selectors = {};
var isOpen = false;
var isParseStart = false;
var isParseStartIndex;
var self;
function MegaPi(onStart)
{
  self = this; 
  serialPort = new SerialPort("/dev/ttyAMA0", {
    baudrate: 115200
  });
  serialPort.on("open", function () {
    isOpen = true;
    if(onStart){
       onStart();
     }
    serialPort.on('data', function(data) {
      var readBuffer = new Uint8Array(data);
      for(var i=0;i<readBuffer.length;i++){
        buffer.push(readBuffer[i]);
        var len = buffer.length;
        if(len >= 2)
          {
          if (buffer[len-1]==0x55 && buffer[len-2]==0xff)
            {
            isParseStart = true;
            isParseStartIndex = len-2;	
            }
            if (buffer[len-1]==0xa && buffer[len-2]==0xd && isParseStart==true)
               {
              isParseStart = false;
              var position = isParseStartIndex+2;
              var extID = buffer[position];
              position+=1;
              var type = buffer[position];
              var value = 0;
              position+=1;//# 1 byte 2 float 3 short 4 len+string 5 double
            
              switch(type)
                 { 
                case 1:
		   {
                  value = buffer[position];
                   }
                break;
		   case 2:
		   {
                  value = floatFromBytes([buffer[position],buffer[position+1],buffer[position+2],buffer[position+3]]);
                   }
                break;
		   case 3:
		   {
                  value = shortFromBytes([buffer[position],buffer[position+1]]);
                   }
                break;
                 }
              if(type<=5){
                responseValue(extID,value);
                 }
	        buffer = [];
               }
          }
        }
     });
  });
}
MegaPi.prototype.megapi = function () {
  
}
function onResult(err, results) {
    //console.log(err,results);
}
function responseValue(extId,value){
  if(selectors["callback_"+extId]){
    selectors["callback_"+extId](value);
  }
}
function write(buffer){
  if(isOpen){
    var buf = new Buffer([0xff,0x55,buffer.length+1].concat(buffer).concat([0xa]));
    serialPort.write(buf,onResult);
  } 
}
MegaPi.prototype.digitalWrite = function(pin,level){
  var id = 0;
  var action = 2;
  var device = 0x1e;
  selectors["callback_"+id] = callback;
  write([id,action,device,pin+54,level]);
}
MegaPi.prototype.pwmWrite = function(pin,pwm){
  var id = 0;
  var action = 2;
  var device = 0x20;
  selectors["callback_"+id] = callback;
  write([id,action,device,pin,pwm]);
}
MegaPi.prototype.digitalRead = function(pin,callback){
  var id = pin+54;
  var action = 1;
  var device = 0x1e;
  selectors["callback_"+id] = callback;
  write([id,action,device,pin+54]);
}
MegaPi.prototype.analogRead = function(pin,callback){
  var id = pin+54;
  var action = 1;
  var device = 0x1f;
  selectors["callback_"+id] = callback;
  write([id,action,device,pin]);
}
MegaPi.prototype.dcMotorRun = function(port,speed){
  var id = 0;
  var action = 2;
  var device = 0xa;
  var spd = getShortBytes(speed);
  write([id,action,device,port,spd[1],spd[0]]);
}
var maxLinearSpeed = 200;
MegaPi.prototype.mecanumRun = function(xSpeed,ySpeed,aSpeed){
  var spd1 = ySpeed - xSpeed + aSpeed;
  var spd2 = ySpeed + xSpeed - aSpeed;
  var spd3 = ySpeed - xSpeed - aSpeed;
  var spd4 = ySpeed + xSpeed + aSpeed;
  var max = Math.max(spd1,Math.max(spd2,Math.max(spd3,spd4)));
  if(max>maxLinearSpeed){
    var per = maxLinearSpeed/max;
    spd1 *= per;
    spd2 *= per;
    spd3 *= per;
    spd4 *= per;
  }
  self.dcMotorRun(1,spd1);
  self.dcMotorRun(2,spd2);
  self.dcMotorRun(9,spd3);
  self.dcMotorRun(10,-spd4);
}
MegaPi.prototype.dcMotorStop = function(port){
  self.dcMotorRun(port,0);
}
MegaPi.prototype.servoRun = function(pin,angle){
  var id = 0;
  var action = 2;
  var device = 0x21;
  write([id,action,device,pin+60,angle]);
}
function getShortBytes( v ){
    var bytes = [];
    var i = 2;
    do {
      bytes[--i] = v & (255);
      v = v>>8;
    }while ( i )
    return bytes;
}
function shortFromBytes( v ){
    var val = 0;
    for (var i = 0; i < v.length; ++i) {        
        val += v[i];        
        if (i < v.length-1) {
            val = val << 8;
        }
    }
    return val;
}
function floatFromBytes(v){
  var buf = new ArrayBuffer(4);
  var i = new Uint8Array(buf);
  i[0] = v[0];
  i[1] = v[1];
  i[2] = v[2];
  i[3] = v[3];
  var f = new Float32Array(buf);
  return f[0];
}
exports.MegaPi = MegaPi;