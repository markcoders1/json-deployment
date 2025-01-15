const mongoose = require("mongoose");
const fillingSchema = mongoose.Schema({
    filling: {
        type: Object,
    },
});

fillingSchema.statics.checkForDuplicates = async function () {
    const aggregations = [
      {
        $unwind: "$filling", // Unwind the 'filling' array
      },
      {
        $group: {
          _id: "$filling.Form_Desc", // Group by Form_Desc
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 }, // Filter for duplicates (count > 1)
        },
      },
    ];
  
    const duplicates = await this.aggregate(aggregations);
    return duplicates.length > 0;
  };

module.exports = mongoose.model("fillings", fillingSchema);
