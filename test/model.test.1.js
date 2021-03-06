/** 
 * application: sicinfo-model
 * 
 */

const { Sync, Model, Collection } = require(`../lib/model`)
const tape = require(`tape`)

let count = 1;
const t1 = (label, result, test) => tape(`${count++}.${label}`, t => {

  (assert => t.assert(result === assert, `${result} - ${assert}`))(test());
  t.end();
  console.log('-'.repeat(80))

});

const j0 = JSON.stringify;
const t2 = (label, result, test) => t1(label, j0(result), () => j0(test()))

console.log('inicia -->\n')


// // Sync
// t1(`1 sync constructor`, true, () => !!new Sync(`a`));
// t1(`2 sync constructor`, true, () => !!new Sync({ 'url': `a` }));
// t1(`3 sync constructor`, true, () => !!new Sync());
// t1(`4 sync constructor`, true, () => !!new Sync(1));
// t1(`5 sync constructor`, true, () => !!new Sync(true));
// t1(`6 sync constructor`, true, () => !!new Sync({}));
// t1(`7 sync constructor`, true, () => !!new Sync(false));
// t1(`8 sync constructor`, true, () => !!new Sync(1 == 1));
// t1(`9 sync constructor`, true, () => !!new Sync(1 == 2));

// console.log('='.repeat(80))

// t1(`1 sync url`, `a`, () => new Sync(`a`).$url())
// t1(`2 sync url`, `1`, () => new Sync(1).$url())
// t1(`3 sync url`, `true`, () => new Sync(true).$url())
// t1(`4 sync url`, `true`, () => new Sync(1 == 1).$url())
// t1(`5 sync url`, `false`, () => new Sync(false).$url())
// t1(`6 sync url`, `false`, () => new Sync(1 == 2).$url())
// t1(`7 sync url`, undefined, () => new Sync().$url())
// t1(`8 sync url`, undefined, () => new Sync({}).$url())
// t1(`9 sync url`, undefined, () => new Sync(null).$url())
// t1(`10 sync url`, `a`, () => new Sync().$url('a'))
// t1(`11 sync url`, `1`, () => new Sync().$url(1))
// t1(`12 sync url`, `true`, () => new Sync().$url(true))
// t1(`13 sync url`, `true`, () => new Sync().$url(1 == 1))
// t1(`14 sync url`, `false`, () => new Sync().$url(false))
// t1(`15 sync url`, `false`, () => new Sync().$url(1 == 2))
// t1(`16 sync url`, undefined, () => new Sync().$url({}))
// t1(`17 sync url`, undefined, () => new Sync().$url(null))

// console.log('='.repeat(80))

// t2(`1 sync parse`, undefined, () => new Sync().$parse())
// t2(`1 sync parse`, [], () => new Sync().$parse([]))
// t2(`2 sync parse`, [[]], () => new Sync().$parse([[]]))
// {
//   let a = [{ 'a': 'a', 'b': 1 }, { 'a': 'b', 'b': 2 }]
//   let b = [['a', 'b'], ['a', 1], ['b', 2]]
//   let c = { 'models': [] }
//   let d = { 'cid': 'a' }
//   let e = { 'a': a }
//   let f = { 'a': b }
//   let g = { 'a': 'a' }

//   t2(`3 sync parse`, a, () => new Sync().$parse.call(c, b))
//   t2(`4 sync parse`, b, () => new Sync().$parse(b))
//   t2(`5 sync parse`, g, () => new Sync().$parse.call(d, g))
//   t2(`6 sync parse`, e, () => new Sync().$parse.call(d, f))
// }

// console.log('='.repeat(80))

// t1(`1 model constructor`, true, () => !!new Model());
// t1(`2 model constructor`, true, () => !!new Model(null, 'aa'));
// t1(`3 model constructor`, true, () => !!new Model(null, { 'url': 'a' }));
// t1(`4 model constructor`, true, () => !!new Model({ 'aa': 'aa' }, { 'url': 'a' }));

// {
//   let c1 = new Collection();

//   let a1 = { 'nome': 'jose' }
//   let a2 = { 'nome': 'maria' }
//   let a3 = { 'id': 'a', 'nome': 'margarida', 'idade': 35 }

//   let m1 = new Model()

//   let m2 = new Model(null, { 'idAttribute': 'a', 'cidPrefix': 'x' })
//   m2.$set('idade', 25)
//   m2.$set({ 'nome': 'maria' })

//   let m3 = new Model(a1, {
//     'defaults': a2,
//     'collection': c1
//   })

//   let m4 = new Model(a3)
//   m4.$unset('nome')
//   m4.$unset({ 'idade': undefined })

//   let m5 = new Model(a3)
//   m5.$clear()

//   t1(`1 model $getId`, undefined, () => m1.$getId());
//   t1(`2 model $getId`, 'a', () => m4.$getId());

//   console.log('='.repeat(80))

//   t1(`1 model idAttribute`, 'id', () => m1.$.idAttribute);
//   t1(`2 model idAttribute`, 'a', () => m2.$.idAttribute);

//   console.log('='.repeat(80))

//   t1(`1 model cid`, 'm_1', () => m1.$.cid);
//   t1(`2 model cid`, 'x_2', () => m2.$.cid);
//   t1(`3 model cid`, 'm_3', () => m3.$.cid);

//   console.log('='.repeat(80))

//   t2(`1 model defaults`, {}, () => m1.$.defaults);
//   t2(`2 model defaults`, a2, () => m3.$.defaults);

//   console.log('='.repeat(80))

//   t1(`1 model collection`, undefined, () => m1.$.collection);
//   t1(`2 model collection`, c1, () => m3.$.collection);

//   console.log('='.repeat(80))

//   t2(`1 model attributes`, {}, () => m1.$.attributes);
//   t2(`2 model attributes`, a1, () => m3.$.attributes);
//   t2('3 model attributes', { 'idade': 25, 'nome': 'maria' }, () => m2.$.attributes)
//   t2('4 model attributes', { 'id': 'a' }, () => m4.$.attributes)

//   console.log('='.repeat(80))

//   t2('1 model $toJSON', { 'idade': 25, 'nome': 'maria' }, () => m2.$toJSON())
//   t2('2 model $toJSON', {}, () => m5.$toJSON())

//   console.log('='.repeat(80))

//   t1(`1 model isNew`, true, () => m1.$isNew())
//   t1(`2 model isNew`, false, () => m4.$isNew())

//   console.log('='.repeat(80))

//   t1(`1 model $hasChanged`, false, () => m1.$hasChanged())
//   t1(`2 model $hasChanged`, true, () => m2.$hasChanged())
//   t1(`3 model $hasChanged`, true, () => m2.$hasChanged('nome'))
//   t1(`4 model $hasChanged`, false, () => m4.$hasChanged('nome'))
//   t1(`5 model $hasChanged`, false, () => m5.$hasChanged())

//   console.log('='.repeat(80))

//   t2(`1 model $changedAttributes`, {}, () => m5.$changedAttributes())

//   console.log('='.repeat(80))

//   t1('1 model get', undefined, () => m1.nome);

//   console.log('='.repeat(80))

//   t1('1 model has', false, () => m1.$has('nome'));

// console.log('='.repeat(80))
// }


// {
//   let m1 = []

//   t1(`1 collection constructor`, true, () => !!new Collection());
//   console.log('='.repeat(80))
// }

// {
//   class M extends Model {
//     constructor(a,o = {}) {
//       o.idAttribute = 'x'
//       super(a,o)
//     }
//   }

//   let c1 = new Collection();
//   let c2 = new Collection(null, {'model': M});

//   t1('1 collection $modelId', undefined, () => c1.$modelId())
//   t1('2 collection $modelId', undefined, () => c1.$modelId({}))
//   t1('3 collection $modelId', 'a', () => c1.$modelId({ 'id': 'a' }))
//   t1('4 collection $modelId', 'a', () => c2.$modelId({ 'x': 'a' }))
//   console.log('='.repeat(80))
// }

// {
//   let m2 = new Model()
//   let c2 = new Collection([m2])

//   let m3 = new Model()
//   let c3 = new Collection([m3]).$removeReference(m3)

//   t2('1 collection $removeReference', c2, () => m2.$.collection)

//   console.log('='.repeat(80))
// }






















// // t1(`model`, `m_1`, () => new Model().cid);

// // t1(`model`, `x_2`, () => new Model(null, { `cidPrefix`: `x` }).cid);

// // t1(`model`, `m_3`, () => new Model().cid);

// // t1(`model`, `s`, () => new Model({ `a`: `s` }).get(`a`));

// // t1(`model`, JSON.stringify({ `a`: `a`, `b`: `b` }), () => {

// //   let model = new Model();

// //   model.set(`a`, `a`)
// //   model.set({ `b`: `b` })

// //   return JSON.stringify(model.toJSON())

// // })

// // t1(`model`, `z`, () => {

// //   let model = new Model();

// //   model.set(`id`, `z`)

// //   return model.getId()

// // })


// // t1(`model isNew`, true, () => {

// //   let model1 = new Model(null, { `idAttribute`: `x` });

// //   let model2 = new Model({ `id`: `z` })

// //   return !model2.isNew() && model1.isNew()

// // })

// // t1(`model unset`, true, () => {

// //   let model = new Model({ `x`: `x` });

// //   model.unset(`x`, `z`)

// //   return !model.has(`x`)

// // })

// // // t1(`model fetch`, `test`, async () => {

// // //   let model = new Model({`url`: `package.json`});

// // //   await model.fetch();

// // //   console.log(model)


// // //   return model.get(`name`)

// // // })

// // t1(`model unset`, true, () => {

// //   let model = new Model({ `x`: `x` });

// //   model.unset(`x`, `z`)

// //   return !model.has(`x`)

// // })



// //======================================================================

// // t1(`collection constructor`, true, () => {

// //   let c, m, r = []

// //   m = new Model()

// //   c = new Collection(m)

// //   r.push(c instanceof Collection)

// //   c = new Collection([])

// //   r.push(c instanceof Collection)

// //   c = new Collection([m])

// //   r.push(c instanceof Collection)

// //   c = new Collection([m, new Model()])

// //   r.push(c instanceof Collection)

// //   r.push(c.length == c.models.length)

// //   c = new Collection(null, { `url`: `teste` })

// //   r.push(c instanceof Collection)

// //   return r.every(a => a)

// // })

// // t1(`collection model`, true, () => {

// //   class Teste extends Model {

// //   }

// //   let c1 = new (new Collection(null, { `model`: Teste })).model()
// //   let c2 = new (new Collection()).model()




// //   return c1 instanceof Teste && !(c2 instanceof Teste);

// // })

// // t1(`collection url`, true, () => {

// //   class C extends Collection {
// //     constructor(models, options) {
// //       super(models, Object.assign({ `url`: `teste` }, options))
// //     }

// //     url() {
// //       return `${super.$url()}/aaa`
// //     }
// //   }

// //   return `teste/aaa` == new C().$url();

// // })

// t1(`collection get / set`, true, () => {

//   let r = []
//   let m1 = new Model({`nome`:`jose`})

//   let c1 = new Collection(m1)

//   // r.push(!c1.set())
//   // r.push(!c1.set(null))
//   // r.push(!!c1.set(new Model()))

//   r.push(!!c1.set([{`nome`:`maria`}, new Model()]))

//   r.push(!!c1.set([{`nome`:`maria`}, new Model()]))

//   r.push(m1 == c1.get(m1))

//   console.log(`c1.get(m1)`, c1.get(m1))
//   console.log(c1.length)
//   console.log(c1.models.length)


//   // console.log(c1.models)
//   // c1.set(new )


//   return r.every(e => e)

// })

