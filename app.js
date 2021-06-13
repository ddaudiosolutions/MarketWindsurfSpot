import dotenv from 'dotenv';
dotenv.config({path: 'variables.env'})

if(process.env.NODE_ENV !== "production"){
    dotenv.config()
}

//console.log(process.env.SECRET)

import express from 'express';
import mongoose from 'mongoose';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
//import Joi from 'joi';
//import bodyParser from 'body-parser'
//ACTIVAR EN CASO DE NECESITAR HACER ERROR HANDLER
import catchAsync from './utils/catchAsync.js';
import validateWindProduct from './utils/validateProduct.js';

//IMPORTAR MODELOS
import {WindProduct} from './models/marketwindsurfMod.js';
import ExpressError from './utils/ExpressError.js';
//import Joi from 'joi';
//const dbURL = process.env.DB_URL;
//CONECTAR MONGO
//'mongodb://localhost:27017/windsurf-market'
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log("Database connected")
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');


app.use(express.static('public'));
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

const productos =  WindProduct.schema.path('tipo_producto').enumValues
//app.set('views', path.join(__dirname, 'views'))

//TRABAJANDO CON LAS VIEWS Y LA BASE DE DATOS
app.get('/', (req, res) =>{    
    res.render('home')
})

app.get('/windproducts', async (req, res) =>{ 
    const windproducts = await WindProduct.find()
    res.render('windproducts/index', {windproducts, productos})
})

app.post('/windproducts', async (req, res) =>{    
    let tipoproducto = req.body.productoSel
   // console.log(JSON.stringify(tipoproducto))
    if(!tipoproducto){
        const windproducts = await WindProduct.find() 
        res.render('windproducts/index', {windproducts, productos})
    }   else {
        const windproducts = await WindProduct.find({"tipo_producto": tipoproducto})   
       // consesole.log('hola' + windproducts.tipoproducto) 
       res.render('windproducts/index', {windproducts, productos})  
    } 
})

app.get('/windproducts/new', (req, res) =>{
    res.render('windproducts/new', {productos})
})

app.post('/windproducts/new', validateWindProduct,  (req, res) => {   
    const windproduct = new WindProduct(req.body.windproduct)
    //console.log('adios' + req.body.windproduct.title)
    windproduct.save();    
    res.redirect(`/windproducts/${windproduct._id}`)
});


app.get('/windproducts/:id', catchAsync (async (req, res) =>{   
    const windproduct = await WindProduct.findById(req.params.id)
    res.render('windproducts/show', {windproduct})
}));

app.get('/windproducts/edit/:id', async (req, res) => {
    const windproduct = await WindProduct.findById(req.params.id)
    res.render('windproducts/edit', {windproduct, productos})
}) 

app.put('/windproducts/:id',  catchAsync(async (req, res)=> {
    const {id} = req.params;
    const windproduct = await WindProduct.findByIdAndUpdate(id, {...req.body.windproduct})
    res.redirect(`/windproducts/${windproduct._id}`)
}));

app.delete('/windproducts/:id', async (req, res)=> {
    const {id} = req.params;
    const windproduct = await WindProduct.findByIdAndDelete(id, {...req.body.windproduct})
    res.redirect('/windproducts');
})

app.all('*', (req, res, next)=> {
    
    next (new ExpressError('Page Not Found', 404))
})
app.use ((err, req, res, next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something Went Wrong! Try it Later!!'
    res.status(statusCode).render('error', {err})
})

//LEER LOCALHOST DE VARIABLES Y PORT
const host = process.env.HOST;
const port = process.env.port || 4000;

//ESCUCHANDO EL PUERTO
app.listen(port, host, ()=> {
    console.log(`Serving on ${port}`)
})
