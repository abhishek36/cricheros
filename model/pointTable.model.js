const mongoose = require("mongoose")

const PointTable = new mongoose.Schema({
    team : String,
    matches : Number,
    won : Number,
    lost : Number,
    nrr : Number,
    for : String,
    against : String,
    pts : Number
})

module.exports = mongoose.model("PointTable" ,PointTable)