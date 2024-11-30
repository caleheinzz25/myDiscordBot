import { model, Schema } from "mongoose";

const AIChannels = model("AI_channels", new Schema({
    guild_id: {
        type: String,
        required: true,
        unique: true,
    },
    channel_id: {
        type: String,
        unique: true,
    },
    ai_name: {
        type: String,
        required: true,
        unique: true,
    },
    ai_description: {
        type: String,
        required: true,
    },
    ai_enabled: {
        type: Boolean,
        default: true, // Default true untuk aktifkan saat inisialisasi
    },
}));

export { AIChannels };
