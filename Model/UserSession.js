import mongoose from "mongoose"

const userSchema = new mongoose.Schema({

    id: {
        type: String,
    },
  
    token: {
        type: String,
    }
});

const Users = mongoose.model("UserSession", userSchema);
export default Users