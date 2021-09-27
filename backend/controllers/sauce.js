const Sauce = require('../models/sauce')
const fs = require('fs')

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  sauce.save()
    .then(() => {
      res.status(201).json({
        message: 'Post saved successfully!'
      })
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      })
    }
  )
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce)
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      })
    }
  )
}

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }))
}

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
}

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces)
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      })
    }
  )
}

exports.rateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    if (req.body.like === 1 && !sauce.usersLiked.includes(req.body.userId)){
      sauce.usersLiked.push(req.body.userId)
      sauce.likes++
      sauce.save()
      res.status(201).json({ message: 'Your like has been added !' })
    }

    if (req.body.like === 1 && sauce.usersLiked.includes(req.body.userId)){
      res.status(403).json({ message: "You can't like the same sauce twice"})
    }
  
    if (req.body.like === -1 && !sauce.usersDisliked.includes(req.body.userId)){
      sauce.usersDisliked.push(req.body.userId)
      sauce.dislikes++
      sauce.save()
      res.status(201).json({ message: 'Your dislike has been added !' })
    }

    if (req.body.like === -1 && sauce.usersDisliked.includes(req.body.userId)){
      res.status(403).json({ message: "You can't dislike the same sauce twice"})
    }

    if (req.body.like === 0) {
      if (sauce.usersLiked.includes(req.body.userId)){
        sauce.usersLiked.pull(req.body.userId)
        sauce.likes--
        sauce.save()
        res.status(201).json({ message: 'Your like has been added !' })
      } else if (sauce.usersDisliked.includes(req.body.userId)) {
        sauce.usersDisliked.pull(req.body.userId)
        sauce.dislikes--
        sauce.save()
        res.status(201).json({ message: 'Your like has been added !' })
      } else {
        res.status(403).json({ message: "You didn't interact with the sauce yet"})
      }
    }
  })
}



/** 
exports.rateSauce = (req, res, next) => {
  //check if there's a like in the body
  switch (req.body.like) {
    // in case there is :
    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          // if user already liked
          if (sauce.usersLiked.find(user => user === req.body.userId)) {
            // is the user in the usersLiked array
            Sauce.updateOne({ _id: req.params.id }, {
              // decrease likes by 1 and remove user from usersLiked
              $inc: { likes: -1 },
              $pull: { usersLiked: req.body.userId },
            })
              .then(() => res.status(200).json({ message: 'Your like has been removed !' }))
              .catch(error => res.status(400).json({ error }))
          }

          // if user already disliked
          if (sauce.usersDisliked.find(user => user === req.body.userId)) {
            // check if user in the usersDisliked array
            Sauce.updateOne({ _id: req.params.id }, {
              // decrease dislikes by 1 and remove user from usersDisliked
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
            })
              .then(() => res.status(200).json({ message: 'Your dislike has been removed !' }))
              .catch(error => res.status(400).json({ error }))
          }
        })
        .catch(error => res.status(404).json({ error }))
      break

    // add like
    case 1:
      Sauce.updateOne({ _id: req.params.id }, {
        // increase likes by 1 and add user to usersLiked
        $inc: { likes: 1 },
        $push: { usersLiked: req.body.userId },
      })
        .then(() => res.status(201).json({ message: 'Your like has been added !' }))
        .catch(error => res.status(400).json({ error }))
      break

    // add dislike
    case -1:
      Sauce.updateOne({ _id: req.params.id }, {
        // increase dislikes by 1 and add user to usersDisliked
        $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId },
      })
        .then(() => res.status(201).json({ message: 'Your dislike has been added !' }))
        .catch(error => res.status(400).json({ error }))
      break

    default:
      console.error('Bad request !')
  }
}
*/