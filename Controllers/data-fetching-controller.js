const express = require('express')
const router = express.Router();
require("dotenv").config();
const app = express();
app.use(express.json());  // Middleware to parse JSON bodies


const Filling = require('../Models/Filling'); // Update the path

router.get('/fillings', async (req, res) => {
    try {
        const fillings = await Filling.find();
        if( fillings.length > 0 ){
            console.log('fillings found', fillings);
            res.json(fillings);
        }
        else{
            console.log('fillings not found');
            res.status(404).json({ message: 'Fillings not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
