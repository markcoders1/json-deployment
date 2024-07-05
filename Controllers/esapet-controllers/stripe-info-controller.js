const express = require('express')
const router = express.Router();

const EsapetStripe = require('../../Models/esapet-modals/Log.js');

//get all esapet stripe info
router.get('/get-stripe-info', async (req, res) => {
    try {
        const esapetStripe = await EsapetStripe.find();
        if( esapetStripe.length > 0 ){
            console.log('esapetStripe Fetched');

        // Formatting the timestamps in each document
        const offset = 5; // GMT+5
        const formattedStripe = esapetStripe.map(item => {
            const obj = item.toObject();
            return {
                ...obj,
                createdAt: obj.createdAt ? formatDateTime(obj.createdAt, offset) : null,
                updatedAt: obj.updatedAt ? formatDateTime(obj.updatedAt, offset) : null
            };
        });


            res.json(formattedStripe);
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


function formatDateTime(date, offset) {
    const d = new Date(date.getTime() + offset * 3600 * 1000);
    const formattedDate = d.toISOString().replace('T', ' ').substring(0, 11); // YYYY-MM-DD
    let hours = d.getUTCHours();
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${formattedDate}${hours}:${minutes} ${ampm}`;
}

module.exports = router;
