import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config('../.env');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected : ${conn.connection.host}`);
    }catch(err){
        console.error(`Error is ${err.message}`);
        process.exit(1);
    }
}
export default connectDB;