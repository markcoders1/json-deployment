const mongoose = require("mongoose");
const pressSchema = mongoose.Schema({
    html: {
        type: String,
    },
    author: {
        type: String,
    },
    teaser: {
        type: String,
    },
    title: {
        type: String,
        unique: true,
    },
    updated: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("press_releases", pressSchema);
