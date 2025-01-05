const express = require('express');
const router = express.Router();
const path = require('path')
const File = require('../models/filemodel');



router.get('/:uuid',async(req,res)=>{
    console.log('Incoming request for UUID:', req.params.uuid);
    const file = await File.findOne({uuid:req.params.uuid});
    console.log(file.path)
    if(!file){
        return res.render('download',{error:'Link Expired!!!!'});
        }

        const filePath = `${__dirname}/../${file.path}`;
        res.download(filePath); 
    
    
    });











module.exports=router;