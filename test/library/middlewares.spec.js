import { expect } from 'chai'
import request from 'supertest'
import server from '../../server'
import config from '../../config/'
import unfluff from 'unfluff'
import { parseSimpleObject, getOrderedDocs } from '../../lib/manageDocs'

describe('Library test', () => {

  describe('when parsing objects', () => {

    it('should return an object with the specifies of the function parseSimpleObject', (done) => {
      let obj = { 'testa': { 'azea': { 'test': 'montest' } } }
      let objReturn = {}
      let keyPath = ''
      parseSimpleObject(obj, objReturn, keyPath)
      console.log('objReturn ', objReturn)
      expect(objReturn).to.have.property('testa.azea.test', 'montest')
      done()
    })
  })

  describe('when ordering docs', () => {

    it('should return the contents of the database sorted and displayed  ', (done) => {

      getOrderedDocs(config.langs, function (err, params) {
        if (err) {
          console.error('main.js:', err)
        }
        expect(params).to.have.property('objetFinale')
        done()
      })
    })
  })
})
