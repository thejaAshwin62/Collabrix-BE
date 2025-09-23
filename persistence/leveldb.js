import { LeveldbPersistence } from "y-leveldb";
import dotenv from "dotenv";
dotenv.config();

const dir = process.env.LEVELDB_DIR || "./y-leveldb";
const ldb = new LeveldbPersistence(dir);

export default ldb;
