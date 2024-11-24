import { Schema, model } from "mongoose";

const userSchema = model("User" , 
    new Schema({
        user_id: {
          type: String,
          required: true,
        },
        guild_id: {
          type: String,
          required: true,
        },
        balance: {
          type: Number,
          default: 0,
        },
        last_daily: {
          type: Date,
          required: true,
        },
    })
)

export {
    userSchema
}