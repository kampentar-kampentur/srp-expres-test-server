const express = require("express")
const { SRPServerSession, SRPConfig, SRPParameters, SRPRoutines } = require('tssrp6a')

const app = express()
const port = 3000
const srp6aNimbusConfig = new SRPConfig(
  new SRPParameters(),
  (p) => new SRPRoutines(p),
  );
const server = new SRPServerSession(srp6aNimbusConfig)

const users = {}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin',  req.headers.origin)
  res.header('Access-Control-Allow-Methods','OPTIONS,GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-XSRF-TOKEN')
  next()
})

app.use(express.json())
app.use(express.urlencoded())

app.post('/', (request, response) => {
  const { username, salt, verifier } = request.body
  users[username] = {salt, verifier}
  response.send()
})


app.get('/step1', (request, response) => {
  const { username } = request.query
  const B = server.step1(username, users[username].salt, users[username].verifier);
  response.send(JSON.stringify({salt: users[username].salt, B}))
})

app.post('/step2', (request, response) => {
  const { A, M1 } = request.body
  const M2 = server.step2(A, M1);
  response.send(JSON.stringify({M2}))
})

app.listen(port)
