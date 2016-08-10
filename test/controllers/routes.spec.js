import { expect } from 'chai'
import request from 'supertest'
import 'colors'
import server from '../../server'
import app from '../../app'
import unfluff from 'unfluff'
import config from '../../config/'

describe('Controllers', () => {
  before(() => {
  })

  after(() => {
  })

  describe('when requesting a simple page', () => {
    it('should return the result of the response of the update route ', (done) => {
      const agent = request.agent(app)

      agent
        .post('/update')
        .type('form')
        .send({'key': 'data.key', 'value': 'azerfs', 'language': 'fr'})
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          agent.get('/doc_by_language/fr').end((err, res) => {
            if (err) {
              return done(err)
            }
            console.log(res.text)
            expect(res.body).to.have.deep.property('objetFinale.fr.key', 'azerfs')
            done()
          })
        })
    })

    it('should return the result of the response of the delete route ', (done) => {
      const agent = request.agent(app)
      agent
        .delete('/delete')
        .type('form')
        .send({'key': 'data.key', 'value': 'azerfs'})
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          agent.get('/doc_by_language/fr').end((err, res) => {
            if (err) {
              return done(err)
            }
            console.log(res.body)
            expect(res.body).to.not.have.deep.property('objetFinale.fr.key')
            done()
          })
        })
    })
  })
})
/*
  expect(res.body.query).to.have.property('carto')
          expect(res.body.query.carto).to.equal('mapBox')
          expect(res.body.result).to.have.property('status')
          expect(res.body.result.status).to.equal('READY')

 //.query({carto: 'mapBox', size: 2})
// const analysis = unfluff(res.text)
 // console.log('analysis ', analysis)
 // expect(analysis.softTitle.toUpperCase()).contains('')
 console.log((res.text))
 if (err) {
   return res.send('errors/500', {msg: err})
 }
 res.send('ok')*/
