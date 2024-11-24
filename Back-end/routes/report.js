const express=require('express');
const {handleLoginDetails,handleUploading,handleReport}=require('../controllers/report');
const { analyzeFolderController } = require('../controllers/analyzeController');
const router=express.Router();
const {handleStoreEmotions} = require('../controllers/storeEmotions');

router.post('/login',handleLoginDetails);
router.post('/photos',handleUploading);
router.get('/reports',handleReport);
router.post('/analyze', analyzeFolderController);
router.post('/store-emotions', handleStoreEmotions);

module.exports=router;

