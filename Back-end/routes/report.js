const express=require('express');
const {handleLoginDetails,handleUploading,handleReport}=require('../controllers/report');
const { analyzeFolderController } = require('../controllers/analyzeController');
const router=express.Router();


router.post('/login',handleLoginDetails);
router.post('/photos',handleUploading);
router.get('/reports',handleReport);
router.post('/analyze', analyzeFolderController);


module.exports=router;

