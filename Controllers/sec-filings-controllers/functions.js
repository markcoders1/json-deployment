const { default: axios } = require("axios");
const Filling = require("../../Models/sec-filing-modals/Filling");
const Press = require("../../Models/sec-filing-modals/Press");
const Stock = require("../../Models/sec-filing-modals/Stock");
const kscopeApiKey = process.env.KSCOPE_API_KEY;
const polygonApiKey = process.env.POLYGON_API_KEY;
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
        cloningCampaing();
      }
      else if(isPresent){
        console.log("Filling already present in DB ", filling.acc);
      }
    });
  } catch (error) {
    console.log("Error in getFillings", error);
  }
};

const getPressReleases = async () => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.kscope.io/v2/news/press-releases/FTLF?key=${kscopeApiKey}`,
      headers: {},
    };
    const response = await axios(config);
    const pressReleasesFromDB = await Press.find();
    response?.data?.data?.forEach(async (press) => {
      if (press?.meta?.stocks?.length == 1 && press?.meta?.stocks[0] === 'FTLF') {
        console.log("Press is for ==", press?.meta?.stocks[0], 'length of the stocks is == ', press?.meta?.stocks?.length );
        const isPresent = pressReleasesFromDB.find(
          (pressFromDB) =>
            pressFromDB?.press?.meta?.id === press?.meta?.id
        );
        if (!isPresent) {
          const newPress = new Press({
            press,
          });
          await newPress.save();
          cloningCampaing();
          console.log("Press saved in DB ", press?.meta?.id);
        }
        else if(isPresent){
          console.log("Press already present in DB ", press?.meta?.id);
        }
      }
    });
  } catch (error) {
    console.log("Error in getPressReleases", error);
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
