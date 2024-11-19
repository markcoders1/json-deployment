const express = require("express");
//const fetch = require('node-fetch');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const morgan = require("morgan");

// Define allowed origins
const corsOptions = {
    origin: "*", // Replace with the actual frontend domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow sending cookies
    allowedHeaders: ["Content-Type", "Authorization"], // Define allowed headers
};

const {
    getFillings,
    getPressReleases,
    getStocksData,
} = require("./Controllers/sec-filings-controllers/functions.js");
const cron = require("node-cron");
const dataFetching = require("./Controllers/sec-filings-controllers/data-fetching-controller.js");
const { connect } = require("./config/Database");
connect();
app.use(express.json());
app.use(cors(corsOptions));

app.use(morgan('tiny'))

async function cronFunctions() {
    try {
        console.log("Cron job running...");
        await getFillings();
        await getPressReleases();
        await getStocksData();
    } catch (error) {
        console.log("Error in cronFunctions", error);
    }
}

setTimeout(() => {
    // Runs at 8:00 AM and 5:00 PM EST everyday
    cron.schedule("0 8,17 * * *", cronFunctions);
}, 7000);

//MAIN HOME API
app.get("/", async (req, res) => {
    res.send("WELCOME TO MARKCODERS");
});

//PARENT API FOR SEC FILINGS DATA
app.use("/api", dataFetching);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
