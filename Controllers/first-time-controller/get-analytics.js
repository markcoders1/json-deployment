const { google } = require("googleapis");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const express = require("express");
const router = express.Router();

const propertyId = '269691212'; // Two properties

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

// Helper function to get the date range for the past year
function getLastYearDateRange() {
    const currentDate = new Date();
    const lastYear = new Date(currentDate);
    lastYear.setFullYear(currentDate.getFullYear() - 1); // Set to the previous year

    const startDate = lastYear.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const endDate = currentDate.toISOString().split("T")[0]; // Today’s date

    return { startDate, endDate };
}

// Function to fetch GA data for a property
async function fetchGADataForProperty(propertyId, startDate, endDate) {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [
                { name: "age" }, // Age group of visitors
                { name: "gender" }, // Gender (male/female)
            ],
            metrics: [
                { name: "activeUsers" }, // Active users
            ],
            dateRanges: [{ startDate, endDate }],
        });

        if (response.rows) {
            return response.rows.map(row => ({
                age: row.dimensionValues[0]?.value,
                gender: row.dimensionValues[1]?.value,
                activeUsers: row.metricValues[0]?.value,
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error fetching Google Analytics data for property ${propertyId}:`, error);
        return [];
    }
}

// Function to fetch data for both properties
async function fetchGAInsightsForAllProperties() {
    const { startDate, endDate } = getLastYearDateRange();

    const results = await fetchGADataForProperty(propertyId, startDate, endDate);

    return results.flat(); // Combine results from both properties
}

// Create an Express route
router.get("/analytics-insights", async (req, res) => {
    const data = await fetchGAInsightsForAllProperties();
    res.json(data.length ? data : { message: "No data available for the selected dimensions and metrics." });
});

module.exports = router;
