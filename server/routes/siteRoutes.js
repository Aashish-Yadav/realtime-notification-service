const express = require('express');
const router  = express.Router();

const { getMySites, getSiteById, updateSite, deleteSite, getSiteSubscribers } = require('../controllers/sitesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',                    getMySites);
router.get('/:id',                 getSiteById);
router.put('/:id',                 updateSite);
router.delete('/:id',              deleteSite);
router.get('/:id/subscribers',     getSiteSubscribers);

module.exports = router;