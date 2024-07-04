const mongoose = require("mongoose");
const pressSchema = mongoose.Schema({
    status: {
        type: String,
    },
    url: {
        type: String,
    },
});

module.exports = mongoose.model("logs", pressSchema);
