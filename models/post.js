const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
})

module.exports = mongoose.model("Post", PostSchema);