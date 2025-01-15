const { default: axios } = require("axios");
const Filling = require("../../Models/sec-filing-modals/Filling");
const Press = require("../../Models/sec-filing-modals/Press");
const Stock = require("../../Models/sec-filing-modals/Stock");
const Logs = require("../../Models/sec-filing-modals/Logs");
const { cloningCampaing } = require("./constants");
const kscopeApiKey = process.env.KSCOPE_API_KEY;
const polygonApiKey = process.env.POLYGON_API_KEY;
const xml2js = require('xml2js');

const getFillings = async () => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.kscope.io/v2/sec/search/0001374328?key=${kscopeApiKey}&content=sec`,
      headers: {},
    };
    const response = await axios(config);
    const fillingsFromDB = await Filling.find();
    response?.data?.data?.forEach(async (filling) => {
      const isPresent = fillingsFromDB.find(
        (fillingFromDB) => fillingFromDB.filling?.acc === filling.acc
      );
      if (!isPresent) {
        const newFilling = new Filling({
          filling,
        });
        await newFilling.save();
        console.log("Filling saved in DB ", filling.acc);
        const res = await cloningCampaing();
        if(res.campaignId){
          const newLog = new Logs({
            doc_id: filling.acc,
            doc_type: "sec-filling",
            title: filling.Form_Desc,
            campaignId: res.campaignId
          });
          await newLog.save();
        }
        console.log("res", res);
      }
      else if(isPresent){
        console.log("Filling already present in DB ", filling.acc);
      }
    });
  } catch (error) {
    console.log("Error in getFillings", error);
  }
};

const processPressRelease = async (pressRelease) => {
  const isPresent = await Press.findOne({ press_id: pressRelease['dc:identifier'] });
  if (!isPresent) {
    console.log(`New press release: ${pressRelease.title}`);
      // Save and clone campaign
      const newPress = new Press({
        press_id:pressRelease['dc:identifier'],
        html:pressRelease.link,
        author:pressRelease['dc:publisher'],
        teaser:pressRelease.description,
        title:pressRelease.title,
        updated:pressRelease.pubDate
      })
      await newPress.save();
      const res = await cloningCampaing();
      if(res.campaignId){
        const newLog = new Logs({
          doc_id: pressRelease['dc:identifier'],
          doc_type: "press-release",
          title: pressRelease.title,
          campaignId: res.campaignId
        });
        await newLog.save();
      }
      console.log("res", res);
  }
  else{
    console.log(`Press release already present: ${pressRelease.title}`);
  }
};

const getPressReleases = async () => {
  try {
    const rssFeedUrl = "https://www.globenewswire.com/rssfeed/organization/-00Wf9DRSziJzKOt-iNMNw=="; // Replace with your RSS feed URL

    // Fetch the RSS feed
    const response = await axios.get(rssFeedUrl, { headers: { 'Content-Type': 'application/xml' } });

    // Parse the XML response
    const parsedRSS = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const pressReleases = parsedRSS?.rss?.channel?.item;

    // Iterate over the parsed press releases
    for (const pressRelease of pressReleases) {
      await processPressRelease(pressRelease);
    }
    
  } catch (error) {
    console.error("Error in parsing RSS feed or saving to DB:", error);
  }
};



const getStocksData = async () => {
  try {

    const currentDate = new Date();
    const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 2));

    // Format the dates as YYYY-MM-DD
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const twoYearsAgoStr = twoYearsAgo.toISOString().split('T')[0];
    console.log(currentDateStr, twoYearsAgoStr);
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.polygon.io/v2/aggs/ticker/FTLF/range/1/day/${twoYearsAgoStr}/${currentDateStr}?adjusted=true&sort=asc&apiKey=${polygonApiKey}`,
      headers: {},
    };
    const response = await axios(config);
    const stocksFromDB = await Stock.find();
    response?.data?.results?.forEach(async (stock) => {
      const isPresent = stocksFromDB.find(
        (stockFromDB) => stockFromDB?.stock?.t === stock?.t
      );
      if (!isPresent) {
        const newStock = new Stock({
          stock,
        });
        await newStock.save();
        console.log("Stock saved in DB ", stock?.t);
      }else if(isPresent){
        console.log("Stock already present in DB ", stock?.t);
      }
    });
  } catch (error) {
    console.log("Error in getStocksData", error);
  }
};
module.exports = {
  getFillings,
  getPressReleases,
  getStocksData,
};
