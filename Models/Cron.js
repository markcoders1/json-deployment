const mongoose = require("mongoose");
const fillingSchema = mongoose.Schema({
    is_ran: {
        type: Boolean,
    },
    ran_at: {
        type: Date,
    },
});

module.exports = mongoose.model("cron", fillingSchema);
