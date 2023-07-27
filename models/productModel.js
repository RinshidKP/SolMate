const mongoose = require('mongoose');
const categoryModel = require('./categoryModel');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    blurb: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    sizes: {
        type: {
            6: {
                type: Number,
                default: 0
            },
            7: {
                type: Number,
                default: 0
            },
            8: {
                type: Number,
                default: 0
            },
            9: {
                type: Number,
                default: 0
            },
            10: {
                type: Number,
                default: 0
            },
            11: {
                type: Number,
                default: 0
            },
            12: {
                type: Number,
                default: 0
            },
            13: {
                type: Number,
                default: 0
            },
            14: {
                type: Number,
                default: 0
            },
            15: {
                type: Number,
                default: 0
            }
        },
        default: {}
    },
    stock: {
        type: Number,
        required: true
    },
    image: [{
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    }],
    created: {
        type: Date,
        default: Date.now()
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Product', productSchema);
