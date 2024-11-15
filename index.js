const express = require("express");
//const fetch = require('node-fetch');
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;
const morgan = require("morgan")

// Define allowed origins
const corsOptions = {
    origin: "*", // Replace with the actual frontend domain
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow sending cookies
    allowedHeaders: ["Content-Type", "Authorization"] // Define allowed headers
};

const { connect } = require("./config/Database");
connect();
app.use(express.json());
app.use(cors(corsOptions));

app.use(morgan('tiny'))

//MAIN HOME API
app.get("/", async (req, res) => {
    res.send("WELCOME TO MARKCODERS");
});

const sportscardController = require("./Controllers/sportscard-controller.js");

app.use("/", sportscardController);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

