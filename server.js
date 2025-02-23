require('dotenv').config();
const express = require('express');
require('./config/database');




const app = express();

app.use(express.json());

const PORT = process.env.port || 3000;

app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`);
})


