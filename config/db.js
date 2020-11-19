if (process.env.NODE_ENV == "production") {
    module.exports = { mongoURI: "mongodb+srv://admin:admin@cluster0.hm5qi.mongodb.net/<dbname>?retryWrites=true&w=majority" }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}