const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const { getFillings, getPressReleases, getStocksData } = require("./functions");
const cron = require("node-cron");

const { connect } = require("./config/Database");
connect();

const cronFunctions = async () => {
    try {
        await getFillings();
        await getPressReleases();
        await getStocksData();
    } catch (error) {
        console.log("Error in cronFunctions", error);
    }
};
setTimeout(() => {
    console.log("Cron job started");
    cron.schedule("0 7 * * *", cronFunctions); // This will run the cron job at 7:00 AM everyday
}, 7000);
app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
