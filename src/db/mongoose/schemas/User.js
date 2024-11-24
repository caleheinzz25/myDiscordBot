import { Schema, model } from "mongoose";

const userSchema = model("User" , 
    new Schema({
        userId: {
          type: String,
          required: true,
        },
        guildId: {
          type: String,
          required: true,
        },
        balance: {
          type: Number,
          default: 0,
        },
        lastDaily: {
          type: Date,
          reqired: true,
        },
    })
)

export {
    userSchema
}