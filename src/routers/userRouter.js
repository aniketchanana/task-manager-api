const express = require('express');
const User = require('../models/User');
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const multer = require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail,sendGoodByeEmail} = require('../emails/account');
const upload = multer({
    // dest:'avatar',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!(file.originalname.endsWith(".jpg") || file.originalname.endsWith(".jpeg") || file.originalname.endsWith(".png"))){
            return cb(new Error('only images are allowed'));
        }
        cb(undefined,true);
    }
});

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user);
})

router.get('/users/:id',async (req,res)=>{
    const _id = req.params.id;
    try{
        const user = await User.findById(_id);
        if(!user){
            return res.status(404).send();
        }
        res.send(user);
    }catch(e){
        res.status(500).send(e);
    }
})

router.patch('/users/me',auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','age','password'];
    const isValidOption = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidOption){
        return res.status(400).send({error:"invalid option"});
    }
    try{
        // const user = await User.findById(req.params.id);
        updates.forEach((update)=>{
            req.user[update] = req.body[update];
        })
        req.user.save();
        // if(!user){
        //     return res.status(404).send();
        // }
        res.send(req.user);
    }catch(e){
        res.status(404).send(e);
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        // const user = await User.findByIdAndDelete(req.user._id);
        // if(!user){
        //     return res.status(404).send();
        // }
        await req.user.remove();
        // await Task.deleteMany({owner:req.user._id});
        sendGoodByeEmail(req.user.email,req.user.name);
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
})

router.post('/users',async (req,res)=>{
    let user = new User(req.body);
    try{
        const result = await user.save();
        sendWelcomeEmail(user.email,user.name);
        const token = await user.generateAuthToken()
        res.send({user:result,token});
    } catch(e){
        res.status(404).send();
    }
})

router.post('/users/login',async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.send({'user':user.getPublicProfile(),token});
    }catch(e){
        res.status(400).send();
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.forEach((token)=>{
            return token.token!=req.token;
        })
        
        await req.user.save();

        res.send();
    }catch(e){
        res.status(500).send();
    }
})

router.post('/users/logoutall',auth,async (req,res)=>{
    try{
        req.user.tokens = [];

        await req.user.save();

        res.send();
    }catch(e){
        res.status(500).send();
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({
        width:250,
        height:250
    }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},(error,req,res,next)=>{
    res.status(400).send({error:error.message});
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar){
            throw new Error();
        }
        res.set('Content-type','image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(404).send();
    }
})

module.exports = router;