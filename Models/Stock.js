const mongoose = require("mongoose");
const stockSchema = mongoose.Schema({
    stock: {
        type: Object,
    },
});

module.exports = mongoose.model("stocks", stockSchema);
