var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ThumbSchema = Schema({
  url: String,
  rating: Number,
  title: String,
  img: String
});

module.exports = mongoose.model('Thumb', ThumbSchema);

