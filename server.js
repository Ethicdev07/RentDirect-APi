require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const passport = require('./config/passport')
const authRoutes = require('./routes/authRoutes')


const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

//Routes

app.use('/api/auth', authRoutes);


// Connect to MongoDB
connectDB();


//Error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({error: 'something went wrong'});  
});


const PORT = process.env.port || 3000;
app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`);
})


