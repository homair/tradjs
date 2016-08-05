import { expect } from 'chai'
import request from 'supertest'
import mongoose from 'mongoose'
import 'colors'
import server from '../../server'
import app from '../../app'
import unfluff from 'unfluff'

describe('Controllers', () => {
  before(() => {
    mongoose.models = {}
    mongoose.modelSchemas = {}
  })

  after(() => {
    // mongoose.connection.close()
  })

  describe('when blablabla', () => {
    /*    it('should ... ', (done) => {
          const agent = request.agent(app)
          agent.get('/')
            .expect(200, done)
        })

        it('should .... ', (done) => {
          request(app)
            .get('...')
            .expect(200)
            .end((err, res) => {
              const analysis = unfluff(res.text)
              expect(analysis.softTitle.toUpperCase()).contains('DURANCE')
              done()
            })
        })

        it('should give json result from search with status=READY', (done) => {
          request(app)
            .get('/search')
            .query({carto: 'mapBox', size: 2})
            .end(function (err, res) {
              expect(res.body.query).to.have.property('carto')
              expect(res.body.query.carto).to.equal('mapBox')
              expect(res.body.result).to.have.property('status')
              expect(res.body.result.status).to.equal('READY')
              done()
            })
        }) */
  })
})
