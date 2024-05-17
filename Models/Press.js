const mongoose = require("mongoose");
const pressSchema = mongoose.Schema({
    press: {
        type: Object,
    },
});

module.exports = mongoose.model("press_releases", pressSchema);
