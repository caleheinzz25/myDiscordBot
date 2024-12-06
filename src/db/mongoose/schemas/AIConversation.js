import { Schema, model } from 'mongoose'

const AIConversation = model("ai_conversation",  new Schema({
    guild_id: {
        type: String,
        required: true,
        unique: true,
    },
    channel_id: {
        type: String,
        required: true,
    },
    conversation: {
        type: Array,
        required: true,
        default: [],
    }
}))

export {
    AIConversation,
}