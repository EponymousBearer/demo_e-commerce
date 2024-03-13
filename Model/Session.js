import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  userid: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },

  messages: [
    {
       role: String,
      message: String
    }
  ],

});

const Users = mongoose.model("Sessions", userSchema);
export default Users