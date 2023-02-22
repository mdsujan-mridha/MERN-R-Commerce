const mongoose = require('mongoose');

const database = (module.exports = () =>{
    const connectionParams = {
      useNewUrlParser:true,
      useUnifiedTopology:true,
    }
    try{
      mongoose.set('strictQuery', true);
       mongoose.connect("mongodb+srv://sujan:xrDIb9EREOTdIWSS@cluster0.e27xbjg.mongodb.net/panda?retryWrites=true&w=majority",
       connectionParams
       );
       console.log('database connected');
    } catch(error){
      console.log(error);
      console.log("database cant not connecting");
    }
  
  });

  module.exports = database;