const express = require('express');
const File = require('../models/filemodel')

const router = express.Router();


//routes

router.get('/:uuid', async(req,res)=>{
    try{
        const file = await File.findOne({uuid:req.params.uuid});
        
        if(!file){
            return res.render('download',{error:"Link Expired.."})
        }
        res.render('download',{
            uuid:file.uuid,
            filename:file.filename,
            filesize:file.size,
            downloadLink:`${process.env.APP_BASE_URL}/files/download/${file.uuid}` 
        }
    )
    
    }
    catch(err){
        return res.render('download',{error:"Something WEnt wrong.."})
    }

})


module.exports = router;
