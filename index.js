const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const { getFillings, getPressReleases, getStocksData } = require("./functions");
const cron = require("node-cron");
const dataFetching = require("./Controllers/data-fetching-controller.js")
const { connect } = require("./config/Database");
connect();
app.use(express.json());
app.use(cors());

const cronFunctions = async () => {
    try {
        console.log("Cron job running");
        await getFillings();
        await getPressReleases();
        await getStocksData();
        console.log('Data has been updated successfully to the DB');
    } catch (error) {
        console.log("Error in cronFunctions", error);
    }
};
setTimeout(() => {
    console.log("Cron job started");

    // Runs at 8:00 AM EST every day
    cron.schedule("0 8 * * *", cronFunctions, {
        scheduled: true,
        timezone: "America/New_York"
    });
    
    // Runs at 5:00 PM EST every day
    cron.schedule("50 23 * * *", cronFunctions, {
        scheduled: true,
        timezone: "America/New_York"
    });

}, 7000);
app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.use("/api", dataFetching);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
