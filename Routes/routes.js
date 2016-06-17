'use strict';

const Db = require('../Config/dbConfig')
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const CONFIG = require('../Config');
const constants = CONFIG.CONSTANTS;
const User = require('../Models/userschema');
const Tweet = require('../Models/tweetschema');
const async = require('async');
const Plugins = require('../Plugins');
const jwtDecode = require('jwt-decode');

let authorizeHeaderObject = Joi.object({
	authorization: Joi.string().required()
}).unknown();

var get = {
	method:'GET',
	path:'/twitter/api/',
	config:{
	tags:['api'],
	description:'Get all users',
	notes:'Get all users',
	validate: {
		headers: authorizeHeaderObject
	},
	auth:{
		strategy: 'token'
	}
    },
	handler:function(request,reply){
		async.waterfall([
			function(callback){
				User.find({},function(err,res){
			
						if(err)
							throw err;
						if(!res)
							callback(null,"no result");
						callback(null,res);
				});
			},

			function(arg, callback){
				callback(null, arg);
			}
		
			], function(err,res){
				reply(res);
			});
		
	}
};
var login = {
	method:'POST', 
	path:'/twitter/api/login',
	config:{
		tags:['api'],
		description:'Login Check',
		notes:'Login Check',
		validate:{
		payload:{
			id:Joi.string().required(),
			password:Joi.string().required()
		}
	}
	},
	handler:function(request,reply)
	{
		async.waterfall(
		[
			function(callback){
				User.findOne({$or: [{email:request.payload.id},{username:request.payload.id}]}
									, function(err,user){
			
					if(err)
						throw err;
					if(!user)
					{
						callback(null,2);
					}
					else{
						callback(null, user);
					}
					
				});
			},
			function(arg,callback){
				if(arg===2){
					callback(null, 2);
				}
				else{
					arg.comparePassword(request.payload.password,function(err,isMatch){
					if(err)
						throw err;
					else if(isMatch)
					{
						callback(null, isMatch);
					}
					else{
						callback(null, 'false');
					}
				}
				);
				}				
			
			}
		], function(err,res){
			if(res===2){
				reply({data:"User not found"});
			}
			else if(res==true){
				let token = jwt.sign({id:request.payload.id},CONFIG.jwtSecret.key,{expiresIn:1440});
				if(token){User.update({$or: [{email:request.payload.id},{username:request.payload.id}]},{'$set':{tokens:token}}, function(err){
						if(err){
							throw err;
						}
						reply({
							statusCode:200,
							message:'Login Successful',
							result:res,
							data:"Welcome "+request.payload.id,
							token:token
						});
				
				});}
				
			
			
			else if(res == 'false')
			{
				reply({
							message:'Login Failed',
							result:res,
							data:"Sorry "
						});
				
		    }

					
	
}});
}};

var register = {
	method:'POST', 
	path:'/twitter/api/register',
	config:{
		tags:['api'],
	description:'Register check',
	notes:'Register Check',
	validate:{
		payload:{
			Name:Joi.string().required(),
			email:Joi.string().email().required(),
			username:Joi.string().alphanum().min(4).max(30).required(),
			password:Joi.string().required(),
			contact:Joi.string().required(),
			age: Joi.number().required(),
			//gender: Joi.string().required()
		}
	}},
	handler:function(request,reply)
	{
		let user = new User({
			names:request.payload.Name,
			email:request.payload.email,
			password:request.payload.password,
			username:request.payload.username,
			contact:request.payload.contact,
			age:request.payload.age

		});
	
		user.save(user,(err)=>{
			
			if(err)
			{
				reply({
					statusCode:503,
					message:'User not inserted',
					data:err
				});
			}
			else
			{
				reply({
					statusCode:201,
					message:'User is inserted'
				});
			}
		});
	}
	

};

var logout = {
	method:'GET',
	path:'/twitter/api/logout',
	config:{
		tags:['api'],
		description:'logout',
		notes:"logout"
	},
	handler:function(request,reply)
		{
		reply("all clear");
		}
}

var deletes = {
	method:'DELETE',
	path:'/twitter/api/delete',
	config:{
		tags:['api'],
	description:'Delete all users',
	notes:'Delete all users'},
	handler:function(request,reply)
	{
		User.remove({},(err)=>{
			
			if(err){
				reply({
					statuscode:503,
					message:'Problem in deleting users'
				});
			}
			else
			{
				reply({
					statusCode:204,
					message:'All users deleted'
				})
			}
		});
	}
	
};


// Post tweet
var tweet = {
	method: 'POST',
	path:'/twitter/api/post',
	config:{
		tags:['api'],
		description:'Post tweet',
		notes:'Post Tweet',
		validate:{
			headers: authorizeHeaderObject,
			payload:{
				text: Joi.string().required(),
			}
		},
		auth: 'token'
	},
	handler : function(request, reply){
		let token = jwtDecode(request.headers.authorization);
		//console.log('token',token);
		async.waterfall([function(callback){
			User.findOne({username:token.id},function(err, user){
			if(err){
				throw err;
			}
			else{
				var names = user.names;
				//console.log("1",names);
				callback(null,names);
			}
		});
		}, function(res, callback){
			//console.log("res",res);
			let tweet = new Tweet({
			tweet_text:request.payload.text,
			username: token.id,
			name: res

		});

		tweet.save(tweet, function(err){
			if(err)
			{	
				callback(null,503);
			}
			else{
				callback(null,200);
			}
		});
		}
		],function(err,res){
			if(err){
				throw err;
			}
			else if(res == 503){
				reply({
					statusCode: 503,
					message: 'Problem in inserting in tweet',
					data: err
				});
			}
			else if(res==200){
				reply({
					statusCode:200,
					message: 'Tweet Inserted'
				});
			}
		});		
	}
};

// Get All Tweets 
var getAllTweets =  {
				method:'GET',
				path: '/twitter/api/getAllTweets',
				config:{
					tags:['api'],
					description:'Get All tweets',
					notes:'Get All Tweet',
					validate:{
						headers: authorizeHeaderObject,
					},
					auth: 'token'
				},
				handler: function(req, rep){
						async.waterfall([function(callback){
							Tweet.find(function(err,res){
								if(err){
									throw err;
								}
								else{
									callback(null,res);
								}
							});
						}, function(res,callback){
							callback(null,res);
						}],function(err,res){
							if(err){
								throw err;
							}
							else{
								rep(res);
							}
						});
				}

};

// Get User Tweets
var getUserTweets =  {
				method:'GET',
				path: '/twitter/api/getUserTweets',
				config:{
					tags:['api'],
					description:'Get User tweets',
					notes:'Get User Tweet',
					validate:{
						headers: authorizeHeaderObject,

					},
					auth: 'token'
				},
				handler: function(request, reply){
					let token = jwtDecode(request.headers.authorization);
						async.waterfall([function(callback){
							Tweet.find({username:token.id},function(err,res){
								if(err){
									throw err;
								}
								else{
									callback(null,res);
								}
							});
						}, function(res,callback){
							callback(null,res);
						}],function(err,res){
							if(err){
								throw err;
							}
							else{
								var arr=[];

								for(var i=0;i<res.length;i++){
									//console.log(res[i].tweet_text)
									arr.push(res[i].tweet_text);
								}
								reply({'tweets':arr});
							}
						});
				}

};

// Follow users
var following = {
		method:'POST',
		path: '/twitter/api/following',
		config:{
					tags:['api'],
					description:'Follow Someone',
					notes:'Follow Someone',
					validate:{
						headers: authorizeHeaderObject,
						payload:{
							id: Joi.string().required()
						}

					},
					auth: 'token'
				},
		handler: function(request, reply){
			let token = jwtDecode(request.headers.authorization);
			var follower = token.id;
			var followed = request.payload.id;
			User.update({username:followed},{'$push':{followers:follower}}, function(err,res){
				if(err){
					throw err;
				}
				User.update({username:follower},{'$push':{following:followed}},function(err,res){
					if(err){
						throw err;

					}
					reply('Successfully Followed');
				});
			});
		}
};

//Unfollow user

var Unfollow = {
	method: 'POST',
	path: '/twitter/api/unfollow',
	config:{
					tags:['api'],
					description:'Unfollow User',
					notes:'Unfollow User',
					validate:{
						headers: authorizeHeaderObject,
						payload:{
							id: Joi.string().required()
						}

					},
					auth: 'token'
				},
			handler: function(request, reply){
				let token = jwtDecode(request.headers.authorization);
				var unfollower = token.id;
				var unfollowed = request.payload.id;

				User.update({username:unfollower},{'$pullAll': {following:[unfollowed]}}, function(err, res){
					if(err){
						throw err;
					}
					else{
						User.update({username:unfollowed},{'$pullAll':{followers:[unfollower]}},function(err, res){
							if(err){
								throw err;
							}
							reply('Successfully Unfollowed');
						});
					}
				});

			}

};

module.exports = [
	get,
	login,
	register,
	logout,
	deletes,
	tweet,
	getAllTweets,
	getUserTweets,
	following,
	Unfollow
];

