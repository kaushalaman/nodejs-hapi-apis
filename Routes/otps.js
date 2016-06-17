'use strict';

const OTP = require('otp.js');
const HOTP = OTP.hotp;

// OTP generation
try
{
	var code = HOTP.gen({string:'12345678901234567890'});
	console.log(code);
}
catch(ex){
	console.log(ex);
}

//OTP verification

try
{
	var result = HOTP.verify('755224', {string: '12345678901234567890'});
	console.log(result.delta.int==0);
}
catch(ex){
	console.log(ex);
}

