const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

router.post("/sportscard", async (req, res) => {
    try {
        const config = {
            url: "https://api.hubapi.com/crm/v3/objects/contacts/",
            method: "post",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer pat-na1-045e6834-df65-400b-b476-4080dc707d48`,
            },
            data: JSON.stringify(req.body),
        };
        console.log(config);
        const response = await axios.request(config);
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.log(error?.response?.data);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
