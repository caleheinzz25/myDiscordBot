import { Schema, model } from 'mongoose';

// Define the schema for reminders
const ReminderSchema = new Schema({
  guild_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  channel_id: {
    type: String,
    required: true,
  },
  reminder_date: {
    type: Date,
    required: true,
  },
  message: {
    type: String,
    default: "You have a reminder!",
  },
});

// Create the model
const Reminder = model('Reminder', ReminderSchema);

export { Reminder };
