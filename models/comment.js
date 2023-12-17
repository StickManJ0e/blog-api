const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {type: String, required: true},
    timestamp: {type: Date, default: Date.now},
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
})

module.exports = mongoose.model("Comment", CommentSchema);