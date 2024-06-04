const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const { getFillings, getPressReleases, getStocksData } = require("./Controllers/functions.js");
const cron = require("node-cron");
const dataFetching = require("./Controllers/data-fetching-controller.js")
const { connect } = require("./config/Database");
const { cloneCampaign, sendCampaign } = require("./Controllers/constants.js");
const Cron = require("./Models/Cron.js");
connect();
app.use(express.json());
app.use(cors());

const cronFunctions = async () => {
    try {
        console.log("Cron job running...");
        await getFillings();
        await getPressReleases();
        await getStocksData();
        const cron = new Cron({
            is_ran: true,
            ran_at: new Date(),
        });
        await cron.save();  
        console.log('Data has been updated successfully to the DB');
    } catch (error) {
        console.log("Error in cronFunctions", error);
    }
};



setTimeout(() => {
    // Runs at 8:00 AM and 5:00 PM EST everyday
    // cron.schedule("0 8,17 * * *", cronFunctions);
    cron.schedule("* * * * *", cronFunctions);
}, 7000);

app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.use("/api", dataFetching);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

