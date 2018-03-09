/**
 * applicatiion: lib/fetch
 * 
 * [0.0.2] 2018-03-07
 * 
 * [0.0.1] 2018-02-27
 * - experimental
 * 
 * ref:
 * https://www.tutorialspoint.com/backbonejs/backbonejs_collection.htm
 * 
 */

((root, factory) => {

  const uniqueid = Symbol(); root[uniqueid] = 0;

  if ('undefined' != typeof (define))
    define([], () => factory(root, a => `${a}_${++root[uniqueid]}`));

  else if ('undefined' != typeof (process) && process.versions && process.versions.node)
    module.exports = factory(root, a => `${a}_${++root[uniqueid]}`);

})(this || self || window, (root, uniqueId) => {


  const assign = Object.assign;
  const clone = (...a) => assign({}, ...a);
  const fetch = root && root.fetch;
  const isArray = Array.isArray;

  class Sync {

    constructor(options) {
      let $ = {}
      Object.defineProperty(this, '$', { 'value': $, 'writable': false })
    }

    url(options = {}) {
      let { $ } = this
      let { url, param } = options

      if (param) {
        if (isArray(param)) param = `${param.join('/')}`
        if (!param.startsWith('/')) param = `/${param}`
      }

      return `${url || $.url || ''}${param || ''}`
    }

    static parse(arg) {

      if (!(
        isArray(arg) &&
        arg.length > 1 &&
        isArray(arg[0]) &&
        arg[0].every(a => 'string' == typeof (a))
      )) return arg;

      return arg.slice(1).map(vals => {
        let obj = {};
        arg[0].some((key, ind) => { obj[key] = vals[ind] });
        return obj;
      })

    }

    static sync(options) {

      let $this = this;

      return new Promise((resolve, reject) => {
        fetch($this.url(options), options)
          .then(resp => {
            resp.ok ? resolve(resp) : reject(resp)
          })
          .catch(err => {
            reject(err)
          })
      })

    }

    static delete() { }

    static post() { }

    static patch() { }

    static fetch(options) {

      let $this = this;

      options.syncOptions = {
        'method': 'GET',
        'headers': new Headers({
          'content-type': 'application/json'
        })
      };

      return new Promise((resolve, reject) => {
        Sync.sync.call($this, options.syncOptions)
          .then(response => {
            response.json().then(attributes => {
              resolve({ attributes, response, options })
            })
          })
          .catch(err => reject(err))
      })

    }

  }

  class Model extends Sync {

    constructor(attrs, options = {}) {
      super(options);
      let $this, { $ } = $this = this

      if (options.collection) $.collection = options.collection

      $.idAttribute = options.idAttribute || 'id'
      $.defaults = options.defaults || {}
      $.cid = uniqueId(options.cidPrefix || 'm')
      $.attributes = {}

      $this.set(clone($.defaults, attrs), options)
    }

    has(attr) {
      return attr in this.$.attributes;
    }

    get(attr) {
      return this.$.attributes[attr]
    }

    getId() {
      return this.get(this.$.idAttribute)
    }

    set(attrs, val, options = {}) {

      if ('object' == typeof (attrs)) val && (options = val);
      else (key => (attrs = {})[key] = val)(attrs);

      // console.log(this);

      let $this, { $ } = $this = this;

      if (!$this.validate(attrs, options)) return false

      $.previousAttributes = clone($.attributes)

      let current = $.attributes
      let unset = options.unset

      Object.keys(attrs).some(attr => {
        if (unset) { if (attr in current) delete current[attr] }
        else if (!(attr in current && current[attr] == val)) current[attr] = attrs[attr]
      })

      if ($.idAttribute in attrs) $.id = $this.get($.idAttribute)

      return this;
    }

    unset(attr, options) {
      return this.set(attr, undefined, clone(options, { 'unset': true }))
    }

    clear(options) {
      let attrs = {}
      Object.keys(this.$.attributes).some(attr => { attrs[attr] = undefined })
      return this.set(attrs, clone(options, { 'unset': true }))
    }

    isNew() {
      return !this.has(this.$.idAttribute)
    }

    toJSON() {
      return clone(this.$.attributes)
    }

    hasChanged(attr) {
      let changed = this.changedAttributes()

      return undefined == attr ?
        !!Object.keys(changed).length :
        attr in changed
    }

    changedAttributes() {
      let { previousAttributes, attributes } = this.$
      let changed = {}

      Object.keys(attributes)
        .filter(attr => !(attr in previousAttributes && previousAttributes[attr] == attributes[attr]))
        .some(attr => { changed[attr] = attributes[attr] })

      return changed
    }

    parse(resp, options) {

      if (resp && 'object' == typeof (resp)) {
        Object.keys(resp).some(attr => {
          resp[attr] = Sync.parse(resp[attr])
        })
      }

      return resp
    }

    url(options = {}) {
      let $this, { $ } = $this = this
      let { param } = options

      if (!param && !$this.isNew()) {
        options.param = `${$this.getId()}`
      }

      return super.url(options)
    }

    fetch(options) {
      let model, { $ } = model = this
      let { idAttribute } = $

      options = assign({ 'parse': true }, options);
      idAttribute in options && model.set(idAttribute, options[idAttribute]);

      return new Promise((resolve, reject) => {

        if (model.isNew())
          reject({ 'error': 'modelo sem identificador' })

        else
          Sync.fetch.call(model, options)
            .then(({ attributes, response, options }) => {
              model.set(options.parse ? model.parse(attributes, options) : attributes, options)
              resolve({ model, response, options })
            })
      })
    }

    save(key, val, options) {

      // if (!)

    }

    validate(attrs, options) {
      return true
    }

  }

  class Collection extends Sync {

    constructor(models, options = {}) {
      super(options);

      let $this, { $ } = $this = this

      $.model = options.model || Model

      $this._reset()

      if (models) $this.reset(models, options);

      Object.defineProperty($, 'length', { 'get': () => $.models.length })
    }

    reset(models, options) {
      options = clone(options)

      let $this, { $ } = $this = this

      $.models.some(model => $this._removeReference(model, options))
      $this._reset()

      return $this.add(models, options)
    }

    add(models, options) {
      let $this = this
      return $this.set(models, clone(options, { 'add': true, 'remove': false }))
    }

    remove(models, options) {
      options = clone(options)
      const singular = !isArray(models)
      if (singular) models = [models]

      let $this = this
      let removed = $this._removeModels(models, options);

      return singular ? removed[0] : removed;
    }

    // collecion.set
    set(models, options) {

      if (undefined == models) return
      options = assign({ 'add': true, 'remove': true, 'merge': true }, options);

      let $this, { $ } = $this = this

      if (options.parse && !$this._isModel(models)) {
        models = $this.parse(models, options) || []
      }

      let { add, merge, remove } = options
      let replace = add && remove;
      let set = [], toAdd = [], toMerge = [], modelMap = {}
      let singular = !isArray(models);

      if (singular) models = [models]

      models.some((model, i) => {

        let existing = $this.get(model);

        // console.log('existing', existing)
        // console.log('add', add)
        // console.log('remove', remove)
        // console.log('merge  ----------> ', merge)

        if (existing) {

          // console.log('model  ----------> ', model.$)
          // console.log('existing  -------> ', existing.$)
          // console.log('model !== existing ', model !== existing)

          if (merge && (model.$ && model.$.cid) != existing.$.cid) {
            let attrs = $this._isModel(model) ? model.$.attributes : model;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            toMerge.push(existing);
          }

          // console.log('!modelMap[existing.$.cid]   -> ', !modelMap[existing.$.cid])

          if (!modelMap[existing.$.cid]) {
            modelMap[existing.$.cid] = true;
            set.push(existing);
          }

          models[i] = existing;
        }

        else if (add) {

          model = models[i] = $this._prepareModel(model, options);

          if (model) {
            toAdd.push(model);
            $this._addReference(model, options);
            modelMap[model.$.cid] = true;
            set.push(model);
          }

        }

      })

      if (remove) {
        $this._removeModels($.models.filter(model => undefined == modelMap[model.$.cid]), options)
      }

      // console.log('set.length', set.length)
      // console.log('replace', replace)


      if (set.length && replace) {
        $.models.length = 0
        $.models.splice(0, 0, ...set);
      }

      else if (toAdd.length) {
        $.models.splice($.length, 0, ...toAdd)
      }

      // console.log('<--- collection.set')
      // console.log('----------------------------------------------------------------')
      return singular ? models[0] : models;
    }

    modelId(attrs) {
      let { model } = this.$
      return attrs &&
        model &&
        new model(attrs).getId() ||
        undefined
    }

    // collection.get
    get(arg) {
      let $this, { $ } = $this = this

      if (undefined == arg) return undefined
      if (arg in $.byId) return $.byId[arg]
      if ('object' != typeof (arg)) return undefined
      if (!('$' in arg)) arg = { '$': arg }

      let id = $this.modelId(arg.$.attributes || arg.$)

      return id && id in $.byId ? $.byId[id] :
        arg.$.cid && arg.$.cid in $.byId ? $.byId[arg.$.cid] :
          undefined
    }

    has(arg) {
      return !!$this.get(arg)
    }

    toJSON(options) {
      let $this, { $ } = $this = this
      return $.models.map(model => model.toJSON(options));
    }

    parse(resp, opts) {
      return resp ? Sync.parse(resp) : resp
    }

    create(model, options) {
      options = clone(options)

      let $this, { $ } = $this = this

      model = $this._prepareModel(model, options)
      if (!model) return

      $this.add(model, options)

      return model.save(null, options)
    }

    fetch(options) {
      let collection, { $ } = collection = this;

      return Sync.fetch.call(collection, assign({ 'parse': true }, options))
        .then(({ attributes, response, options }) => {
          collection[options.reset ? 'reset' : 'set'](attributes, options);
          return { collection, response, options }
        })
    }

    _reset() {
      let { $ } = this
      $.models = []
      $.byId = {}
    }

    _isModel(model) {
      return model instanceof this.$.model
    }

    _prepareModel(attrs, options) {
      let $this, { $ } = $this = this

      if ($this._isModel(attrs)) {
        if (!(attrs.$.collection)) attrs.$.collection = $this
        return attrs
      }

      return new $.model(attrs, clone(options, { 'collection': $this }));
    }

    _removeModels(models, options) {
      let $this, { $ } = $this = this
      let removed = [];

      models
        .map(model => $this.get(model))
        .filter(a => a)
        .some(model => {

          // console.log('-----------------')

          // console.log(model)
          // console.log($.models)
          // console.log($.models.length)
          // console.log($.models.indexOf(model))

          $.models.splice($.models.indexOf(model), 1);

          // console.log($.models)
          // console.log($.models.length)

          // console.log('-----------------')

          removed.push(model);
          $this._removeReference(model, options);
        })

      return removed
    }

    _addReference(model, options) {
      if (!('$' in model)) return

      let $this, { $ } = $this = this
      let { cid, attributes } = model.$
      let id = $this.modelId(attributes);

      $.byId[cid] = model;
      if (id) $.byId[id] = model
    }

    _removeReference(model, options) {
      let $this, { $ } = $this = this
      let { cid, attributes, collection } = model.$
      let id = $this.modelId(attributes)

      delete $.byId[cid]
      if (id) delete $.byId[id]
      if ($this == collection) delete model.$.collection
    }

  }

  return { Collection, Model, Sync }
})

