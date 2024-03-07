import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  date: { 
    type: String,
  },
  time: {
    type: String,
  },
  status: {
    type: String,
  },
  pdf_base64: {
    type: String,
  },
  fileName: {
    type: String,
  },

});

const Users = mongoose.model("FinetuneDetail", userSchema);
export default Users