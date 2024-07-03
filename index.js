const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const {
    getFillings,
    getPressReleases,
    getStocksData,
} = require("./Controllers/functions.js");
const cron = require("node-cron");
const dataFetching = require("./Controllers/data-fetching-controller.js");
const { connect } = require("./config/Database");
const { cloningCampaing } = require("./Controllers/constants.js");
connect();
app.use(express.json());
app.use(cors());

async function cronFunctions() {
    try {
        console.log("Cron job running...");
        await getFillings();
        await getPressReleases();
        await getStocksData();
        console.log("Data has been updated successfully to the DB");
    } catch (error) {
        console.log("Error in cronFunctions", error);
    }
}

async function wakeUp() {
    try {
        console.log("Waking up the server...");
    } catch (error) {
        console.log("Error in wakeUp", error);
    }
}
setTimeout(() => {
    // Runs at 8:00 AM and 5:00 PM EST everyday
    cron.schedule("0 8,17 * * *", cronFunctions);
    cron.schedule("* * * * *", wakeUp);
}, 7000);

app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.use("/api", dataFetching);

app.post('/stripe-info', async (req, res) => {
    console.log(req.data); 
    try {
    const status = req.body.statusStr;
    const url = req.body.stripeUrl;
    console.log('the status is == ', status, 'with the url', url);
    
    res.send({ received: true });
    } catch (error) {
        console.log('Error recived == ', error)
        res.send({ received: false });
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});