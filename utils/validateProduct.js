
import Joi from 'joi';
//IMPORTAR MODELOS

import ExpressError from './ExpressError.js';

const validateProduct = (req, res, next)=> {
    const windproductSchema = Joi.object({
        windproduct: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required(),
            description: Joi.string().required(),
            image: Joi.string().uri().required(),
            tipo_producto: Joi.string().required()
        }).required()
    })
    const {error} = windproductSchema.validate(req.body);
   
    if(error){
        const msg = error.details.map (el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

export default validateProduct;