const express = require("express");
//const fetch = require('node-fetch');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const morgan = require("morgan");
const moment = require('moment-timezone');
const Filling = require('./Models/sec-filing-modals/Filling.js')

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
    getNewFillings
} = require("./Controllers/sec-filings-controllers/functions.js");
const cron = require("node-cron");
const dataFetching = require("./Controllers/sec-filings-controllers/data-fetching-controller.js");
const { connect } = require("./config/Database");
const { get } = require("mongoose");
connect();
app.use(express.json());
app.use(cors(corsOptions));

app.use(morgan('tiny'))

async function cronFunctions() {
    try {
        console.log("Cron job running...");
        await getStocksData();
    } catch (error) {
        console.log("Error in cronFunctions", error);
    }
}
//Testing Cron Function one time
// (async () => {
//     await cronFunctions();
//     await getPressReleases();
// })();


// TEST CODE FOR CRON JOB CHECKING
// function executeCronFunctionsSeries() {
//     let executionCount = 1;

//     function executeFunction() {
//         console.log(`Executing cronFunctions for the ${executionCount}th time`);
//         cronFunctions()
//             .then(() => {
//                 console.log(`Execution ${executionCount} completed successfully`);
//             })
//             .catch(error => {
//                 console.error(`Error during execution ${executionCount}`, error);
//             });

//         executionCount++;
//         if (executionCount < 3) { // If less than three executions have occurred
//             setTimeout(executeFunction, 150000); // Schedule next execution in 2.5 minutes
//         }
//     }

//     executeFunction(); // Trigger the first execution immediately
// }

// setTimeout(() => {
//     executeCronFunctionsSeries();
//     // Additionally schedule the series to start at midnight every day
//     cron.schedule("0 0 * * *", executeCronFunctionsSeries);
// }, 10000);


// PRODUCTION CODE FOR CRON JOB SCHEDULE
setTimeout(() => {
    // Schedule the cron job to run at specific hours in the "America/New_York" timezone
    cron.schedule("0 7,10,12,14,16,18,21,1,4 * * *", () => {
        console.log('Cron function executed.');
        cronFunctions();
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });


    // Schedule the cron job for getPressReleases to run every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
        console.log('PressReleases & getNewFillings function executed every 10 minutes with Production campaign');
        await getNewFillings();
        await getPressReleases();
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
    
    console.log('Cron job has been scheduled for every 10 minutes');
}, 10000);



//MAIN HOME API
app.get("/", async (req, res) => {
    res.send("WELCOME TO MARKCODERZ");
});

//PARENT API FOR SEC FILINGS DATA
app.use("/api", dataFetching);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    console.log(`Production Campaign Id is pushed`);
});
