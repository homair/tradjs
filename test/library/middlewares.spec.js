import { expect } from 'chai'
import config from '../../config/'
import { parseSimpleObject, getRegularOrderedDocs, getFlatOrderedDocs, tri } from '../../lib/manageDocs'

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
      expect(objReturn).to.have.property('data.A.A1.A11').that.is.an('object').that.deep.equals({fr: 'value'})
      expect(objReturn).to.have.property('data.A.A2.A21').that.is.an('object').that.deep.equals({fr: 'value'})
      expect(objReturn).to.have.property('data.A.A2.A22').that.is.an('object').that.deep.equals({fr: 'value'})
      expect(objReturn).to.have.property('data.B.B1.B11').that.is.an('object').that.deep.equals({fr: 'value'})
      done()
    })
  })

  describe('when ordering docs', () => {
    it('should return the contents of the REGULAR collection, sorted  ', (done) => {
      getRegularOrderedDocs(config.langs, function (err, params) {
        if (err) {
          done(err)
        }
        // console.log('getRegularOrderedDocs', params)
        expect(params).to.have.property('results')
        done()
      })
    })

    it('should return the contents of the FLAT collection sorted ', (done) => {
      getFlatOrderedDocs(config.langs, function (err, params) {
        if (err) {
          done(err)
        }
        // console.log('getFlatOrderedDocs', params)
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
