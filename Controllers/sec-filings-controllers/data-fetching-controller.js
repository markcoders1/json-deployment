const express = require('express')
const router = express.Router();

const NewFilling = require('../../Models/sec-filing-modals/NewFilling');
const Filling = require('../../Models/sec-filing-modals/Filling');
const Press = require('../../Models/sec-filing-modals/Press');
const Stock = require('../../Models/sec-filing-modals/Stock');

router.get('/sec-fillings', async (req, res) => {
    try {
        const fillings = await Filling.find();
        if( fillings.length > 0 ){
            console.log('Fillings Fetched');
            //fillings.reverse();
            fillings.sort((a, b) => new Date(b.filling.Date) - new Date(a.filling.Date));
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

router.get('/new-sec-fillings', async (req, res) => {
  try {
      const newFillings = await NewFilling.find();
      if( newFillings.length > 0 ){
          console.log('New Fillings Fetched');
          //fillings.reverse();
          newFillings.sort((a, b) => new Date(b.fillingDate) - new Date(a.fillingDate));
          res.json(newFillings);
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
      // Fetch all press releases
      const news = await Press.find();
  
      if (news.length > 0) {
        console.log('News Fetched');
  
        // Sort by the 'updated' date, from most recent to oldest
        news.sort((a, b) => {
          const dateA = new Date(a.updated);
          const dateB = new Date(b.updated);
          return dateB - dateA; // Most recent first
        });
  
        res.json(news);
      } else {
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
            // stock.reverse();
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


module.exports = router;
