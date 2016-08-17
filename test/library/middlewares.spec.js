import { expect } from 'chai'
import request from 'supertest'
import server from '../../server'
import config from '../../config/'
import unfluff from 'unfluff'
import { parseSimpleObject, getOrderedDocs } from '../../lib/manageDocs'

describe('Library test', () => {

  describe('when parsing objects', () => {

    it('should return an object with the specifies of the function parseSimpleObject', (done) => {
      let obj = {data: {
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
      parseSimpleObject(obj, 'data', '', objReturn)
      console.log('objReturn ', objReturn)
      expect(objReturn).to.have.property('data.A.A1.A11', 'value')
      expect(objReturn).to.have.property('data.A.A2.A21', 'value')
      expect(objReturn).to.have.property('data.A.A2.A22', 'value')
      expect(objReturn).to.have.property('data.B.B1.B11', 'value')
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
