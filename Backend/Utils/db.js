import mongoose from 'mongoose';

async function connectDb() {

    try {
        const con = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connection sucessfull,${con.connection.host}`);


    } catch (error) {
        console.log('connection unsucessfull');

    }
}

export default connectDb