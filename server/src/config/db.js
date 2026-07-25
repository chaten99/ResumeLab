import mongoose from 'mongoose';
import { env } from './env.js';
import logger from './logger.js';

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(env.MONGODB_URI);
        logger.info({
            host: connection.connection.host,
            database: connection.connection.name,
        }, "Connected to MongoDB");
    } catch (error) {
        logger.fatal(
            {err: error},
            "Failed to connect to MongoDB"
        );
        process.exit(1);
    }
}

export default connectDB;