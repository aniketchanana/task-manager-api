const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./Task');

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
        required:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid email address");
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        validate(value){
            if(value.includes("password")){
                throw new Error("invalid password");
            }
        },
        unique:true
    },
    age:{
        type:Number,
        required:true,
        validate(value){
            if(value<0){
                throw new Error("negative age is not allowed");
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
});

userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField: 'owner'
})

userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error('User dosenot exist');
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('unable to login');
    }
    return user;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},'thisismytoken')
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.getPublicProfile = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.pre('remove',async function(next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
})

userSchema.pre('save',async function(next){
    let user = this;
    if(user.isModified('password')){//it will only return true if password is changes at any point
        user.password = await bcrypt.hash(user.password,8);
    }
    next();
})

const User = mongoose.model('user',userSchema);

module.exports = User;