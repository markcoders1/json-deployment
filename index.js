const jsonServer = require("json-server"); // importing json-server library
const cors = require("cors");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080; //  chose port from here like 8080, 3001

const corsOptions = {
    origin: '*',  // Allow all domains - for development only
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

server.use(cors(corsOptions));
server.use(middlewares);
server.use(router);

server.listen(port);