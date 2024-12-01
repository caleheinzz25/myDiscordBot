import { model, Schema } from "mongoose";

// Create the model
const MusicChannel = model('MusicChannel', new Schema({
    guild_id: {
        type: String,
        required: true,
        unique: true,
    },
    volume: {
        type: Number,
        default: 100,
        min: 0,
        max: 100, // Volume should be between 0 and 100
    },
    channel_id: {
        type: String,
        required: true,
    },
    filters: {
        type: Array,
        default: [],
    },
    auto_play:{
        type: Boolean,
        default: false,
    }
}));

export { MusicChannel };
