/** 
 * application: sicinfo-model
 * 
 */

module.exports = (tape, { Model, Collection }, t1, t2, j0) => {

  console.log('inicia -->\n')

  let m1 = new Model()
  let m2 = new Model()

  let c1 = new Collection()

  let a1 = { 'nome': 'jose' }

  let o1 = {'idAttribute': 'x'}

  let m3 = new Model(a1)
  let m4 = new Model(a1, o1)

  t1(`1 model constructor`, true, () => m1 instanceof Model);
  t1(`2 model constructor`, true, () => m3  instanceof Model);
  t1(`3 model constructor`, true, () => m4 instanceof Model);

  t1(`4 model constructor`, 'object', () => {
    let {$} = m1
    return typeof $
  })

  t1(`5 model constructor`, o1.idAttribute, () => {
    let {$} = m4
    return $.idAttribute
  })

  
}
return
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


{
  // let m1 = []

  // t1(`1 collection constructor`, true, () => !!new Collection());
  // t1(`2 collection constructor`, true, () => !!new Collection(m1));
  // console.log('='.repeat(80))

  console.log('='.repeat(80))

  let m1 = new Model()
  let m2 = new Model()
  let c1 = new Collection([m1, m2])

  console.log('='.repeat(80))
  console.log(c1.$)
  console.log(c1.$.length)
  c1.$.models.some(m => console.log(m.$))

  // c1.$_removeModels([m1])

  console.log('------------------------------------------------')
  console.log(m1.$)
  console.log(c1.$)
  console.log('------------------------------------------------')

  m1.$set('id','x')
  // c1.$add(m1)


  console.log('='.repeat(80))
  console.log(c1.$)
  console.log(c1.$.length)
  c1.$.models.some(m => console.log(m.$))

  console.log('='.repeat(80))
  return
}

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

{
  let m2 = new Model()
  let c2 = new Collection([])

  // let m3 = new Model()
  // let c3 = new Collection([m3]).$removeReference(m3)

  // t2('1 collection $removeReference', c2, () => m2.$.collection)

  console.log('='.repeat(80))
}
