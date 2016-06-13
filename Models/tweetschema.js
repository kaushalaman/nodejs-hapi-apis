'use strict';
let Mongoose = require('mongoose');
let Schema = Mongoose.Schema;
let bcrypt = require('bcrypt');
let moment = require('moment-timezone');
let constants = require('../Config/constants');
let User = require('./userschema');

const TweetSchema = new Schema(
{
	tweet_id : {type: String, unique:true},
	tweet_text : {type: String},
	//entities: {},
	location: {
        'type': {type: String, enum: constants.GEO_JSON_TYPES.Point, default: constants.GEO_JSON_TYPES.Point},
        coordinates: {type: [Number], default: [0, 0]}
    },
    username : {type: String,ref: User},
    name: {type: String, ref: User},
    profile_image_url : {type:String, default:null },
},
{ timestamps: { createdAt: 'created_at' } }
);

module.exports = Mongoose.model('Tweet', TweetSchema);