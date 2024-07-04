const mongoose = require("mongoose");
const fillingSchema = mongoose.Schema({
    filling: {
        type: Object,
    },
});

module.exports = mongoose.model("fillings", fillingSchema);
