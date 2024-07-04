const express = require('express')
const router = express.Router();

const EsapetStripe = require('../../Models/esapet-modals/Log.js');

//get all esapet stripe info
router.get('/get-stripe-info', async (req, res) => {
    try {
        const esapetStripe = await EsapetStripe.find();
        if( esapetStripe.length > 0 ){
            console.log('esapetStripe Fetched');
            res.json(esapetStripe);
        }
        else{
            console.log('esapetStripe not found');
            res.status(404).json({ message: 'esapetStripe not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//insert the data which is recieved using this endpoint 
router.post('/post-stripe-info', async (req, res) => {
    console.log(req.body); 
    const { statusStr, stripeUrl } = req.body;
    try {
        const status = statusStr;
        const url = stripeUrl;
        console.log("the status is == ", status, "with the url", url);
        const esapetStripe = new EsapetStripe({
            status,
            url,
        });
        await esapetStripe.save();
        res.send({ received: true });
    } catch (error) {
        console.log("Error recived == ", error);
        res.send({ received: false });
    }
});

module.exports = router;
