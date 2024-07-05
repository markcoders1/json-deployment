const mongoose = require("mongoose");
const pressSchema = mongoose.Schema({
    status: {
        type: String,
    },
    url: {
        type: String,
    },
}, {timestamps: true} );

module.exports = mongoose.model("logs", pressSchema);
