const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = new express.Router();


router.post('/tasks',auth,async (req,res)=>{
    // let task = new Task(req.body);
    // console.log(req.user._id);
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try{
        const result = await task.save();
        res.send(result);
    }catch(e){
        res.status(500).send();
    }
})


router.get('/tasks',auth,async (req,res)=>{
    let match = {};
    let sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sortBy){
        let parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === "desc"?-1:1;
    }
    try{
        // const alltask  = await Task.find({owner:req.user._id});
        // res.send(alltask);
        // OR
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send(e);
    }
})

router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id;
    try{
        // const task = await Task.findById(_id);
        const task = await Task.findOne({_id,owner:req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidOption = updates.every((update)=>{
        return allowedUpdates.includes(update);
    })
    if(!isValidOption){
        return res.status(400).send({error:"is not a valid option"});
    }
    try{
        const toBeUpdated = await Task.findOne({_id:req.params.id,owner:req.user._id})
        // const toBeUpdated = await Task.findById(req.params.id);
        // console.log(toBeUpdated);
        updates.forEach((update)=>{
            toBeUpdated[update] = req.body[update];
        })
        toBeUpdated.save();
        if(!toBeUpdated){
            return res.status(404).send();
        }
        res.send(toBeUpdated);
    }catch(e){
        res.status(500).send(e);
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = router;