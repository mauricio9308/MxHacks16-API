/*
* Middleware for params validation
* @paramKey The key of the param on params
*/
module.exports = function(paramKey, validateId){

    var middleware = function(req, res, next){
        if(!paramKey){
            console.log('Missing param key');
            return res.status(400).send({
               message: 'No se encontró el id del parámetro'
            });
        }

        console.log('Validating param ' + paramKey);
        var mongoose = require('mongoose');

        /*Validates the existence of params*/
        if(!req.params[paramKey]){
            console.log('Missing param');
            return res.status(400).send({
               message: 'No se encontró el parámetro'
            });
        }

        if(!req.params[paramKey]){
            console.log('Missing ' + req.params[paramKey]);
            return res.status(400).json({
                message: "Debes de proveer " + req.params[paramKey]
            });
        }

        /*Validates if is a mongo id*/
        if(validateId){
            if(!mongoose.Types.ObjectId.isValid(req.params[paramKey])){
                console.log('Invalid ' + req.params[paramKey]);
                return res.status(400).json({
                    message: "El parámetro \'" + req.params[paramKey] + "\' es inválido"
                });
            }
        }

        console.log('Params ok');
        //Success
        return next();
    };

    return middleware;
};
