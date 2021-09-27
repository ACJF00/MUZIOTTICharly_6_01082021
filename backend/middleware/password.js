const schema = require('../models/password');

module.exports = (req, res, next) => {
    if (!schema.validate(req.body.password)){
        return res.status(400).json('Votre mot de passe est trop faible')
    } else{
        next()
    }
}