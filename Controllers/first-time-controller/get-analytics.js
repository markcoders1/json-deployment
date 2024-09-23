const { google } = require("googleapis");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const express = require("express"); // Import express
const router = express.Router(); // Initialize the router

const propertyId = '269691212';
// Load your credentials (service account JSON)
const serviceAccount = require("./firstteam-analytics-551df02945c7.json");

// Initialize the Google Auth client
const auth = new google.auth.GoogleAuth({
    keyFile: "https://test.markcoders.com/first-team/firstteam-analytics.json", // Path to your service account file
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"], // Read-only access
});

// Initialize the BetaAnalyticsDataClient
const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: serviceAccount,
});

// Helper function to calculate the date range for the last two months
function getDateRange(req) {
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        const currentDate = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(currentDate.getMonth() - 1); // Set the start date to two months ago

        startDate = twoMonthsAgo.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        endDate = currentDate.toISOString().split("T")[0]; // Today’s date
    }

    return { startDate, endDate };
}

// Helper function to parse dates from 'YYYYMMDD' to 'YYYY-MM-DD'
function parseDateString(dateString) {
    // Example: Input: '20240906', Output: '2024-09-06'
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    return `${year}-${month}-${day}`;
}

// Function to fetch data from Google Analytics based on various dimensions and metrics
async function fetchGAInsights(req) {
    try {
        const { startDate, endDate } = getDateRange(req);

        // Fetch the report from Google Analytics
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [
                { name: "eventName" },
                { name: "country" },
                { name: "deviceCategory" },
                { name: "date" }, // Correct dimensions
            ],
            metrics: [
                { name: "activeUsers" },
                { name: "eventCount" },
                { name: "newUsers" },
                { name: "screenPageViews" },
            ],
            dateRanges: [{ startDate, endDate }],
        });

        if (response.rows) {
            // Process and sort the response by date
            const sortedData = response.rows
                .map((row) => ({
                    eventName: row.dimensionValues[0]?.value,
                    country: row.dimensionValues[1]?.value,
                    deviceCategory: row.dimensionValues[2]?.value,
                    date: parseDateString(row.dimensionValues[3]?.value), // Parse date here
                    activeUsers: row.metricValues[0]?.value,
                    eventCount: row.metricValues[1]?.value,
                    newUsers: row.metricValues[2]?.value,
                    screenPageViews: row.metricValues[3]?.value,
                }))
                // Sort the data by the 'date' field (ascending order)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // If you want descending order

            return sortedData;
        } else {
            return { message: "No data available for the selected dimensions and metrics." };
        }
    } catch (error) {
        console.error("Error fetching Google Analytics data:", error);
        return { error: "Failed to fetch data" };
    }
}

// Create an Express route
router.get("/analytics-insights", async (req, res) => {
    const data = await fetchGAInsights(req);
    res.json(data);
});

module.exports = router;
