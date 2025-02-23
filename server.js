require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const passport = require('./config/passport')
const authRoutes = require('./routes/authRoutes')
const apartmentRoutes = require('./routes/apartmentRoutes')


const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());


app.use('/uploads', express.static('uploads'))
//Routes

app.use('/api/auth', authRoutes);
app.use('/api/apartments', apartmentRoutes);

app.get('/', (req,res)=>{
    res.send('RentDirect API is running!')
})


// Connect to MongoDB
connectDB();


//Error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    
    if(err.name === 'MulterError'){
        return res.status(400).json({ error: err.message});
    }

    if(err.name === 'MongoError'){
        return res.status(400).json({ error: err.message });
    }

    if(err.name === 'ValidationError'){
        return res.status(400).json({ error: Object.values(err.error).map(error => error.message) });
    }

    res.status(500).json({ error : "Something went wrong" });
});

app.use((req, res)=>{
    res.status(404).json({ error: "Route not found" });
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log(`server running on port ${PORT}`);
})


