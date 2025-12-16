import mongoose , {Schema} from "mongoose";
import mongooseAggreatePaginate from "mongoose-aggregate-paginate-v2";

const vedioSchema = new mongoose.Schema({
    vedioFile: {
        type: String, //cloudnary url
        required: true,
    }, 
    thumbnail: {
        type: String, //cloudnary url
        required: true,
    },
    title: {
        type: String, 
        required: true,
    },
    description: {
        type: String, 
        required: true,
    },
    duration: {
        type: Number, 
        required: true,
    },
    veiws: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true,})

vedioSchema.plugin(mongooseAggreatePaginate);

export const Vedio = mongoose.model("Vedio" ,vedioSchema )