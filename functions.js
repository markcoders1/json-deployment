const { default: axios } = require("axios");
const Filling = require("./Models/Filling");
const Press = require("./Models/Press");
const Stock = require("./Models/Stock");

const getFillings = async () => {
    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.kscope.io/v2/sec/search/0001374328?key=8bc43de0-321b-4ca0-b39c-52b60b554e89&content=sec",
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
            }
            console.log("Filling already present in DB ", filling.acc);
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
            url: "https://api.kscope.io/v2/news/press-releases/FTLF?key=8bc43de0-321b-4ca0-b39c-52b60b554e89",
            headers: {},
        };
        const response = await axios(config);
        const pressReleasesFromDB = await Press.find();
        response?.data?.data?.forEach(async (press) => {
            const isPresent = pressReleasesFromDB.find(
                (pressFromDB) =>
                    pressFromDB?.press?.meta?.id === press?.meta?.id
            );
            if (!isPresent) {
                const newPress = new Press({
                    press,
                });
                await newPress.save();
                console.log("Press saved in DB ", press?.meta?.id);
            }
            console.log("Press already present in DB ", press?.meta?.id);
        });
    } catch (error) {
        console.log("Error in getPressReleases", error);
    }
};

const getStocksData = async () => {
    try {
        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: "https://api.polygon.io/v2/aggs/ticker/LFVN/range/1/day/2022-05-16/2024-05-16?adjusted=true&sort=asc&apiKey=_l8pALqPbP40rV7IOhsWTt36AVgrwc3X",
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
            }
            console.log("Stock already present in DB ", stock?.t);
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
