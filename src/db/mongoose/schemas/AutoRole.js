import { Schema, model } from "mongoose"; 

const autoRoleSchema = model("Auto_Role",
    new Schema({
        guild_id: {
          type: String,
          required: true,
          unique: true,
        },
        role_id: {
          type: String,
          required: true,
        },
    })
)

export {
  autoRoleSchema
}