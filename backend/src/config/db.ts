const { Sequelize } = require('sequelize');
const dotenv = require("dotenv");
dotenv.config();

const SEQUELIZE = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.BD_PASS, {
        dialect: 'mysql',
        host: 'localhost',
        logging: false
    }
);

async function Connection(){
    try {
        await SEQUELIZE.authenticate();
        console.log('Connection has been established successfully.');
        await SEQUELIZE.sync();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {SEQUELIZE,Connection};