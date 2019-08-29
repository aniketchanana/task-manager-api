const mongoose = require('mongoose');

const connectionURL = process.env.MONGODB;

mongoose.connect(connectionURL,{useCreateIndex:true,useNewUrlParser:true});