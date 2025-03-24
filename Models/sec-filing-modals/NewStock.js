const mongoose = require("mongoose");
const newStockSchema = mongoose.Schema({
    stock: {
        type: Object,
    },
});

module.exports = mongoose.model("new_stocks", newStockSchema);
