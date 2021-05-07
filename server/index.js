require("dotenv").config();
const express= require("express");
const cors = require('cors');
import swaggerJsDoc from 'swagger-jsdoc'
import  swaggerUI  from 'swagger-ui-express';

//firebase admin impl
const admin = require("firebase-admin");
try{
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
        databaseURL: "https://kdaebakapp.firebaseio.com"
      });
}catch(e){
    console.log(e)
}

//
require(__dirname+"/models/connection");
const idolRouter = require(__dirname+ "/routers/idol");
const groupRouter = require(__dirname+"/routers/group");
const userRouter = require(__dirname+"/routers/user");
const voteRouter = require(__dirname+"/routers/vote");
const faveRotuer = require(__dirname+'/routers/favorite');

const upload = require(__dirname+"/middleware/upload");

const specs =  swaggerJsDoc({
  definition:{
    openapi:'3.0.0',
    info:{
      title:'holis',
      version:'1.0',
      description:'holis',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis:[ __dirname+'/routers/*.js']
})

const app = express();

//middleware
app.use(cors());
app.use(express.json())

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(specs))

//rotuers
app.use(idolRouter);
app.use(groupRouter);
app.use(userRouter);
app.use(voteRouter);
app.use(faveRotuer);

app.post("/upload",upload, async function(req,res){
  try{
    if(req.file==null){
      return res.status(400).send({error:"no file specified"});
    }
    res.send({link:req.file.data.link});

  }catch(error){
    console.log(error);
    res.status(400).send('error');
  }
});



module.exports = {
    path: '/api',
    handler: app,
}