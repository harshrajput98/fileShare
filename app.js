//Built in MOdules
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

// created modules
const connectDB = require("./config/db");
const FilesRoutes = require('./routes/files')
const Show = require('./routes/show')
const download = require('./routes/download');


dotenv.config();
const app = express();

//Serving static files
app.use(express.static('public'));

//setting views for browser
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'/views'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//starting the database
connectDB();

app.use('/uploads', express.static('uploads'));


//routes
app.use('/api/files',FilesRoutes);
app.use('/files',Show);
app.use('/files/download',download);
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
  



app.listen(process.env.PORT,()=>{
    console.log("Server Running");
})
