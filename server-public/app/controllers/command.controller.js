

module.exports = class CommandController {

    static lastUserCommand;

    static processCommand (req, res, next) {

        console.log('command from user:', req.body)
        CommandController.lastUserCommand = req.body.command;
        res.status(200).send()
    }
}