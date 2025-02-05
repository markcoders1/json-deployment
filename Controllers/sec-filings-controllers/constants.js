const axios = require('axios');
const Bottleneck = require('bottleneck');

// Klaviyo API key and bottleneck setup
const klavioApiKey = process.env.KALAVIO_API_KEY;
const limiter = new Bottleneck({
    minTime: 333, // Adjust based on API limit (3 requests per second here)
    maxConcurrent: 1, // Process one clone operation at a time
});

const cloneCampaign = async () => {

    let data = '';
    data = JSON.stringify({
        "data": {
            "type": "campaign",
            "attributes": {
                "new_name": "SEC Filings & Press Release - Campaign"
            },
            // Test Campaign Id to Clone
            //"id": "01JFK2E729665RCA617B7B4AEF"
            // Production Campaign Id to Clone
            "id": "01J6Z6AR6CXM4JPK3H2Q4MVGG9"
        }
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://a.klaviyo.com/api/campaign-clone',
        headers: { 
            'Revision': '2024-10-15', 
            'Content-Type': 'application/json', 
            'Authorization': `Klaviyo-API-Key ${klavioApiKey}`
        },
        data: data
    };

    // Wrap axios call with the limiter to enforce rate limiting
    return limiter.schedule(() => axios.request(config))
        .then(response => ({
            success: true,
            message: 'Campaign cloned successfully!',
            campaignId: response.data.data.id
        }))
        .catch(error => ({
            success: false,
            message: 'Failed to clone campaign',
            error: error.toString()
        }));

};

const sendCampaign = async (id) => {
    console.log('id of cloneed campaign == ', id);
    const data = JSON.stringify({
        "data": {
            "type": "campaign-send-job",
            "id": id
        }
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://a.klaviyo.com/api/campaign-send-jobs',
        headers: { 
            'Revision': '2024-10-15', 
            'Content-Type': 'application/json', 
            'Authorization': `Klaviyo-API-Key ${klavioApiKey}`
        },
        data: data
    };

    try {
        await axios.request(config);
        return {
            success: true,
            message: 'Campaign Queued successfully!',
            campaignId: id
        };
    } catch (error) {
        console.error('Error queuing campaign:', error.response?.data || error.toString());
        return {
            success: false,
            message: 'Failed to queue campaign',
            error: error.toString()
        };
    }
};

const cloningCampaing = async () => {
    const response = await cloneCampaign(); // Assuming you will get campaign ID as needed
    if (response.success) {
        if (response.campaignId) {
            const sendCampaignResponse = await sendCampaign(response.campaignId);
            return sendCampaignResponse;
        } else {
            return {
                success: false,
                message: 'Cloned campaign ID is invalid or missing',
            };
        }
    }
    return response;
};

module.exports = {
    cloningCampaing
};
