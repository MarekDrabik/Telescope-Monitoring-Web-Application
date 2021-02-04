const express = require("express")
const commandController = require('../controllers/command.controller')

const router = express.Router()

router.use('/', (req,res,next)=> {
    next()
})
router.post('/', commandController.processCommand)

module.exports = router