"use strict;"
const express = require('express');
const router = express.Router();

//will add knex to get lists from DB
module.exports = (knex) => {

  router.get('/', (req, res) => {
    knex
    .select("*")
    .from("lists")
    .then((results) => {
      res.render("maps",{maps: results});
    });
  });

  router.get("/:id", (req, res) => {
    knex
    .select("id")
    .from("lists")
    .where("id", Number(req.params.id))
    .limit(1)
    .then(([result]) => {
      res.render("index",{map: result});
    });
  });


  router.post("/",(req, res) => {
    var listName = req.body.mapname;
    if( listName.length === 0){
      return res.redirect('/maps')
    }
    else {
      knex('lists').insert({
        name: listName
      })
      .returning('id')
      .then((id) => {
        return res.redirect(`/maps/${id}`);
      });
    }
  });


  router.post("/:id/delete", (req,res) => {
    knex('lists').select('name')
    .where({'id' : req.params.id})
    .del()
    .then(function (count) {
      res.redirect('/maps');
    });
  });

  router.get("/:id/points", (req, res) => {
    knex('points')
    .where('list_id', req.params.id)
    .then((points) => {
      res.json(points);
    });
  });

  router.post("/:id/points/delete", (req, res) => {
    var id = req.body.id;
    knex('points')
    .where("id", id)
    .del()
    .then((count)=>{
      res.redirect(`/maps/${req.params.id}`);
    });
  });

  router.post("/:id/points", (req, res) => {
    const { name, lat, long } = req.body;
    knex('points').insert({
      name, lat, long, list_id: req.params.id
    }).returning('id')
    .then((id) => {
      const newPoint = {
        name: name,
        lat: lat,
        long: long,
        id: id,
        list_id: req.params.id
      };
      res.redirect(`/maps/${req.params.id}`)
    });
  });

  return router;
}
