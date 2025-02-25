const mongoose = require("mongoose");
const newfillingSchema = mongoose.Schema({
  filing_id: {
    type: String,
    required: true,
    unique: true,
  },
  symbol: String,
  fillingDate: String,
  acceptedDate: String,
  cik: String,
  type: String,
  link: String,
  finalLink: String,
});

module.exports = mongoose.model("new_filings", newfillingSchema);