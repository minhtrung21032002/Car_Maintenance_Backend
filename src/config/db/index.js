const mongoose = require('mongoose');
async function connect(){

    try{
        await mongoose.connect('mongodb://127.0.0.1/car_maintance');
        console.log('Conect succesful')
    }
    catch(error){
        console.log('Conect fail')
    }
}

module.exports = {connect}