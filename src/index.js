const express = require('express');
const app = express();
require('./db/mongoose');
const User = require('./models/User');
const Task = require('./models/Task');

const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');


//middleware
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const port = process.env.PORT;

app.listen(port ,()=>{
    console.log("server is up at " + port);
})

// const main = async ()=>{
//     const user = await User.findById("5d613e080fe05035fc122f4d");
//     // await user.populate('tasks').execPopulate();
//     await user.populate('tasks').execPopulate();
//     console.log(user.tasks);
// }
// main()

// const multer = require('multer');
// const upload = multer({
//     dest:'images'
// })
// app.post('/upload',upload.single('upload'),(req,res)=>{
//     res.send();
// })

