import { expect } from 'chai'
import request from 'supertest'
import server from '../../server'
import config from '../../config/'
import unfluff from 'unfluff'
import { parseSimpleObject, getOrderedDocs, tri } from '../../lib/manageDocs'

describe('Library test', () => {
  describe('when parsing objects', () => {
    it('should return an object with the specifies of the function parseSimpleObject', (done) => {

      let obj = {language: 'fr',
        data: {
          'A': {
            'A1': {
              'A11': 'value'
            },
            'A2': {
              'A21': 'value',
              'A22': 'value'
            }
          },
          'B': {
            'B1': {
              'B11': 'value'
            }
          }
        }
      }
      let objReturn = {}
      // console.log(Object.keys(obj))
      parseSimpleObject(obj, 'data', '', objReturn, obj.language)
      console.log('objReturn ', objReturn)
      expect(objReturn).to.have.property('data.A.A1.A11').that.is.an('object').that.deep.equals({fr: 'value'})
      expect(objReturn).to.have.property('data.A.A2.A21').that.is.an('object').that.deep.equals({fr: 'value'})
      expect(objReturn).to.have.property('data.A.A2.A22').that.is.an('object').that.deep.equals({fr: 'value'})
      expect(objReturn).to.have.property('data.B.B1.B11').that.is.an('object').that.deep.equals({fr: 'value'})
      done()
    })
  })

  describe('when ordering docs', () => {
    it('should return the contents of the database sorted and displayed  ', (done) => {
      getOrderedDocs(config.langs, function (err, params) {
        if (err) {
          console.error('main.js:', err)
        }
        expect(params).to.have.property('results')
        done()
      })
    })
  })
  describe('when return objReturn', () => {
    it('should return keys in alphabetical order', (done) => {
      let tab = ['lol', 'bonln', 'arerzer', 'Buizfgzedf', 'Aagggryah', '12erzgetOrderedDocsu']
      tab.sort(tri)
      expect(tab).to.deep.equal(['12erzgetOrderedDocsu', 'Aagggryah', 'Buizfgzedf', 'arerzer', 'bonln', 'lol'])
      done()
    })
  })
})
