const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuid4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();


const File = require('../models/filemodel');
const { text } = require('stream/consumers');


// Multer configuration for storing files
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Set uploads directory
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1000 * 100 }, // Limit file size to 100KB
}).single('myfile');


// File upload route
router.post('/upload', (req, res) => {

  // Store files
  upload(req, res, async (err) => {

    // Validation for file existence
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded!' });
    }

    // Handle Multer errors
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Save file information to the database
    try {
      const file = new File({
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path,
        size: req.file.size,
      });
      const response = await file.save();

      // Return file download link
      return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
    } catch (dbError) {
      return res.status(500).json({ error: 'Database error: ' + dbError.message });
    }
  });
});


// Sending URL of Donwload Image via Link

router.post('/send',async(req,res)=>{
  const {uuid,emailTo,emailFrom} = req.body;
  

  if(!uuid || !emailTo || !emailFrom){
    res.status(422).send({error:'Fields Empty !!!'});
  }

  const file =  await File.findOne({uuid:uuid});

  if(file.sender){   // Checking if sender is not sending same file again and again
    res.status(422).send({error:'Email Already Sent !!!'});
  }

  file.sender = emailFrom;
  file.reciever = emailTo;
  const response = await file.save();


  //Sending mail
  const mailer = require("nodemailer");
  const emailTemplate = require('../services/emailTemplate')

// Create a transporter with Brevo SMTP settings
let transport = mailer.createTransport({
    host: process.env.SMTP_HOST, // Brevo SMTP Host
    port: process.env.SMTP_PORT, // 587 for TLS
    secure: false, // TLS requires secure: false
    auth: {
        user: process.env.MAIL_USER, // Brevo SMTP email
        pass: process.env.MAIL_PASSWORD, // Brevo SMTP password
    },
  
    
});
    // Send the email
        let messageObj = {
            from:emailFrom, // Sender address (e.g., "Your App <your-email@example.com>")
            to:emailTo,   // Recipient address
            subject:`HARSH FILESHARE`, // Subject of the email
            text : 'File Sharing App', // Plain text body
            html : emailTemplate({
              emailFrom: emailFrom,
              downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
              size: `${parseInt(file.size / 1000)} KB`,
              expires: '24 hours'
          })// HTML body
        }

        try {
          if( !messageObj.from|| !messageObj.to || !messageObj.subject || !messageObj.text || !messageObj.html ){
          
            console.error("Missing required parameters:");
          }
        let info = await transport.sendMail(messageObj,(error,info)=>{
            if(error) throw error;
            console.log("Email Sent !!!",info);
          });
    } catch (error) {
        console.error("Error sending email:", error);
    }
   
  res.send({success:true});


})




module.exports = router;
