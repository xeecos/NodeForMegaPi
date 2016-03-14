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
                  value = getFloatFromBytes([buffer[position],buffer[position+1],buffer[position+2],buffer[position+3]]);
                   }
                break;
		   case 3:
		   {
                  value = getShortFromBytes([buffer[position],buffer[position+1]]);
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
MegaPi.prototype.ultrasonicSensorRead = function(port,callback){
  var action = 1;
  var device = 1;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.lightSensorRead = function(port,callback){
  var action = 1;
  var device = 3;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.soundSensorRead = function(port,callback){
  var action = 1;
  var device = 7;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.pirMotionSensorRead = function(port,callback){
  var action = 1;
  var device = 15;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.potentiometerRead = function(port,callback){
  var action = 1;
  var device = 4;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.lineFollowerRead = function(port,callback){
  var action = 1;
  var device = 17;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.limitSwitchRead = function(port,callback){
  var action = 1;
  var device = 21;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.temperatureRead = function(port,callback){
  var action = 1;
  var device = 2;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.touchSensorRead = function(port,callback){
  var action = 1;
  var device = 15;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.humitureSensorRead = function(port,type,callback){
  var action = 1;
  var device = 23;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port,type]);
}
MegaPi.prototype.joystickRead = function(port,axis,callback){
  var action = 1;
  var device = 5;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port,axis]);
}
MegaPi.prototype.gasSensorRead = function(port,callback){
  var action = 1;
  var device = 25;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.buttonRead = function(port,callback){
  var action = 1;
  var device = 22;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port]);
}
MegaPi.prototype.gyroRead = function(axis,callback){
  var action = 1;
  var device = 6;
  var id = ((port<<4)+device)&0xff;
  selectors["callback_"+id] = callback;
  write([id,action,device,port,axis]);
}
MegaPi.prototype.dcMotorRun = function(port,speed){
  var id = 0;
  var action = 2;
  var device = 0xa;
  var spd = getBytesFromShort(speed);
  write([id,action,device,port,spd[1],spd[0]]);
}
MegaPi.prototype.dcMotorStop = function(port){
  self.dcMotorRun(port,0);
}
MegaPi.prototype.servoRun = function(port,slot,angle){
  var id = 0;
  var action = 2;
  var device = 11;
  write([id,action,device,port,slot,angle]);
}
MegaPi.prototype.encoderMotorRun = function(slot,speed){
  var id = 0;
  var action = 2;
  var device = 62;
  var spd = getBytesFromShort(speed);
  write([id,action,device,slot,spd[1],spd[0]]);
}
MegaPi.prototype.encoderMotorPosition = function(port,callback){
  var id = 0;
  var action = 2;
  var device = 61;
  var spd = getBytesFromShort(speed);
  write([id,action,device,slot,1]);
}
MegaPi.prototype.encoderMotorSpeed = function(port,callback){
  var id = 0;
  var action = 2;
  var device = 61;
  var spd = getBytesFromShort(speed);
  write([id,action,device,slot,2]);
}
MegaPi.prototype.stepperMotorMoveTo = function(slot,speed,position,callback){
  var id = 0;
  var action = 2;
  var device = 40;
  var spd = getBytesFromShort(speed);
  var pos = getBytesFromShort(position);
  write([id,action,device,slot,spd[1],spd[0],pos[1],pos[0]]);
}
MegaPi.prototype.rgbledDisplay = function(port,slot,index,r,g,b){
  var id = 0;
  var action = 2;
  var device = 8;
  write([id,action,device,port,slot,index,r,g,b]);
}
MegaPi.prototype.sevenSegmentDisplay = function(port,value){
  var id = 0;
  var action = 2;
  var device = 9;
  var v = getFloatBytes(value);
  write([id,action,device,port,v[3],v[2],v[1],v[0]]);
}
MegaPi.prototype.ledMatrixDisplay = function(port,buffer){
  var id = 0;
  var action = 2;
  var device = 41;
  write([id,action,device,port].concat(buffer));
}
MegaPi.prototype.shutterDo = function(port,method){
  var id = 0;
  var action = 2;
  var device = 20;
  write([id,action,device,port,method]);
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
function getShortFromBytes( v ){
    var val = 0;
    for (var i = 0; i < v.length; ++i) {        
        val += v[i];        
        if (i < v.length-1) {
            val = val << 8;
        }
    }
    return val;
}
function getFloatFromBytes(v){
  var buf = new ArrayBuffer(4);
  var i = new Uint8Array(buf);
  i[0] = v[0];
  i[1] = v[1];
  i[2] = v[2];
  i[3] = v[3];
  var f = new Float32Array(buf);
  return f[0];
}
function getBytesFromShort( v ){
  var buf = new ArrayBuffer(2);
  var s = new Int16Array(buf);
  s[0] = v;
  var i = new Uint8Array(buf);
  return i;
}
function getBytesFromFloat(v){
  var buf = new ArrayBuffer(4);
  var f = new Float32Array(buf);
  f[0] = v;
  var i = new Uint8Array(buf);
  return i;
}
exports.MegaPi = MegaPi;