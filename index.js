const express = require("express");
//const fetch = require('node-fetch');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const EsapetStripe = require('./Models/esapet-modals/Log.js');
const Press = require("./Models/sec-filing-modals/Press.js");


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

const sportscardController = require("./Controllers/sportscard-controller.js");
//PARENT API FOR SEC FILINGS DATA
app.use("/api", dataFetching);

//PARENT API FOR ESAPET STRIPE INFO
app.use('/esapet', stripeInfo);
app.use("/", sportscardController);

// Delete all Esapet logs 
// EsapetStripe.deleteMany({}).then(() => {
//     console.log("All documents deleted");
// }).catch((err) => {
//     console.log("Error deleting documents", err);
// });

// Getting Data for Fitlife Shopify App
//cronFunctions();

const normalizeTitle = (title) => {
    return title.trim().replace(/\s+/g, ' '); // Trim and replace multiple spaces with a single space
  };
  

const checkAndDeleteDuplicatePressReleases = async () => {
    try {
      // Fetch all press releases
      const pressReleases = await Press.find({}, 'press.meta.title');
  
      // Count occurrences of each normalized title and track the document IDs
      const titleCount = {};
      const titleDocuments = {}; // To store documents by normalized title for deletion
  
      pressReleases.forEach((press) => {
        const normalizedTitle = normalizeTitle(press.press.meta.title);
  
        if (titleCount[normalizedTitle]) {
          titleCount[normalizedTitle] += 1;
          titleDocuments[normalizedTitle].push(press._id); // Track duplicate document IDs
        } else {
          titleCount[normalizedTitle] = 1;
          titleDocuments[normalizedTitle] = [press._id]; // Track the first document ID
        }
      });
  
      // Check for duplicates based on the normalized title
      const duplicates = Object.keys(titleCount).filter((title) => titleCount[title] > 1);
  
      if (duplicates.length > 0) {
        console.log('Duplicate press releases found based on title:');
        for (const title of duplicates) {
          console.log(`Title: "${title}", Count: ${titleCount[title]}`);
  
          // Keep one document and delete the rest
          const [keepId, ...deleteIds] = titleDocuments[title];
  
          // Log which IDs will be deleted
          console.log(`Keeping: ${keepId}, Deleting: ${deleteIds}`);
  
          // Delete the duplicates from the database
          await Press.deleteMany({ _id: { $in: deleteIds } });
          console.log(`Deleted ${deleteIds.length} duplicates for title: "${title}"`);
        }
      } else {
        console.log('No duplicate press releases found based on title.');
      }
    } catch (error) {
      console.error('Error checking for or deleting duplicate press releases:', error);
    }
  };
  
  // Call the function
  checkAndDeleteDuplicatePressReleases();
    

// Call the function
//checkAndDeleteDuplicateTitles();



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

