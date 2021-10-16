const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const app = express()

mongoose.connect("mongodb://localhost:27017/cricheros").then((result)=>{
    console.log("connected")
}).catch((err)=>{
    console.log("Unable to connect database")
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const PointTableRoute = require("./routes/pointTable.routes")
app.use("/point" ,PointTableRoute)

app.listen(6000 , ()=>{
    console.log("server is listening on port 6000")
})