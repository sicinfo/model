/** 
 * application: sicinfo-model
 * 
 */

module.exports = (tape, { Sync }, t1, t2) => {

  console.log('inicia -->\n')

  // Sync
  {

    let sync = new Sync()

    t1(`1 sync constructor`, true, () => sync instanceof Sync)

    t1(`2 sync constructor`, 'object', () => {

      let { $ } = sync

      return typeof $
    })
  }

  {

    let sync = new Sync()
    let $this = { '$': { 'url': 'aaaa' } }
    let opt = { 'url': 'bbbb' }
    let par = { 'url': 'cccc', 'param': '1' }

    t1(`1 sync url`, '', () => sync.url())
    t1(`2 sync url`, 'aaaa', () => sync.url.call($this))
    t1(`3 sync url`, 'bbbb', () => sync.url(opt))
    t1(`4 sync url`, 'bbbb', () => sync.url.call($this, opt))
    t1(`5 sync url`, 'cccc/1', () => sync.url(par))

  }

  {
    let a = [{ 'a': 'a', 'b': 1 }, { 'a': 'b', 'b': 2 }]
    let b = [['a', 'b'], ['a', 1], ['b', 2]]

    t1(`1 sync parse`, undefined, () => Sync.parse())
    t1(`2 sync parse`, 'a', () => Sync.parse('a'))
    t2(`3 sync parse`, [], () => Sync.parse([]))
    t2(`4 sync parse`, a, () => Sync.parse(a))
    t2(`5 sync parse`, a, () => Sync.parse(b))
  }
}