import mongoose from 'mongoose';
const {Schema} = mongoose;


const windproductSchema = new Schema({
    title: String,
    image: String,
    description: String,
    price: Number,
    tipo_producto: {
            type: String,            
            enum: ['Tabla', 'Botavara', 'Vela', 'Arnés', 'Aleta', 'Foil', 'Wing', 'Varios']
    }
    
})

export const WindProduct = mongoose.model('WindProduct', windproductSchema)

