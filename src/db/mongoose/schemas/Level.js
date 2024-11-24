import { Schema, model } from "mongoose";

const levelSchema = model('Level', new Schema({
    user_id:{
        type: String,
        required: true,
    },
    guild_id: {
        type: String,
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 0,
    }
}))

export { 
    levelSchema
}