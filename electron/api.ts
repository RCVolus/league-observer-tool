import express from "express";

const api = express()

api.use(/(.*)/, (req, res, next) => {
  if (req.ip === '::1' || req.ip === '127.0.0.1') {
    return next()
  } else {
    res.send(403)
  }
})

export default api