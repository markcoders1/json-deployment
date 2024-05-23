const express = require('express')
const router = express.Router();


const Filling = require('../Models/Filling'); // Update the path
const News = require('../Models/Press');
const Stock = require('../Models/Stock');

router.get('/sec-fillings', async (req, res) => {
    try {
        const fillings = await Filling.find();
        if( fillings.length > 0 ){
            console.log('Fillings Fetched');
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

router.get('/press-release', async (req, res) => {
    try {
        const news = await News.find();
        if( news.length > 0 ){
            console.log('News Fetched');
            res.json(news);
        }
        else{
            console.log('News not found');
            res.status(404).json({ message: 'News not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/stock-quote', async (req, res) => {
    try {
        const stock = await Stock.find();
        if( stock.length > 0 ){
            console.log('Stocks Fetched');
            res.json(stock);
        }
        else{
            console.log('Stocks not found');
            res.status(404).json({ message: 'Stocks not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/stock-quote/:symbol', async (req, res) => {
    try {
        const stock = await Stock.findOne({ symbol: req.params.symbol });
        if( stock ){
            console.log('Stock Fetched');
            res.json(stock);
        }
        else{
            console.log('Stock not found');
            res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
