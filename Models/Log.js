const mongoose = require("mongoose");
const pressSchema = mongoose.Schema({
    logs: {
        type: Object,
    },
});

module.exports = mongoose.model("logs", pressSchema);
