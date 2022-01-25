const express = require("express")
const historyController = require('../controllers/history.controller')
const historyRequestValidator = require('../route-validation/history-request.validator')

const router = express.Router()

router.use('/', (req,res,next) => {
    next()
})
router.use('/', 
    historyRequestValidator.checkValidGroupRequested, 
    historyRequestValidator.checkParamSpecificValidities,
    historyRequestValidator.checkGroupSpecificValidities
)
//.use, because .get would only exact match 'history/'
router.use('/timestamps', historyController.getTimestamps)
router.use('/single', historyController.getSinglePoint)
router.use('/', historyController.getTelemetry)


module.exports = router
