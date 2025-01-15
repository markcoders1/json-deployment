const mongoose = require("mongoose");
const logsSchema = mongoose.Schema({
    doc_id: {
        type: String,
    },
    doc_type: {
        type: String,
    },
    title: {
        type: String,
    },
    campaignId: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("logs", logsSchema);
