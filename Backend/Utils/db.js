// import mongoose from 'mongoose';

// async function connectDb() {

//     try {
//         const con = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`connection sucessfull,${con.connection.host}`);


//     } catch (error) {
//         console.log('connection unsucessfull');

//     }
// }

// export default connectDb

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDb;