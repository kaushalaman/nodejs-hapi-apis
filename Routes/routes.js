'use strict';

const Db = require('../Config/dbConfig')
const Joi = require('joi');
const CONFIG = require('../Config');
const constants = CONFIG.CONSTANTS;
const User = require('../Models/userschema');
const Tweet = require('../Models/tweetschema');
const async = require('async');
const Plugins = require('../Plugins');

var get = {
	method:'GET',
	path:'/twitter/api/',
	config:{
	tags:['api'],
	description:'Get all users',
	notes:'Get all users',
	auth:'token'
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
				reply({
							statusCode:200,
							message:'Login Successful',
							result:res,
							data:"Welcome "+request.payload.id
						});
				}
			
			else if(res == 'false')
			{
				reply({
							message:'Login Failed',
							result:res,
							data:"Sorry "
						});
				}
		    }

	);					
	}
};

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

/*var tweet = {
	method: 'POST',
	path:'/twitter/api/post',
	config:{
		tags:['api'],
		description:'Post tweet',
		notes:'Post Tweet',
		validate:{
			payload:{
				text: Joi.string().required(),
				id: Joi.number(),
				username : Joi.string(),
				name : Joi.string()
			}
		}
	},
	handler : function(request, reply){
		let tweet = new Tweet({
			tweet:request.payload.text,
			tweet_id:request.payload.id,
			username:request.payload.username,
			name: request.payload.name
		});
		tweet.save(tweet, function(err,res){

		})
	}
} */

module.exports = [
	get,
	login,
	register,
	logout,
	deletes
	//tweet
];

