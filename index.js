const express = require("express");
//const fetch = require('node-fetch');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const EsapetStripe = require('./Models/esapet-modals/Log.js');

const {
    getFillings,
    getPressReleases,
    getStocksData,
} = require("./Controllers/sec-filings-controllers/functions.js");
const cron = require("node-cron");
const dataFetching = require("./Controllers/sec-filings-controllers/data-fetching-controller.js");
const stripeInfo = require("./Controllers/esapet-controllers/stripe-info-controller.js");
const { connect } = require("./config/Database");
const { cloningCampaing } = require("./Controllers/sec-filings-controllers/constants.js");
const Log = require("./Models/esapet-modals/Log.js");
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

//MAIN HOME API
app.get("/", async (req, res) => {
    res.send("WELCOME TO MARKCODERS");
});

//PARENT API FOR SEC FILINGS DATA
app.use("/api", dataFetching);

//PARENT API FOR ESAPET STRIPE INFO
app.use('/esapet', stripeInfo);

// Delete all Esapet logs 
// EsapetStripe.deleteMany({}).then(() => {
//     console.log("All documents deleted");
// }).catch((err) => {
//     console.log("Error deleting documents", err);
// });

// Getting Data for Fitlife Shopify App
//cronFunctions();

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


