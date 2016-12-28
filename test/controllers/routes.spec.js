import { expect } from 'chai'
import request from 'supertest'
import 'colors'
import server from '../../server'
import app from '../../app'

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
        .auth('homair', 'site2016')
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          agent.get('/doc_by_language/fr').auth('homair', 'site2016').end((err, res) => {
            if (err) {
              return done(err)
            }
            let found = false
            res.body.results.forEach((el) => {
              if (el.key === 'key' && el.fr === 'azerfs') {
                found = true
              }
            })
            expect(found).to.be.true
            done()
          })
        })
    })

    it('should return the result of the response of the delete route ', (done) => {
      const agent = request.agent(app)
      agent
        .delete('/delete')
        .type('form')
        .send({'key': 'key'})
        .auth('homair', 'site2016')
        .end((err, res) => {
          if (err) {
            return done(err)
          }

          agent.get('/doc_by_language/fr').auth('homair', 'site2016').end((err, res) => {
            if (err) {
              return done(err)
            }
            let found = false
            res.body.results.forEach((el) => {
              if (el.key === 'key' && el.fr === 'azerfs') {
                found = true
              }
            })
            expect(found).to.be.false
            done()
          })
        })
    })
  })
})
