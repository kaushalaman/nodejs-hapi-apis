'use strict';

const Db = require('../Config/dbConfig')
const Joi = require('joi');
const CONFIG = require('../Config');
const constants = CONFIG.CONSTANTS;
const User = require('../Models/userschema');
const async = require('async');
var get = {
	method:'GET',
	path:'/twitter/api/',
	config:{
	tags:['api'],
	description:'Get all users',
	notes:'Get all users'
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
						callback(null,200);
					}
					else{
						callback(null, user);
					}
					
				});
			},
			function(arg,callback){
				if(arg===200){
					callback(null, 'User not found');
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
			if(res != 'false'){
				reply({
							statusCode:200,
							message:'Login Successful',
							result:res,
							data:"Welcome "+request.payload.id
						});
				}
			else{
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
			email:Joi.string().required(),
			username:Joi.string().required(),
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
	
}

module.exports = [
	get,
	login,
	register,
	logout,
	deletes
];

