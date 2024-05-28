const axios = require('axios');
const klavioApiKey = process.env.KALAVIO_API_KEY;

const cloneCampaign = async () => {
    const data = JSON.stringify({
        "data": {
            "type": "campaign",
            "attributes": {
                "new_name": "SEC Filings - Campaign"
            },
            "id": "01HYZJXN4WV88JJ11KEQEKM7XR"
        }
    });

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://a.klaviyo.com/api/campaign-clone',
        headers: { 
            'Revision': '2024-05-15', 
            'Content-Type': 'application/json', 
            'Authorization': `Klaviyo-API-Key ${klavioApiKey}`
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        console.log(response?.data?.data?.id);
        return {
            success: true,
            message: 'Campaign cloned successfully!',
            campaignId: response?.data?.data?.id
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to clone campaign',
            error: error.toString()
        };
    }
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
            'Revision': '2024-05-15', 
            'Content-Type': 'application/json', 
            'Authorization': `Klaviyo-API-Key ${klavioApiKey}`
        },
        data: data
    };

    try {
        await axios.request(config);
        return {
            success: true,
            message: 'Campaign Queued successfully!'
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to queue campaign',
            error: error.toString()
        };
    }
};

const cloningCampaing = async () => {
    const response = await cloneCampaign();
    if (response?.success) {
        console.log('Campaign cloned successfully');
        let campaignId = response?.campaignId;
        setTimeout(async () => {
            const campaign_send_response = await sendCampaign(campaignId);
            if (campaign_send_response?.success) {
                console.log(campaign_send_response?.message);
            } else {
                console.log(campaign_send_response?.message);
            }
        }, 0);
    } else {
        console.log(response?.message);
    }
};

module.exports = {
    cloningCampaing
};
